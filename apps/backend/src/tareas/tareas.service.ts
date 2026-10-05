import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';

// Cada tarea se devuelve con el nombre de su proyecto, para mostrarlo en listas.
const include = { proyecto: { select: { id: true, nombre: true } } };

@Injectable()
export class TareasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filtros: { proyectoId?: number; completada?: boolean }) {
    return this.prisma.tarea.findMany({
      where: { proyectoId: filtros.proyectoId, completada: filtros.completada },
      include,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const tarea = await this.prisma.tarea.findUnique({
      where: { id },
      include,
    });
    if (!tarea) {
      throw new NotFoundException(`No existe la tarea ${id}`);
    }
    return tarea;
  }

  async create(dto: CreateTareaDto) {
    await this.validarProyecto(dto.proyectoId);
    try {
      return await this.prisma.tarea.create({ data: dto, include });
    } catch (e) {
      throw this.traducirError(e, dto.nombre);
    }
  }

  async update(id: number, dto: UpdateTareaDto) {
    await this.findOne(id);
    try {
      return await this.prisma.tarea.update({
        where: { id },
        data: dto,
        include,
      });
    } catch (e) {
      throw this.traducirError(e, dto.nombre);
    }
  }

  // Las tareas no se archivan: se borran, pero solo si no tienen horas cargadas.
  async remove(id: number) {
    await this.findOne(id);
    const registros = await this.prisma.registroTiempo.count({
      where: { tareaId: id },
    });
    if (registros > 0) {
      throw new ConflictException(
        `La tarea tiene ${registros} registro(s) de tiempo. Marcala como completada en lugar de borrarla`,
      );
    }
    return this.prisma.tarea.delete({ where: { id }, include });
  }

  // No se pueden crear tareas en un proyecto archivado.
  private async validarProyecto(proyectoId: number) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
    });
    if (!proyecto) {
      throw new BadRequestException(`No existe el proyecto ${proyectoId}`);
    }
    if (proyecto.archivado) {
      throw new BadRequestException(
        `El proyecto "${proyecto.nombre}" está archivado`,
      );
    }
  }

  private traducirError(e: unknown, nombre?: string) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return new ConflictException(
        `Ya existe una tarea llamada "${nombre}" en ese proyecto`,
      );
    }
    return e;
  }
}
