import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import * as express from 'express';

type AuthReq = express.Request & { user: { id: string; role: string } };

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Số liệu tổng quan hệ thống cho dashboard admin
  @Get()
  @Roles('admin')
  async getStats() {
    const data = await this.dashboardService.getStats();
    return { success: true, message: 'success', metadata: data };
  }

  // Số liệu sinh viên theo khoa cho biểu đồ
  @Get('students-by-department')
  @Roles('admin')
  async getStudentsByDepartment() {
    const data = await this.dashboardService.getStudentsByDepartment();
    return { success: true, message: 'success', metadata: data };
  }

  // Số liệu dashboard của giảng viên đang đăng nhập
  @Get('teacher')
  @Roles('teacher')
  async getTeacherStats(@Req() req: AuthReq) {
    const data = await this.dashboardService.getTeacherStats(req.user.id);
    return { success: true, message: 'success', metadata: data };
  }

  // Số liệu dashboard của sinh viên đang đăng nhập
  @Get('student')
  @Roles('student')
  async getStudentStats(@Req() req: AuthReq) {
    const data = await this.dashboardService.getStudentStats(req.user.id);
    return { success: true, message: 'success', metadata: data };
  }
}
