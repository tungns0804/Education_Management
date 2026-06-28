import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async findAll() {
    const data = await this.departmentsService.findAll();
    return { success: true, message: 'success', metadata: data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.departmentsService.findOne(id);
    return { success: true, message: 'success', metadata: data };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() body: { code: string; nameDepartment: string }) {
    const data = await this.departmentsService.create(body);
    return { success: true, message: 'Tạo khoa thành công', metadata: data };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: { code?: string; nameDepartment?: string }) {
    const data = await this.departmentsService.update(id, body);
    return { success: true, message: 'Cập nhật thành công', metadata: data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.departmentsService.remove(id);
    return { success: true, message: 'Xóa thành công', metadata: data };
  }
}
