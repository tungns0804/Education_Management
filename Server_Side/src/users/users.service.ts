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
        department: true, address: true, createdAt: true, updatedAt: true,
        _count: { select: { taughtSections: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return this.omitPassword(user);
  }

  // ----------------------------------------------------------------
  // Tạo người dùng mới
  // ----------------------------------------------------------------

  private generateSchoolEmail(idStudent: string): string {
    return `${idStudent}@student.school.edu.vn`;
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  async createStudent(data: {
    fullName: string;
    idStudent: string;
    gender?: string;
    birthDay?: string;
    class?: string;
    personalEmail?: string;
    department?: string;
  }) {
    if (!data.personalEmail)
      throw new BadRequestException('Vui lòng cung cấp email cá nhân của sinh viên');

    const existing = await this.prisma.user.findFirst({ where: { idStudent: data.idStudent } });
    if (existing) throw new ConflictException(`Mã sinh viên ${data.idStudent} đã tồn tại`);

    const email = this.generateSchoolEmail(data.idStudent);
    const tempPassword = this.generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        fullName:      data.fullName,
        email,
        password:      hashed,
        role:          Role.student,
        idStudent:     data.idStudent,
        class:         data.class,
        gender:        data.gender as any,
        birthDay:      data.birthDay ? new Date(data.birthDay) : undefined,
        department:    data.department,
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
    idTeacher: string;
    email: string;
    personalEmail?: string;
    degree?: string;
    phone?: string;
    gender?: string;
    birthDay?: string;
    department?: string;
  }) {
    if (!data.personalEmail)
      throw new BadRequestException('Vui lòng cung cấp email cá nhân của giảng viên');

    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email đã tồn tại');

    const tempPassword = this.generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        fullName:      data.fullName,
        email:         data.email,
        password:      hashed,
        role:          Role.teacher,
        idTeacher:     data.idTeacher,
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
      schoolEmail:   data.email,
      password:      tempPassword,
      fullName:      data.fullName,
      role:          'teacher',
    });
    return this.omitPassword(user);
  }

  async bulkImportStudents(rows: Array<{
    fullName: string;
    idStudent: string;
    gender?: string;
    birthDay?: string;
    class?: string;
    personalEmail?: string;
    department?: string;
  }>) {
    const results = await Promise.allSettled(rows.map(r => this.createStudent(r)));
    const created = results.filter(r => r.status === 'fulfilled').length;
    const failed  = results.filter(r => r.status === 'rejected').length;
    return { created, failed };
  }

  // ----------------------------------------------------------------
  // Cập nhật người dùng
  // ----------------------------------------------------------------

  async update(id: string, data: Record<string, unknown>) {
    await this.findById(id);
    // Không cho phép thay đổi password, email, role qua endpoint này
    const { password: _pw, email: _em, role: _r, ...safeData } = data as any;
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...safeData,
        birthDay: safeData.birthDay ? new Date(safeData.birthDay) : undefined,
      },
    });
    return this.omitPassword(user);
  }

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
