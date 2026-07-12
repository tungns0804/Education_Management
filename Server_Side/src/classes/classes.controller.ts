import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // Lấy danh sách lớp (lọc theo ngành nếu truyền branchId)
  @Get()
  async findAll(@Query('branchId') branchId?: string) {
    const data = await this.classesService.findAll(branchId);
    return { success: true, message: 'success', metadata: data };
  }

  // Lấy chi tiết một lớp theo id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.classesService.findOne(id);
    return { success: true, message: 'success', metadata: data };
  }

  // Tạo lớp mới (gắn giảng viên chủ nhiệm và ngành)
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() body: { code: string; nameClass: string; teacherId: string; branchId: string }) {
    const data = await this.classesService.create(body);
    return { success: true, message: 'Tạo lớp thành công', metadata: data };
  }

  // Cập nhật thông tin lớp
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.classesService.update(id, body);
    return { success: true, message: 'Cập nhật thành công', metadata: data };
  }

  // Xóa lớp
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.classesService.remove(id);
    return { success: true, message: 'Xóa thành công', metadata: data };
  }
}
