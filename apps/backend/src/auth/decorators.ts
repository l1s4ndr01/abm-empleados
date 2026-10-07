import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Empleado, Rol } from '@prisma/client';
import { Request } from 'express';

export interface RequestConEmpleado extends Request {
  empleado?: Empleado;
}

// Todas las rutas piden login, salvo las marcadas con @Public().
export const ES_PUBLICA = 'esPublica';
export const Public = () => SetMetadata(ES_PUBLICA, true);

// Restringe una ruta (o un controlador entero) a ciertos roles.
// Sin @Roles(), alcanza con estar logueado.
export const ROLES = 'roles';
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES, roles);

// Inyecta el empleado logueado: metodo(@EmpleadoActual() empleado: Empleado)
export const EmpleadoActual = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<RequestConEmpleado>().empleado,
);
