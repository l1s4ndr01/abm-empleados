import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ES_PUBLICA, RequestConEmpleado } from './decorators';

// Guard global: exige "Authorization: Bearer <token>" en todas las rutas no públicas.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const esPublica = this.reflector.getAllAndOverride<boolean>(ES_PUBLICA, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (esPublica) return true;

    const req = ctx.switchToHttp().getRequest<RequestConEmpleado>();
    const [tipo, token] = req.headers.authorization?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta iniciar sesión');
    }

    let sub: number;
    try {
      ({ sub } = await this.jwt.verifyAsync<{ sub: number }>(token));
    } catch {
      throw new UnauthorizedException('La sesión es inválida o venció');
    }

    // Se lee el empleado en cada pedido para que una desactivación o un
    // cambio de rol tengan efecto inmediato, sin esperar a que venza el token.
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: sub },
    });
    if (!empleado || !empleado.activo) {
      throw new UnauthorizedException('Tu usuario no está activo');
    }
    req.empleado = empleado;
    return true;
  }
}
