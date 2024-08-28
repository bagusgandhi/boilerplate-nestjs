import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'src/decorators/permission.decorator';
import { User } from 'src/modules/user/entities/user.entity';
import { Role } from 'src/modules/role/entities/role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler());
    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!this.hasPermission(user, requiredPermissions)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }

  private hasPermission(user: User, requiredPermissions: string[]): boolean {
    if (!user || !user.roles) {
      return false;
    }

    return user.roles.some((role: Role) =>
      role.permissions.some(permission => requiredPermissions.includes(permission.action))
    );
  }
}
