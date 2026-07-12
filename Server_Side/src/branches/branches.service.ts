import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy danh sách ngành (lọc theo khoa nếu có)
  async findAll(departmentId?: string) {
    return this.prisma.branch.findMany({
      where: { ...(departmentId && { departmentId }) },
      include: { department: { select: { id: true, code: true, nameDepartment: true } } },
      orderBy: { code: 'asc' },
    });
  }

  // Lấy chi tiết một ngành theo id
  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!branch) throw new NotFoundException('Ngành không tồn tại');
    return branch;
  }

  // Tạo ngành mới
  async create(data: { code: string; nameBranch: string; departmentId: string }) {
    const existing = await this.prisma.branch.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictException(`Mã ngành ${data.code} đã tồn tại`);
    return this.prisma.branch.create({ data });
  }

  // Cập nhật thông tin ngành
  async update(id: string, data: { code?: string; nameBranch?: string; departmentId?: string }) {
    await this.findOne(id);
    return this.prisma.branch.update({ where: { id }, data });
  }

  // Xóa ngành
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.branch.delete({ where: { id } });
    return { deleted: true };
  }
}
