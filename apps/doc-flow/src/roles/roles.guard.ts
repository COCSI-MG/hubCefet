import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators/roles.decorator';
import { UserJwtPayload } from 'src';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: UserJwtPayload = request['user'];
    if (!user) {
      throw new UnauthorizedException();
    }
    const roles: Role[] = user?.profile?.roles;
    if (!roles) {
      throw new ForbiddenException();
    }
    const hasHole = requiredRoles.some((role: string) =>
      roles.some((r: Role) => r.name === role),
    );
    if (!hasHole) {
      throw new ForbiddenException();
    }
    return true;
  }
}
