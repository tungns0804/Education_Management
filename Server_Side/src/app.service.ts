import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Trả về chuỗi chào mặc định để kiểm tra server hoạt động
  getHello(): string {
    return 'Hello World!';
  }
}
