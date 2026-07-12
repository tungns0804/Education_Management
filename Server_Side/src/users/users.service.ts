import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../constants/auth.constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // Loại bỏ trường password khỏi object user trước khi trả về client
  private omitPassword<T extends { password: string }>(user: T) {
    const { password: _pw, ...rest } = user;
    return rest;
  }

  // ----------------------------------------------------------------
  // Lấy danh sách người dùng
  // ----------------------------------------------------------------

  async findStudents(q?: string, classCode?: string, status?: string) {
    return this.prisma.user.findMany({
      where: {
        role: Role.student,
        ...(q && {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { idStudent: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }),
        ...(classCode && { class: classCode }),
        ...(status === 'active' && { status: { in: [UserStatus.studying, UserStatus.active] } }),
        ...(status === 'inactive' && { status: UserStatus.inactive }),
      },
      select: {
        id: true, fullName: true, email: true, idStudent: true, class: true,
        gender: true, birthDay: true, status: true, avatar: true, department: true,
        address: true, createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Tìm danh sách giảng viên theo từ khóa và khoa
  async findTeachers(q?: string, departmentId?: string) {
    return this.prisma.user.findMany({
      where: {
        role: Role.teacher,
        ...(q && {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { idTeacher: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }),
        ...(departmentId && { department: departmentId }),
      },
      select: {
        id: true, fullName: true, email: true, idTeacher: true, degree: true,
        phone: true, gender: true, birthDay: true, status: true, avatar: true,
        department: true, personalEmail: true, address: true, createdAt: true, updatedAt: true,
        _count: { select: { taughtSections: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Tìm người dùng theo id, không thấy thì báo lỗi 404
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return this.omitPassword(user);
  }

  // ----------------------------------------------------------------
  // Tự động sinh mã sinh viên / giảng viên
  // ----------------------------------------------------------------

  // Sinh N mã sinh viên liên tiếp theo pattern SV{year}{seq:4}
  private async generateStudentIds(count: number): Promise<string[]> {
    const year = new Date().getFullYear();
    const prefix = `SV${year}`;
    const existing = await this.prisma.user.findMany({
      where: { role: Role.student, idStudent: { startsWith: prefix } },
      select: { idStudent: true },
    });
    let maxSeq = 0;
    for (const u of existing) {
      const suffix = u.idStudent?.slice(prefix.length);
      if (suffix && /^\d+$/.test(suffix)) {
        maxSeq = Math.max(maxSeq, parseInt(suffix, 10));
      }
    }
    return Array.from({ length: count }, (_, i) =>
      `${prefix}${String(maxSeq + 1 + i).padStart(4, '0')}`,
    );
  }

  // Sinh N mã giảng viên liên tiếp theo pattern GV{year}{seq:3}
  private async generateTeacherIds(count: number): Promise<string[]> {
    const year = new Date().getFullYear();
    const prefix = `GV${year}`;
    const existing = await this.prisma.user.findMany({
      where: { role: Role.teacher, idTeacher: { startsWith: prefix } },
      select: { idTeacher: true },
    });
    let maxSeq = 0;
    for (const u of existing) {
      const suffix = u.idTeacher?.slice(prefix.length);
      if (suffix && /^\d+$/.test(suffix)) {
        maxSeq = Math.max(maxSeq, parseInt(suffix, 10));
      }
    }
    return Array.from({ length: count }, (_, i) =>
      `${prefix}${String(maxSeq + 1 + i).padStart(3, '0')}`,
    );
  }

  // ----------------------------------------------------------------
  // Suy ra mã khoa từ mã lớp (Class → Branch → Department)
  // User.department lưu mã khoa (Department.code) — dashboard đếm theo mã này
  // ----------------------------------------------------------------

  private async resolveDepartmentByClass(classCode?: string | null): Promise<string | undefined> {
    if (!classCode) return undefined;
    const cls = await this.prisma.class.findUnique({
      where: { code: classCode },
      select: { branch: { select: { department: { select: { code: true } } } } },
    });
    return cls?.branch?.department?.code;
  }

  // Bản batch cho bulk import: map mã lớp → mã khoa trong một query
  private async mapDepartmentsByClass(classCodes: Array<string | undefined>): Promise<Record<string, string>> {
    const unique = [...new Set(classCodes.filter((c): c is string => !!c))];
    if (unique.length === 0) return {};
    const classes = await this.prisma.class.findMany({
      where: { code: { in: unique } },
      select: { code: true, branch: { select: { department: { select: { code: true } } } } },
    });
    return Object.fromEntries(classes.map(c => [c.code, c.branch.department.code]));
  }

  // Endpoint preview: trả về mã sẽ được cấp tiếp theo
  async getNextStudentId(): Promise<string> {
    const [id] = await this.generateStudentIds(1);
    return id;
  }

  // Xem trước mã giảng viên sẽ được cấp tiếp theo
  async getNextTeacherId(): Promise<string> {
    const [id] = await this.generateTeacherIds(1);
    return id;
  }

  // ----------------------------------------------------------------
  // Tạo người dùng mới
  // ----------------------------------------------------------------

  private generateSchoolEmail(idStudent: string): string {
    return `${idStudent.toLowerCase()}@student.school.edu.vn`;
  }

  // Sinh mật khẩu tạm ngẫu nhiên 10 ký tự để gửi qua email
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  async createStudent(data: {
    fullName: string;
    gender?: string;
    birthDay?: string;
    class?: string;
    personalEmail?: string;
    department?: string;
  }) {
    if (!data.personalEmail)
      throw new BadRequestException('Vui lòng cung cấp email cá nhân của sinh viên');

    const [idStudent] = await this.generateStudentIds(1);

    // Phòng trường hợp race condition: kiểm tra mã có bị trùng không
    const existing = await this.prisma.user.findFirst({ where: { idStudent } });
    if (existing)
      throw new ConflictException(`Mã sinh viên ${idStudent} đã tồn tại, vui lòng thực hiện lại`);

    const email = this.generateSchoolEmail(idStudent);
    const tempPassword = this.generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);
    const department = (await this.resolveDepartmentByClass(data.class)) ?? data.department;

    const user = await this.prisma.user.create({
      data: {
        fullName:      data.fullName,
        email,
        password:      hashed,
        role:          Role.student,
        idStudent,
        class:         data.class,
        gender:        data.gender as any,
        birthDay:      data.birthDay ? new Date(data.birthDay) : undefined,
        department,
        personalEmail: data.personalEmail,
        status:        UserStatus.studying,
      },
    });

    await this.emailService.sendAccountCredentials({
      personalEmail: data.personalEmail,
      schoolEmail:   email,
      password:      tempPassword,
      fullName:      data.fullName,
      role:          'student',
    });
    return this.omitPassword(user);
  }

  async createTeacher(data: {
    fullName: string;
    personalEmail?: string;
    degree?: string;
    phone?: string;
    gender?: string;
    birthDay?: string;
    department?: string;
  }) {
    if (!data.personalEmail)
      throw new BadRequestException('Vui lòng cung cấp email cá nhân của giảng viên');

    const [idTeacher] = await this.generateTeacherIds(1);
    const email = `${idTeacher.toLowerCase()}@teacher.school.edu.vn`;

    // Phòng trường hợp race condition
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing)
      throw new ConflictException(`Mã giảng viên ${idTeacher} đã tồn tại, vui lòng thực hiện lại`);

    const tempPassword = this.generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        fullName:      data.fullName,
        email,
        password:      hashed,
        role:          Role.teacher,
        idTeacher,
        degree:        data.degree,
        phone:         data.phone,
        gender:        data.gender as any,
        birthDay:      data.birthDay ? new Date(data.birthDay) : undefined,
        department:    data.department,
        personalEmail: data.personalEmail,
        status:        UserStatus.teaching,
      },
    });

    await this.emailService.sendAccountCredentials({
      personalEmail: data.personalEmail,
      schoolEmail:   email,
      password:      tempPassword,
      fullName:      data.fullName,
      role:          'teacher',
    });
    return this.omitPassword(user);
  }

  // ----------------------------------------------------------------
  // Import hàng loạt — kiểm tra toàn bộ trước, chỉ insert khi hợp lệ 100%
  // ----------------------------------------------------------------

  private validateImportRows(
    rows: Array<{ fullName?: string; personalEmail?: string }>,
  ): Array<{ row: number; reason: string }> {
    const errors: Array<{ row: number; reason: string }> = [];
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.fullName?.trim())
        errors.push({ row: i + 1, reason: 'Họ tên không được để trống' });
      if (!r.personalEmail || !emailRe.test(r.personalEmail.trim()))
        errors.push({ row: i + 1, reason: 'Email cá nhân không hợp lệ hoặc để trống' });
    }
    return errors;
  }

  async bulkImportStudents(rows: Array<{
    fullName: string;
    gender?: string;
    birthDay?: string;
    class?: string;
    personalEmail?: string;
    department?: string;
  }>) {
    // Bước 1: kiểm tra toàn bộ dữ liệu
    const errors = this.validateImportRows(rows);
    if (errors.length > 0)
      throw new BadRequestException({ message: 'Dữ liệu không hợp lệ', errors });

    // Bước 2: sinh mã sinh viên liên tiếp cho toàn bộ danh sách
    const ids = await this.generateStudentIds(rows.length);
    const deptByClass = await this.mapDepartmentsByClass(rows.map(r => r.class));

    // Bước 3: chuẩn bị hash password (bên ngoài transaction để không timeout)
    const prepared = await Promise.all(
      rows.map(async (r, i) => {
        const idStudent    = ids[i];
        const email        = this.generateSchoolEmail(idStudent);
        const tempPassword = this.generateTempPassword();
        const hashed       = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);
        return { ...r, idStudent, email, tempPassword, hashed };
      }),
    );

    // Bước 4: insert toàn bộ trong một transaction — tất cả hoặc không có gì
    const users = await this.prisma.$transaction(
      prepared.map(r =>
        this.prisma.user.create({
          data: {
            fullName:      r.fullName,
            email:         r.email,
            password:      r.hashed,
            role:          Role.student,
            idStudent:     r.idStudent,
            class:         r.class,
            gender:        r.gender as any,
            birthDay:      r.birthDay ? new Date(r.birthDay) : undefined,
            department:    (r.class && deptByClass[r.class]) || r.department,
            personalEmail: r.personalEmail,
            status:        UserStatus.studying,
          },
        }),
      ),
    );

    // Bước 5: gửi email (fire-and-forget, không ảnh hưởng kết quả)
    void Promise.allSettled(
      prepared.map(r =>
        this.emailService.sendAccountCredentials({
          personalEmail: r.personalEmail!,
          schoolEmail:   r.email,
          password:      r.tempPassword,
          fullName:      r.fullName,
          role:          'student',
        }),
      ),
    );

    return { created: users.length, failed: 0 };
  }

  async bulkImportTeachers(rows: Array<{
    fullName: string;
    personalEmail?: string;
    degree?: string;
    phone?: string;
    gender?: string;
    birthDay?: string;
    department?: string;
  }>) {
    // Bước 1: kiểm tra toàn bộ dữ liệu
    const errors = this.validateImportRows(rows);
    if (errors.length > 0)
      throw new BadRequestException({ message: 'Dữ liệu không hợp lệ', errors });

    // Bước 2: sinh mã giảng viên liên tiếp
    const ids = await this.generateTeacherIds(rows.length);

    // Bước 3: chuẩn bị
    const prepared = await Promise.all(
      rows.map(async (r, i) => {
        const idTeacher    = ids[i];
        const email        = `${idTeacher.toLowerCase()}@teacher.school.edu.vn`;
        const tempPassword = this.generateTempPassword();
        const hashed       = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);
        return { ...r, idTeacher, email, tempPassword, hashed };
      }),
    );

    // Bước 4: insert toàn bộ trong một transaction
    const users = await this.prisma.$transaction(
      prepared.map(r =>
        this.prisma.user.create({
          data: {
            fullName:      r.fullName,
            email:         r.email,
            password:      r.hashed,
            role:          Role.teacher,
            idTeacher:     r.idTeacher,
            degree:        r.degree,
            phone:         r.phone,
            gender:        r.gender as any,
            birthDay:      r.birthDay ? new Date(r.birthDay) : undefined,
            department:    r.department,
            personalEmail: r.personalEmail,
            status:        UserStatus.teaching,
          },
        }),
      ),
    );

    // Bước 5: gửi email
    void Promise.allSettled(
      prepared.map(r =>
        this.emailService.sendAccountCredentials({
          personalEmail: r.personalEmail!,
          schoolEmail:   r.email,
          password:      r.tempPassword,
          fullName:      r.fullName,
          role:          'teacher',
        }),
      ),
    );

    return { created: users.length, failed: 0 };
  }

  // ----------------------------------------------------------------
  // Cập nhật người dùng
  // ----------------------------------------------------------------

  async update(id: string, data: Record<string, unknown>) {
    await this.findById(id);
    // Không cho phép thay đổi password, email, role qua endpoint này
    const { password: _pw, email: _em, role: _r, ...safeData } = data as any;

    // Khi đổi lớp: đồng bộ lại mã khoa theo lớp mới (chỉ khi lớp tra ra được khoa —
    // không đụng đến department nếu class rỗng, vd giáo viên cập nhật hồ sơ)
    if (safeData.class) {
      const department = await this.resolveDepartmentByClass(safeData.class);
      if (department) safeData.department = department;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...safeData,
        birthDay: safeData.birthDay ? new Date(safeData.birthDay) : undefined,
      },
    });
    return this.omitPassword(user);
  }

  // Đổi mật khẩu: kiểm tra mật khẩu hiện tại, cập nhật và thu hồi mọi token
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    const hashed = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    await this.prisma.apiKey.deleteMany({ where: { userId } });

    return { message: 'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.' };
  }

  // Khóa / mở khóa tài khoản người dùng
  async toggleStatus(id: string, status: 'active' | 'inactive') {
    await this.findById(id);
    const newStatus = status === 'active' ? UserStatus.active : UserStatus.inactive;
    const user = await this.prisma.user.update({ where: { id }, data: { status: newStatus } });
    return this.omitPassword(user);
  }

  // ----------------------------------------------------------------
  // Xóa người dùng
  // ----------------------------------------------------------------

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }
}
