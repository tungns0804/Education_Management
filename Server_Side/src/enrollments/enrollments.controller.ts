import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import * as express from 'express';

type AuthReq = express.Request & { user: { id: string; role: string } };

@Controller('api/enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('student')
  async getMy(@Req() req: AuthReq) {
    const data = await this.enrollmentsService.findMy(req.user.id);
    return { success: true, message: 'success', metadata: data };
  }

  @Get('transcript')
  @UseGuards(RolesGuard)
  @Roles('student')
  async getTranscript(@Req() req: AuthReq) {
    const data = await this.enrollmentsService.getTranscript(req.user.id);
    return { success: true, message: 'success', metadata: data };
  }

  @Get('gpa-trend')
  @UseGuards(RolesGuard)
  @Roles('student')
  async getGpaTrend(@Req() req: AuthReq) {
    const data = await this.enrollmentsService.getGpaTrend(req.user.id);
    return { success: true, message: 'success', metadata: data };
  }

  @Get(':subjectClassId/grades')
  @UseGuards(RolesGuard)
  @Roles('teacher', 'admin')
  async getGradeSheet(@Param('subjectClassId') subjectClassId: string) {
    const data = await this.enrollmentsService.getGradeSheet(subjectClassId);
    return { success: true, message: 'success', metadata: data };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('student')
  async register(
    @Req() req: AuthReq,
    @Body() body: { subjectClassId: string },
  ) {
    const data = await this.enrollmentsService.register(req.user.id, body.subjectClassId);
    return { success: true, message: 'Đăng ký thành công', metadata: data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('student')
  @HttpCode(HttpStatus.OK)
  async drop(@Param('id') id: string, @Req() req: AuthReq) {
    const data = await this.enrollmentsService.drop(id, req.user.id);
    return { success: true, message: 'Hủy đăng ký thành công', metadata: data };
  }

  @Put(':id/grade')
  @UseGuards(RolesGuard)
  @Roles('teacher')
  async updateGrade(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() body: { attendanceScore?: number; midtermScore?: number; finalScore?: number },
  ) {
    const data = await this.enrollmentsService.updateGrade(id, req.user.id, body);
    return { success: true, message: 'Cập nhật điểm thành công', metadata: data };
  }

  @Patch(':id/lock')
  @UseGuards(RolesGuard)
  @Roles('teacher', 'admin')
  async toggleLock(
    @Param('id') id: string,
    @Body() body: { locked: boolean },
  ) {
    const data = await this.enrollmentsService.toggleGradeLock(id, body.locked);
    return { success: true, message: body.locked ? 'Đã khóa điểm' : 'Đã mở khóa điểm', metadata: data };
  }
}
