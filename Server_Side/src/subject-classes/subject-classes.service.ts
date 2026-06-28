import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectClassStatus } from '@prisma/client';

@Injectable()
export class SubjectClassesService {
  constructor(private readonly prisma: PrismaService) {}

  private sectionInclude = {
    subject: { select: { id: true, code: true, name: true, credits: true } },
    teacher: { select: { id: true, fullName: true, idTeacher: true, degree: true } },
    _count: { select: { enrollments: true } },
  };

  async findAll(role: string, userId: string) {
    const where =
      role === 'teacher'
        ? { teacherId: userId }
        : role === 'student'
        ? { status: SubjectClassStatus.active }
        : {};

    return this.prisma.subjectClass.findMany({
      where,
      include: this.sectionInclude,
      orderBy: { code: 'asc' },
    });
  }

  async findMySections(teacherId: string) {
    return this.prisma.subjectClass.findMany({
      where: { teacherId },
      include: this.sectionInclude,
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const sc = await this.prisma.subjectClass.findUnique({
      where: { id },
      include: this.sectionInclude,
    });
    if (!sc) throw new NotFoundException('Lớp học phần không tồn tại');
    return sc;
  }

  async findRoster(id: string) {
    await this.findOne(id);
    return this.prisma.enrollment.findMany({
      where: { subjectClassId: id },
      include: {
        student: {
          select: { id: true, fullName: true, idStudent: true, email: true, gender: true, class: true },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });
  }

  async create(data: {
    code: string;
    semester: string;
    maxStudents?: number;
    subjectId: string;
    teacherId: string;
  }) {
    const existing = await this.prisma.subjectClass.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictException(`Mã lớp học phần ${data.code} đã tồn tại`);
    return this.prisma.subjectClass.create({
      data: { ...data, maxStudents: data.maxStudents ?? 50 },
      include: this.sectionInclude,
    });
  }

  async update(
    id: string,
    data: { code?: string; semester?: string; maxStudents?: number; status?: SubjectClassStatus; teacherId?: string },
  ) {
    await this.findOne(id);
    return this.prisma.subjectClass.update({ where: { id }, data, include: this.sectionInclude });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.subjectClass.delete({ where: { id } });
    return { deleted: true };
  }
}
