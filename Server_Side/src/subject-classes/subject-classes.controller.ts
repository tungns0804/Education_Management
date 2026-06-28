import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SubjectClassesService } from './subject-classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import * as express from 'express';

type AuthReq = express.Request & { user: { id: string; role: string } };

@Controller('api/subject-classes')
@UseGuards(JwtAuthGuard)
export class SubjectClassesController {
  constructor(private readonly subjectClassesService: SubjectClassesService) {}

  @Get()
  async findAll(@Req() req: AuthReq) {
    const data = await this.subjectClassesService.findAll(req.user.role, req.user.id);
    return { success: true, message: 'success', metadata: data };
  }

  @Get('my-sections')
  @UseGuards(RolesGuard)
  @Roles('teacher')
  async getMySections(@Req() req: AuthReq) {
    const data = await this.subjectClassesService.findMySections(req.user.id);
    return { success: true, message: 'success', metadata: data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.subjectClassesService.findOne(id);
    return { success: true, message: 'success', metadata: data };
  }

  @Get(':id/roster')
  @UseGuards(RolesGuard)
  @Roles('teacher', 'admin')
  async getRoster(@Param('id') id: string) {
    const data = await this.subjectClassesService.findRoster(id);
    return { success: true, message: 'success', metadata: data };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() body: any) {
    const data = await this.subjectClassesService.create(body);
    return { success: true, message: 'Tạo lớp học phần thành công', metadata: data };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.subjectClassesService.update(id, body);
    return { success: true, message: 'Cập nhật thành công', metadata: data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.subjectClassesService.remove(id);
    return { success: true, message: 'Xóa thành công', metadata: data };
  }
}
