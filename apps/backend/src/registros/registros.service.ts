import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Empleado, Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistroDto } from './dto/create-registro.dto';
import { FiltrosRegistrosDto } from './dto/filtros-registros.dto';
import { UpdateRegistroDto } from './dto/update-registro.dto';

// Cada registro se devuelve con lo necesario para mostrarlo en la lista.
const include = {
  empleado: { select: { id: true, nombre: true, apellido: true } },
  proyecto: {
    select: {
      id: true,
      nombre: true,
      color: true,
      cliente: { select: { id: true, nombre: true } },
    },
  },
  tarea: { select: { id: true, nombre: true } },
};

// La duración no se guarda: se calcula al devolver el registro.
const conDuracion = <T extends { inicio: Date; fin: Date }>(r: T) => ({
  ...r,
  duracionSegundos: Math.round((r.fin.getTime() - r.inicio.getTime()) / 1000),
});

const esAdmin = (empleado: Empleado) => empleado.rol === Rol.ADMIN;

interface DatosRegistro {
  empleadoId: number;
  proyectoId: number;
  tareaId: number | null;
  inicio: Date;
  fin: Date;
}

@Injectable()
export class RegistrosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(actual: Empleado, filtros: FiltrosRegistrosDto) {
    let empleadoId = filtros.empleadoId;
    if (!esAdmin(actual)) {
      if (empleadoId !== undefined && empleadoId !== actual.id) {
        throw new ForbiddenException(
          'Solo podés ver tus propios registros de tiempo',
        );
      }
      empleadoId = actual.id;
    }
    const registros = await this.prisma.registroTiempo.findMany({
      where: {
        empleadoId,
        proyectoId: filtros.proyectoId,
        inicio: {
          gte: filtros.desde ? new Date(filtros.desde) : undefined,
          lt: filtros.hasta ? new Date(filtros.hasta) : undefined,
        },
      },
      include,
      orderBy: { inicio: 'desc' },
    });
    return registros.map(conDuracion);
  }

  async findOne(actual: Empleado, id: number) {
    const registro = await this.prisma.registroTiempo.findUnique({
      where: { id },
      include,
    });
    if (!registro) {
      throw new NotFoundException(`No existe el registro ${id}`);
    }
    if (!esAdmin(actual) && registro.empleadoId !== actual.id) {
      throw new ForbiddenException(
        'Solo podés ver y modificar tus propios registros de tiempo',
      );
    }
    return conDuracion(registro);
  }

  async create(actual: Empleado, dto: CreateRegistroDto) {
    const empleadoId = dto.empleadoId ?? actual.id;
    if (empleadoId !== actual.id) {
      if (!esAdmin(actual)) {
        throw new ForbiddenException(
          'Solo un administrador puede cargar horas a nombre de otro empleado',
        );
      }
      await this.validarEmpleado(empleadoId);
    }
    const datos: DatosRegistro = {
      empleadoId,
      proyectoId: dto.proyectoId,
      tareaId: dto.tareaId ?? null,
      inicio: new Date(dto.inicio),
      fin: new Date(dto.fin),
    };
    await this.validar(datos, { proyectoNuevo: true });
    const registro = await this.prisma.registroTiempo.create({
      data: { ...datos, descripcion: dto.descripcion ?? null },
      include,
    });
    return conDuracion(registro);
  }

  async update(actual: Empleado, id: number, dto: UpdateRegistroDto) {
    const anterior = await this.findOne(actual, id);
    // Se valida el registro tal como quedaría después del cambio.
    const datos: DatosRegistro = {
      empleadoId: anterior.empleadoId,
      proyectoId: dto.proyectoId ?? anterior.proyectoId,
      tareaId: dto.tareaId !== undefined ? dto.tareaId : anterior.tareaId,
      inicio: dto.inicio ? new Date(dto.inicio) : anterior.inicio,
      fin: dto.fin ? new Date(dto.fin) : anterior.fin,
    };
    await this.validar(datos, {
      // Un registro de un proyecto que después se archivó se puede seguir
      // corrigiendo; lo que no se puede es pasarlo a un proyecto archivado.
      proyectoNuevo: datos.proyectoId !== anterior.proyectoId,
      excluirId: id,
    });
    const registro = await this.prisma.registroTiempo.update({
      where: { id },
      data: { ...datos, descripcion: dto.descripcion },
      include,
    });
    return conDuracion(registro);
  }

  async remove(actual: Empleado, id: number) {
    await this.findOne(actual, id);
    const registro = await this.prisma.registroTiempo.delete({
      where: { id },
      include,
    });
    return conDuracion(registro);
  }

  // No se cargan horas a nombre de un empleado inexistente o desactivado.
  private async validarEmpleado(empleadoId: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleadoId },
    });
    if (!empleado) {
      throw new BadRequestException(`No existe el empleado ${empleadoId}`);
    }
    if (!empleado.activo) {
      throw new BadRequestException(
        `El empleado ${empleado.nombre} ${empleado.apellido} está desactivado`,
      );
    }
  }

  private async validar(
    datos: DatosRegistro,
    opciones: { proyectoNuevo: boolean; excluirId?: number },
  ) {
    if (datos.fin <= datos.inicio) {
      throw new BadRequestException(
        'La hora de fin tiene que ser posterior a la de inicio',
      );
    }

    if (opciones.proyectoNuevo) {
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: datos.proyectoId },
        include: { cliente: true },
      });
      if (!proyecto) {
        throw new BadRequestException(
          `No existe el proyecto ${datos.proyectoId}`,
        );
      }
      if (proyecto.archivado) {
        throw new BadRequestException(
          `El proyecto "${proyecto.nombre}" está archivado`,
        );
      }
      // Red de seguridad: archivar un cliente ya archiva sus proyectos.
      if (proyecto.cliente.archivado) {
        throw new BadRequestException(
          `El cliente "${proyecto.cliente.nombre}" del proyecto está archivado`,
        );
      }
    }

    // Una tarea completada se acepta: sirve para cargar horas olvidadas.
    if (datos.tareaId !== null) {
      const tarea = await this.prisma.tarea.findUnique({
        where: { id: datos.tareaId },
      });
      if (!tarea) {
        throw new BadRequestException(`No existe la tarea ${datos.tareaId}`);
      }
      if (tarea.proyectoId !== datos.proyectoId) {
        throw new BadRequestException(
          `La tarea "${tarea.nombre}" no pertenece al proyecto del registro`,
        );
      }
    }

    // Dos registros del mismo empleado no pueden pisarse.
    // Que uno termine justo cuando empieza el otro sí está permitido.
    const superpuesto = await this.prisma.registroTiempo.findFirst({
      where: {
        empleadoId: datos.empleadoId,
        inicio: { lt: datos.fin },
        fin: { gt: datos.inicio },
        ...(opciones.excluirId !== undefined && {
          NOT: { id: opciones.excluirId },
        }),
      },
    });
    if (superpuesto) {
      throw new ConflictException(
        `El horario se superpone con el registro ${superpuesto.id} del mismo empleado`,
      );
    }
  }
}
