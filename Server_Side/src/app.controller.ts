import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Endpoint kiểm tra server còn hoạt động (health check)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
