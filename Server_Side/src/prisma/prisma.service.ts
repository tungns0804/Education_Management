import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  // Mở kết nối database khi module khởi tạo
  async onModuleInit() {
    await this.$connect();
  }

  // Đóng kết nối database khi ứng dụng tắt
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
