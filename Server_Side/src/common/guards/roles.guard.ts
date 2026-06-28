import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import * as express from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<express.Request>();
    const user = (req as express.Request & { user?: { id: string; role: string } }).user;
    if (!user) throw new ForbiddenException('Không có quyền truy cập');
    if (!required.includes(user.role))
      throw new ForbiddenException('Không có quyền truy cập');
    return true;
  }
}
