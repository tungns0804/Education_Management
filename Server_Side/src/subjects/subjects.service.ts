import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(departmentId?: string) {
    return this.prisma.subject.findMany({
      where: { ...(departmentId && { departmentId }) },
      include: {
        department: { select: { id: true, code: true, nameDepartment: true } },
        _count: { select: { subjectClasses: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!subject) throw new NotFoundException('Môn học không tồn tại');
    return subject;
  }

  async create(data: { code: string; name: string; credits: number; departmentId: string }) {
    const existing = await this.prisma.subject.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictException(`Mã môn ${data.code} đã tồn tại`);
    return this.prisma.subject.create({
      data,
      include: { department: { select: { id: true, nameDepartment: true } } },
    });
  }

  async update(id: string, data: { code?: string; name?: string; credits?: number; departmentId?: string }) {
    await this.findOne(id);
    return this.prisma.subject.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.subject.delete({ where: { id } });
    return { deleted: true };
  }
}
