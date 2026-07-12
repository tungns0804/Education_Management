import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SemestersService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy danh sách tất cả học kỳ
  findAll() {
    return this.prisma.semester.findMany({ orderBy: { name: 'asc' } });
  }

  // Lấy các học kỳ đang kích hoạt
  async findActive() {
    return this.prisma.semester.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  // Lấy danh sách tên các học kỳ đang kích hoạt
  async getActiveNames(): Promise<string[]> {
    const active = await this.prisma.semester.findMany({ where: { isActive: true }, select: { name: true } });
    return active.map(s => s.name);
  }

  // Tạo học kỳ mới
  async create(name: string) {
    const existing = await this.prisma.semester.findUnique({ where: { name } });
    if (existing) throw new ConflictException(`Học kỳ "${name}" đã tồn tại`);
    return this.prisma.semester.create({ data: { name } });
  }

  // Cập nhật tên / trạng thái kích hoạt của học kỳ
  async update(id: number, data: { name?: string; isActive?: boolean }) {
    const sem = await this.prisma.semester.findUnique({ where: { id } });
    if (!sem) throw new NotFoundException('Học kỳ không tồn tại');
    if (data.name && data.name !== sem.name) {
      const dup = await this.prisma.semester.findUnique({ where: { name: data.name } });
      if (dup) throw new ConflictException(`Học kỳ "${data.name}" đã tồn tại`);
    }
    if (data.isActive === true) {
      return this.prisma.$transaction(async (tx) => {
        await tx.semester.updateMany({ where: { isActive: true, NOT: { id } }, data: { isActive: false } });
        return tx.semester.update({ where: { id }, data });
      });
    }
    return this.prisma.semester.update({ where: { id }, data });
  }

  // Đảo trạng thái kích hoạt của học kỳ
  async toggleActive(id: number) {
    const sem = await this.prisma.semester.findUnique({ where: { id } });
    if (!sem) throw new NotFoundException('Học kỳ không tồn tại');

    if (sem.isActive) {
      return this.prisma.semester.update({ where: { id }, data: { isActive: false } });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.semester.updateMany({ where: { isActive: true }, data: { isActive: false } });
      return tx.semester.update({ where: { id }, data: { isActive: true } });
    });
  }

  // Xóa học kỳ
  async remove(id: number) {
    const sem = await this.prisma.semester.findUnique({ where: { id } });
    if (!sem) throw new NotFoundException('Học kỳ không tồn tại');
    await this.prisma.semester.delete({ where: { id } });
    return { deleted: true };
  }
}
