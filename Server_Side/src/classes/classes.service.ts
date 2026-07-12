import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy danh sách lớp (lọc theo ngành nếu có)
  async findAll(branchId?: string) {
    return this.prisma.class.findMany({
      where: { ...(branchId && { branchId }) },
      include: {
        teacher: { select: { id: true, fullName: true, idTeacher: true } },
        branch: { select: { id: true, code: true, nameBranch: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  // Lấy chi tiết một lớp theo id
  async findOne(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, fullName: true, idTeacher: true } },
        branch: true,
      },
    });
    if (!cls) throw new NotFoundException('Lớp không tồn tại');
    return cls;
  }

  // Tạo lớp mới (gắn giảng viên chủ nhiệm và ngành)
  async create(data: { code: string; nameClass: string; teacherId: string; branchId: string }) {
    const existing = await this.prisma.class.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictException(`Mã lớp ${data.code} đã tồn tại`);
    return this.prisma.class.create({
      data,
      include: {
        teacher: { select: { id: true, fullName: true } },
        branch: { select: { id: true, nameBranch: true } },
      },
    });
  }

  // Cập nhật thông tin lớp
  async update(id: string, data: { code?: string; nameClass?: string; teacherId?: string; branchId?: string }) {
    await this.findOne(id);
    return this.prisma.class.update({
      where: { id },
      data,
      include: {
        teacher: { select: { id: true, fullName: true } },
        branch: { select: { id: true, nameBranch: true } },
      },
    });
  }

  // Xóa lớp
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.class.delete({ where: { id } });
    return { deleted: true };
  }
}
