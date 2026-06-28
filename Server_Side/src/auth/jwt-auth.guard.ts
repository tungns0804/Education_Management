import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as express from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<express.Request>();
    const cookies = req.cookies as Record<string, string> | undefined;
    const token = cookies?.token;
    if (!token) throw new UnauthorizedException('Vui lòng đăng nhập');

    const payload = await this.authService.verifyToken(token);
    (req as express.Request & { user: unknown }).user = payload;
    return true;
  }
}
