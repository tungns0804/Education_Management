import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import * as express from 'express';

type AuthReq = express.Request & { user: { id: string; role: string } };

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('students')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getStudents(
    @Query('q') q?: string,
    @Query('class') classCode?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.usersService.findStudents(q, classCode, status);
    return { success: true, message: 'success', metadata: data };
  }

  @Get('teachers')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getTeachers(
    @Query('q') q?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const data = await this.usersService.findTeachers(q, departmentId);
    return { success: true, message: 'success', metadata: data };
  }

  @Get('next-student-id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getNextStudentId() {
    const nextId = await this.usersService.getNextStudentId();
    return { success: true, message: 'success', metadata: { nextId } };
  }

  @Get('next-teacher-id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getNextTeacherId() {
    const nextId = await this.usersService.getNextTeacherId();
    return { success: true, message: 'success', metadata: { nextId } };
  }

  @Get('me')
  async getMe(@Req() req: AuthReq) {
    const data = await this.usersService.findById(req.user.id);
    return { success: true, message: 'success', metadata: data };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.usersService.findById(id);
    return { success: true, message: 'success', metadata: data };
  }

  @Post('students')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createStudent(@Body() body: any) {
    // idStudent không nhận từ client — tự động sinh phía server
    const { idStudent: _ignored, ...rest } = body;
    const data = await this.usersService.createStudent(rest);
    return { success: true, message: 'Tạo sinh viên thành công', metadata: data };
  }

  @Post('teachers')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createTeacher(@Body() body: any) {
    // idTeacher và email không nhận từ client — tự động sinh phía server
    const { idTeacher: _ignored, email: _email, ...rest } = body;
    const data = await this.usersService.createTeacher(rest);
    return { success: true, message: 'Tạo giảng viên thành công', metadata: data };
  }

  @Post('bulk-import')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async bulkImport(@Body() body: { rows: any[] }) {
    const data = await this.usersService.bulkImportStudents(body.rows);
    return { success: true, message: `Đã tạo ${data.created} sinh viên`, metadata: data };
  }

  @Post('bulk-import-teachers')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async bulkImportTeachers(@Body() body: { rows: any[] }) {
    const data = await this.usersService.bulkImportTeachers(body.rows);
    return { success: true, message: `Đã tạo ${data.created} giảng viên`, metadata: data };
  }

  @Put('change-password')
  async changePassword(@Req() req: AuthReq, @Body() body: any) {
    const data = await this.usersService.changePassword(req.user.id, body.currentPassword, body.newPassword);
    return { success: true, message: data.message, metadata: data };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() body: any,
  ) {
    // Users can update their own profile; admin can update anyone
    const targetId = req.user.role === 'admin' ? id : req.user.id;
    const data = await this.usersService.update(targetId, body);
    return { success: true, message: 'Cập nhật thành công', metadata: data };
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async toggleStatus(
    @Param('id') id: string,
    @Body() body: { status: 'active' | 'inactive' },
  ) {
    const data = await this.usersService.toggleStatus(id, body.status);
    return { success: true, message: 'Cập nhật trạng thái thành công', metadata: data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.usersService.remove(id);
    return { success: true, message: 'Xóa thành công', metadata: data };
  }
}
