import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/subjects')
@UseGuards(JwtAuthGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  // Lấy danh sách môn học (lọc theo ngành nếu truyền branchId)
  @Get()
  async findAll(@Query('branchId') branchId?: string) {
    const data = await this.subjectsService.findAll(branchId);
    return { success: true, message: 'success', metadata: data };
  }

  // Lấy chi tiết một môn học theo id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.subjectsService.findOne(id);
    return { success: true, message: 'success', metadata: data };
  }

  // Tạo môn học mới
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() body: { code: string; name: string; credits: number; branchId: string }) {
    const data = await this.subjectsService.create(body);
    return { success: true, message: 'Tạo môn học thành công', metadata: data };
  }

  // Cập nhật thông tin môn học
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.subjectsService.update(id, body);
    return { success: true, message: 'Cập nhật thành công', metadata: data };
  }

  // Xóa môn học
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.subjectsService.remove(id);
    return { success: true, message: 'Xóa thành công', metadata: data };
  }
}
