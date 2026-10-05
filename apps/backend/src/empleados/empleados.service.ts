import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Empleado, Prisma, Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(incluirInactivos = false) {
    return this.prisma.empleado.findMany({
      where: incluirInactivos ? undefined : { activo: true },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findOne(id: number) {
    const empleado = await this.prisma.empleado.findUnique({ where: { id } });
    if (!empleado) {
      throw new NotFoundException(`No existe el empleado ${id}`);
    }
    return empleado;
  }

  async create(dto: CreateEmpleadoDto) {
    try {
      return await this.prisma.empleado.create({ data: dto });
    } catch (e) {
      throw this.traducirError(e, dto.email);
    }
  }

  async update(id: number, dto: UpdateEmpleadoDto) {
    const actual = await this.findOne(id);

    // Una vez vinculado con Google, el login lo identifica por googleId y no por
    // email, así que cambiar el email dejaría los datos desincronizados.
    if (
      dto.email !== undefined &&
      dto.email !== actual.email &&
      actual.googleId
    ) {
      throw new BadRequestException(
        'No se puede cambiar el email de un empleado que ya entró con Google',
      );
    }

    const dejaDeSerAdminActivo =
      (dto.rol !== undefined && dto.rol !== Rol.ADMIN) || dto.activo === false;
    if (dejaDeSerAdminActivo) {
      await this.validarQueNoQuedeSinAdmins(actual);
    }

    try {
      return await this.prisma.empleado.update({ where: { id }, data: dto });
    } catch (e) {
      throw this.traducirError(e, dto.email);
    }
  }

  // Los empleados no se borran: se desactivan para no perder sus horas cargadas.
  // Un empleado inactivo no puede entrar al sistema.
  async desactivar(id: number) {
    const actual = await this.findOne(id);
    await this.validarQueNoQuedeSinAdmins(actual);
    return this.prisma.empleado.update({
      where: { id },
      data: { activo: false },
    });
  }

  // Siempre tiene que quedar al menos un ADMIN activo para poder gestionar el sistema.
  private async validarQueNoQuedeSinAdmins(empleado: Empleado) {
    if (empleado.rol !== Rol.ADMIN || !empleado.activo) return;
    const otrosAdmins = await this.prisma.empleado.count({
      where: { rol: Rol.ADMIN, activo: true, id: { not: empleado.id } },
    });
    if (otrosAdmins === 0) {
      throw new ConflictException(
        'Debe quedar al menos un administrador activo',
      );
    }
  }

  private traducirError(e: unknown, email?: string) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return new ConflictException(
        `Ya existe un empleado con el email "${email}"`,
      );
    }
    return e;
  }
}
