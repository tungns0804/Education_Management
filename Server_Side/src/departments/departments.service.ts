import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        _count: { select: { branches: true, classes: true, subjects: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const dep = await this.prisma.department.findUnique({
      where: { id },
      include: {
        branches: true,
        _count: { select: { classes: true, subjects: true } },
      },
    });
    if (!dep) throw new NotFoundException('Khoa không tồn tại');
    return dep;
  }

  async create(data: { code: string; nameDepartment: string }) {
    const existing = await this.prisma.department.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictException(`Mã khoa ${data.code} đã tồn tại`);
    return this.prisma.department.create({ data });
  }

  async update(id: string, data: { code?: string; nameDepartment?: string }) {
    await this.findOne(id);
    return this.prisma.department.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.department.delete({ where: { id } });
    return { deleted: true };
  }
}
