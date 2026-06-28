import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(departmentId?: string) {
    return this.prisma.class.findMany({
      where: { ...(departmentId && { departmentId }) },
      include: {
        teacher: { select: { id: true, fullName: true, idTeacher: true } },
        department: { select: { id: true, code: true, nameDepartment: true } },
        _count: { select: { } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, fullName: true, idTeacher: true } },
        department: true,
      },
    });
    if (!cls) throw new NotFoundException('Lớp không tồn tại');
    return cls;
  }

  async create(data: { code: string; nameClass: string; teacherId: string; departmentId: string }) {
    const existing = await this.prisma.class.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictException(`Mã lớp ${data.code} đã tồn tại`);
    return this.prisma.class.create({
      data,
      include: {
        teacher: { select: { id: true, fullName: true } },
        department: { select: { id: true, nameDepartment: true } },
      },
    });
  }

  async update(id: string, data: { code?: string; nameClass?: string; teacherId?: string; departmentId?: string }) {
    await this.findOne(id);
    return this.prisma.class.update({
      where: { id },
      data,
      include: {
        teacher: { select: { id: true, fullName: true } },
        department: { select: { id: true, nameDepartment: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.class.delete({ where: { id } });
    return { deleted: true };
  }
}
