import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '@prisma/client';
import { RequestConEmpleado, ROLES } from './decorators';

// Guard global: corre después de JwtAuthGuard y controla @Roles().
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Rol[] | undefined>(ROLES, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles?.length) return true;

    const { empleado } = ctx.switchToHttp().getRequest<RequestConEmpleado>();
    if (!empleado || !roles.includes(empleado.rol)) {
      throw new ForbiddenException('No tenés permiso para esta acción');
    }
    return true;
  }
}
