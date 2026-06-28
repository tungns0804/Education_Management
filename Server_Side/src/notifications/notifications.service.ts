import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMy(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, userId: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Thông báo không tồn tại');
    if (notif.userId !== userId) throw new ForbiddenException('Không có quyền truy cập');
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { updated: true };
  }

  async create(data: { userId: string; title: string; message: string; type?: NotificationType; link?: string }) {
    return this.prisma.notification.create({
      data: {
        userId:  data.userId,
        title:   data.title,
        message: data.message,
        type:    data.type ?? NotificationType.info,
        link:    data.link,
      },
    });
  }

  async remove(id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Thông báo không tồn tại');
    await this.prisma.notification.delete({ where: { id } });
    return { deleted: true };
  }
}
