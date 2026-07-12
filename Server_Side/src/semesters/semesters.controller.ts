import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SemestersService } from './semesters.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/semesters')
@UseGuards(JwtAuthGuard)
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  // Lấy danh sách tất cả học kỳ
  @Get()
  findAll() {
    return this.semestersService.findAll();
  }

  // Lấy các học kỳ đang kích hoạt
  @Get('active')
  findActive() {
    return this.semestersService.findActive();
  }

  // Tạo học kỳ mới theo tên
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body('name') name: string) {
    return this.semestersService.create(name);
  }

  // Cập nhật tên / trạng thái kích hoạt của học kỳ
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { name?: string; isActive?: boolean }) {
    return this.semestersService.update(id, body);
  }

  // Bật / tắt trạng thái kích hoạt của học kỳ
  @Patch(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles('admin')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.semestersService.toggleActive(id);
  }

  // Xóa học kỳ
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.semestersService.remove(id);
  }
}
