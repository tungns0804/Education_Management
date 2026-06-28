import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import {
  RSA_MODULUS_LENGTH,
  JWT_ALGORITHM,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  API_KEY_TTL_MS,
  BCRYPT_SALT_ROUNDS,
  LOGIN_TYPE_GOOGLE,
} from '../constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // ----------------------------------------------------------------
  // Hàm tiện ích cặp khóa RSA
  // ----------------------------------------------------------------

  private async createApiKey(userId: string) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: RSA_MODULUS_LENGTH,
    });
    return this.prisma.apiKey.create({
      data: {
        userId,
        publicKey:  publicKey.export({ type: 'spki',  format: 'pem' }) as string,
        privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }) as string,
        expireAt:   new Date(Date.now() + API_KEY_TTL_MS),
      },
    });
  }

  private sign(payload: object, privateKey: string, expiresIn: string): string {
    return jwt.sign(payload, privateKey, {
      algorithm: JWT_ALGORITHM,
      expiresIn,
    } as jwt.SignOptions);
  }

  async verifyToken(token: string): Promise<{ id: string; role: string }> {
    let userId: string;
    try {
      userId = jwtDecode<{ id: string }>(token).id;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    const apiKey = await this.prisma.apiKey.findUnique({ where: { userId } });
    if (!apiKey) throw new UnauthorizedException('Vui lòng đăng nhập lại');

    try {
      return jwt.verify(token, apiKey.publicKey, {
        algorithms: [JWT_ALGORITHM],
      }) as { id: string; role: string };
    } catch {
      throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
    }
  }

  // ----------------------------------------------------------------
  // Luồng xác thực
  // ----------------------------------------------------------------

  async login(email: string, password: string) {
    if (!email || !password)
      throw new BadRequestException('Vui lòng nhập email và mật khẩu');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    if (user.typeLogin === LOGIN_TYPE_GOOGLE)
      throw new BadRequestException('Tài khoản này đăng nhập bằng Google');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');

    // Xóa cặp khóa cũ khi đăng nhập → vô hiệu hóa token cũ còn tồn tại
    await this.prisma.apiKey.deleteMany({ where: { userId: user.id } });
    const apiKey = await this.createApiKey(user.id);

    const payload = { id: user.id, role: user.role };
    const token        = this.sign(payload, apiKey.privateKey, ACCESS_TOKEN_EXPIRES_IN);
    const refreshToken = this.sign(payload, apiKey.privateKey, REFRESH_TOKEN_EXPIRES_IN);

    const { password: _pw, ...safeUser } = user;
    return { token, refreshToken, user: safeUser };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  }

  async logout(userId: string) {
    // Xóa cặp khóa → vô hiệu hóa toàn bộ token của người dùng ngay lập tức
    await this.prisma.apiKey.deleteMany({ where: { userId } });
    return { status: 200 };
  }

  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken)
      throw new UnauthorizedException('Vui lòng đăng nhập lại');
    const decoded = await this.verifyToken(refreshToken);
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { userId: decoded.id },
    });
    if (!apiKey) throw new UnauthorizedException('Vui lòng đăng nhập lại');
    const token = this.sign(
      { id: decoded.id, role: decoded.role },
      apiKey.privateKey,
      ACCESS_TOKEN_EXPIRES_IN,
    );
    return { token };
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_SALT_ROUNDS);
  }

  private validatePasswordStrength(password: string): void {
    if (!password || password.length < 8)
      throw new BadRequestException('Mật khẩu phải có ít nhất 8 ký tự');
    if (!/[A-Z]/.test(password))
      throw new BadRequestException('Mật khẩu phải có ít nhất 1 chữ hoa (A-Z)');
    if (!/[0-9]/.test(password))
      throw new BadRequestException('Mật khẩu phải có ít nhất 1 chữ số (0-9)');
    if (!/[^A-Za-z0-9]/.test(password))
      throw new BadRequestException('Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%...)');
  }

  async forgotPassword(email: string) {
    if (!email) throw new BadRequestException('Vui lòng nhập email');
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Email không tồn tại trong hệ thống');
    if (!user.personalEmail)
      throw new BadRequestException(
        'Tài khoản chưa có email cá nhân để nhận OTP. Vui lòng liên hệ quản trị viên.',
      );

    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(plainOtp, BCRYPT_SALT_ROUNDS);
    const expireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    await this.prisma.otp.deleteMany({ where: { userId: user.id } });
    await this.prisma.otp.create({ data: { userId: user.id, otp: hashedOtp, expireAt } });

    try {
      await this.emailService.sendOtp({
        personalEmail: user.personalEmail,
        schoolEmail:   email,
        otp:           plainOtp,
        fullName:      user.fullName,
      });
    } catch {
      throw new InternalServerErrorException(
        'Không thể gửi email OTP. Vui lòng thử lại sau hoặc liên hệ quản trị viên.',
      );
    }
    return true;
  }

  async verifyOtp(email: string, otp: string) {
    if (!email || !otp) throw new BadRequestException('Thiếu thông tin xác thực');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Email không tồn tại');

    const record = await this.prisma.otp.findFirst({
      where: { userId: user.id, expireAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new BadRequestException('OTP đã hết hạn. Vui lòng gửi lại mã mới.');

    const valid = await bcrypt.compare(otp, record.otp);
    if (!valid) throw new BadRequestException('OTP không chính xác');

    return true;
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    if (!email || !otp || !newPassword)
      throw new BadRequestException('Thiếu thông tin đặt lại mật khẩu');

    this.validatePasswordStrength(newPassword);

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Email không tồn tại');

    const record = await this.prisma.otp.findFirst({
      where: { userId: user.id, expireAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new BadRequestException('OTP đã hết hạn hoặc không hợp lệ');

    const valid = await bcrypt.compare(otp, record.otp);
    if (!valid) throw new BadRequestException('OTP không chính xác');

    const hashed = await this.hashPassword(newPassword);
    await this.prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    await this.prisma.otp.deleteMany({ where: { userId: user.id } });
    // Vô hiệu hóa toàn bộ token sau khi đổi mật khẩu
    await this.prisma.apiKey.deleteMany({ where: { userId: user.id } });
    return true;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword)
      throw new BadRequestException('Vui lòng nhập đầy đủ thông tin');

    this.validatePasswordStrength(newPassword);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    const hashed = await this.hashPassword(newPassword);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    // Vô hiệu hóa toàn bộ token để bắt buộc đăng nhập lại trên mọi thiết bị
    await this.prisma.apiKey.deleteMany({ where: { userId } });
    return true;
  }
}
