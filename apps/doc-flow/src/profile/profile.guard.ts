import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PROFILES_KEY } from './decorators/profile.decorator';
import { UserJwtPayload } from 'src';

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredProfiles = this.reflector.get<string[]>(
      PROFILES_KEY,
      context.getHandler(),
    );
    if (!requiredProfiles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: UserJwtPayload = request['user'];
    if (!user) {
      throw new UnauthorizedException();
    }
    
    if (!user.profile?.name) {
      throw new ForbiddenException('Perfil de usuário não encontrado');
    }

    const userProfileName = user.profile.name.toLowerCase();
    const hasProfile = requiredProfiles.some((profile: string) =>
      userProfileName === profile.toLowerCase(),
    );
    
    if (!hasProfile) {
      throw new ForbiddenException(`Acesso negado. Perfil necessário: ${requiredProfiles.join(' ou ')}. Perfil atual: ${user.profile.name}`);
    }
    return true;
  }
}
