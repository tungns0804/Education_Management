import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import * as express from 'express';

type AuthReq = express.Request & { user: { id: string; role: string } };

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('my')
  async getMy(@Req() req: AuthReq) {
    const data = await this.notificationsService.findMy(req.user.id);
    return { success: true, message: 'success', metadata: data };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllRead(@Req() req: AuthReq) {
    const data = await this.notificationsService.markAllRead(req.user.id);
    return { success: true, message: 'Đã đánh dấu tất cả là đã đọc', metadata: data };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markRead(@Param('id') id: string, @Req() req: AuthReq) {
    const data = await this.notificationsService.markRead(id, req.user.id);
    return { success: true, message: 'Đã đọc', metadata: data };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() body: any) {
    const data = await this.notificationsService.create(body);
    return { success: true, message: 'Gửi thông báo thành công', metadata: data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.notificationsService.remove(id);
    return { success: true, message: 'Xóa thành công', metadata: data };
  }
}
