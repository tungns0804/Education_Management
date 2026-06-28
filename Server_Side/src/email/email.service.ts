import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  // ----------------------------------------------------------------
  // Gửi thông tin tài khoản sau khi admin tạo người dùng mới
  // ----------------------------------------------------------------
  async sendAccountCredentials(opts: {
    personalEmail: string;
    schoolEmail:   string;
    password:      string;
    fullName:      string;
    role:          'student' | 'teacher';
  }) {
    const { personalEmail, schoolEmail, password, fullName, role } = opts;
    const roleLabel = role === 'student' ? 'Sinh viên' : 'Giảng viên';

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a3a6b 0%,#2563eb 100%);padding:32px 40px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-.02em;">EduManage</div>
          <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;">University Suite</div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 6px;font-size:15px;color:#374151;">Xin chào <strong>${fullName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:14.5px;color:#6b7280;line-height:1.6;">
            Tài khoản <strong>${roleLabel}</strong> của bạn đã được tạo thành công trên hệ thống <strong>EduManage</strong>.
            Vui lòng dùng thông tin bên dưới để đăng nhập.
          </p>

          <div style="background:#f0f4ff;border-radius:10px;padding:22px 26px;margin-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:13px;color:#6b7280;padding-bottom:10px;width:40%;">Email trường (đăng nhập)</td>
                <td style="font-size:14px;font-weight:700;color:#1d4ed8;padding-bottom:10px;">${schoolEmail}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#6b7280;">Mật khẩu tạm thời</td>
                <td>
                  <span style="display:inline-block;background:#1d4ed8;color:#fff;font-size:15px;font-weight:700;letter-spacing:.08em;padding:6px 16px;border-radius:8px;">${password}</span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background:#fff9e6;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
            <p style="margin:0;font-size:13.5px;color:#92400e;line-height:1.5;">
              <strong>Lưu ý bảo mật:</strong> Đây là mật khẩu tạm thời. Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên. Không chia sẻ thông tin này với bất kỳ ai.
            </p>
          </div>

          <p style="margin:0;font-size:13.5px;color:#6b7280;line-height:1.6;">
            Nếu bạn cần hỗ trợ, vui lòng liên hệ phòng đào tạo hoặc quản trị viên hệ thống.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© 2025 EduManage · Hệ thống Quản lý Giáo dục</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      await this.transporter.sendMail({
        from:    `"EduManage" <${process.env.SMTP_USER}>`,
        to:      personalEmail,
        subject: '[EduManage] Thông tin tài khoản của bạn',
        html,
      });
      this.logger.log(`Đã gửi thông tin tài khoản tới ${personalEmail}`);
    } catch (err) {
      this.logger.error(`Không thể gửi email tới ${personalEmail}: ${err}`);
      // Fallback log để không làm gián đoạn luồng tạo tài khoản
      this.logger.warn(`[FALLBACK] ${schoolEmail} / ${password}`);
    }
  }

  // ----------------------------------------------------------------
  // Gửi OTP quên mật khẩu
  // ----------------------------------------------------------------
  async sendOtp(opts: {
    personalEmail: string;
    schoolEmail:   string;
    otp:           string;
    fullName:      string;
  }) {
    const { personalEmail, schoolEmail, otp, fullName } = opts;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a3a6b 0%,#2563eb 100%);padding:32px 40px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-.02em;">EduManage</div>
          <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;">Xác minh danh tính</div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:15px;color:#374151;text-align:left;">Xin chào <strong>${fullName}</strong>,</p>
          <p style="margin:0 0 28px;font-size:14.5px;color:#6b7280;line-height:1.6;text-align:left;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${schoolEmail}</strong>.
            Sử dụng mã OTP bên dưới để hoàn tất:
          </p>

          <div style="display:inline-block;background:#f0f4ff;border:2px dashed #3b82f6;border-radius:14px;padding:24px 48px;margin-bottom:28px;">
            <div style="font-size:42px;font-weight:900;letter-spacing:.18em;color:#1d4ed8;">${otp}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:8px;">Hiệu lực trong <strong>5 phút</strong></div>
          </div>

          <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;text-align:left;">
            <p style="margin:0;font-size:13.5px;color:#991b1b;line-height:1.5;">
              <strong>Không phải bạn?</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.
            </p>
          </div>

          <p style="margin:0;font-size:13px;color:#9ca3af;text-align:left;">Mã OTP chỉ dùng một lần và hết hạn sau 5 phút kể từ khi gửi.</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© 2025 EduManage · Hệ thống Quản lý Giáo dục</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      await this.transporter.sendMail({
        from:    `"EduManage" <${process.env.SMTP_USER}>`,
        to:      personalEmail,
        subject: `[EduManage] Mã OTP đặt lại mật khẩu: ${otp}`,
        html,
      });
      this.logger.log(`Đã gửi OTP tới ${personalEmail}`);
    } catch (err) {
      this.logger.error(`Không thể gửi OTP tới ${personalEmail}: ${err}`);
      this.logger.warn(`[FALLBACK OTP] ${schoolEmail} → ${otp}`);
    }
  }
}
