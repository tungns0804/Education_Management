import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SemestersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.semester.findMany({ orderBy: { name: 'asc' } });
  }

  async findActive() {
    return this.prisma.semester.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async getActiveNames(): Promise<string[]> {
    const active = await this.prisma.semester.findMany({ where: { isActive: true }, select: { name: true } });
    return active.map(s => s.name);
  }

  async create(name: string) {
    const existing = await this.prisma.semester.findUnique({ where: { name } });
    if (existing) throw new ConflictException(`Học kỳ "${name}" đã tồn tại`);
    return this.prisma.semester.create({ data: { name } });
  }

  async update(id: number, data: { name?: string; isActive?: boolean }) {
    const sem = await this.prisma.semester.findUnique({ where: { id } });
    if (!sem) throw new NotFoundException('Học kỳ không tồn tại');
    if (data.name && data.name !== sem.name) {
      const dup = await this.prisma.semester.findUnique({ where: { name: data.name } });
      if (dup) throw new ConflictException(`Học kỳ "${data.name}" đã tồn tại`);
    }
    return this.prisma.semester.update({ where: { id }, data });
  }

  async toggleActive(id: number) {
    const sem = await this.prisma.semester.findUnique({ where: { id } });
    if (!sem) throw new NotFoundException('Học kỳ không tồn tại');
    return this.prisma.semester.update({ where: { id }, data: { isActive: !sem.isActive } });
  }

  async remove(id: number) {
    const sem = await this.prisma.semester.findUnique({ where: { id } });
    if (!sem) throw new NotFoundException('Học kỳ không tồn tại');
    await this.prisma.semester.delete({ where: { id } });
    return { deleted: true };
  }
}
