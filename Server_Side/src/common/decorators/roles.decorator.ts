import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Decorator khai báo các vai trò được phép truy cập endpoint (dùng cùng RolesGuard)
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
