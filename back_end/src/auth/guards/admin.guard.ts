import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    if (!user || user.rol !== 'administrador') {
      throw new ForbiddenException('Se requiere permisos de administrador');
    }
    return true;
  }
}
