import { Controller, Get, Post, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import * as express from 'express';

type AuthReq = express.Request & { user: { id: string; role: string } };

@Controller('api/attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get(':subjectClassId')
  @UseGuards(RolesGuard)
  @Roles('teacher', 'admin')
  async findBySection(@Param('subjectClassId') subjectClassId: string) {
    const data = await this.attendanceService.findBySection(subjectClassId);
    return { success: true, message: 'success', metadata: data };
  }

  @Get('my/:subjectClassId')
  @UseGuards(RolesGuard)
  @Roles('student')
  async findMy(@Param('subjectClassId') subjectClassId: string, @Req() req: AuthReq) {
    const data = await this.attendanceService.findMyAttendance(req.user.id, subjectClassId);
    return { success: true, message: 'success', metadata: data };
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles('teacher')
  async bulkMark(
    @Req() req: AuthReq,
    @Body() body: {
      subjectClassId: string;
      date: string;
      records: Array<{ studentId: string; status: any; note?: string }>;
    },
  ) {
    const data = await this.attendanceService.bulkMark({ ...body, markedById: req.user.id });
    return { success: true, message: `Đã lưu ${data.saved} điểm danh`, metadata: data };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('teacher')
  async updateOne(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() body: { status: any; note?: string },
  ) {
    const data = await this.attendanceService.updateOne(id, req.user.id, body);
    return { success: true, message: 'Cập nhật điểm danh thành công', metadata: data };
  }
}
