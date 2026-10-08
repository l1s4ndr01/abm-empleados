import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

// Cada proyecto se devuelve con el nombre de su cliente, para mostrarlo en listas.
const include = { cliente: { select: { id: true, nombre: true } } };

@Injectable()
export class ProyectosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filtros: { clienteId?: number; incluirArchivados?: boolean }) {
    return this.prisma.proyecto.findMany({
      // Sin ?archivados=true, se ocultan también los de clientes archivados.
      where: {
        clienteId: filtros.clienteId,
        ...(!filtros.incluirArchivados && {
          archivado: false,
          cliente: { archivado: false },
        }),
      },
      include,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id },
      include,
    });
    if (!proyecto) {
      throw new NotFoundException(`No existe el proyecto ${id}`);
    }
    return proyecto;
  }

  async create(dto: CreateProyectoDto) {
    await this.validarCliente(dto.clienteId);
    try {
      return await this.prisma.proyecto.create({ data: dto, include });
    } catch (e) {
      throw this.traducirError(e, dto.nombre);
    }
  }

  async update(id: number, dto: UpdateProyectoDto) {
    const actual = await this.findOne(id);
    const cambiaDeCliente =
      dto.clienteId !== undefined && dto.clienteId !== actual.clienteId;
    // Al restaurarlo, su cliente tiene que estar activo.
    const seRestaura = dto.archivado === false && actual.archivado;
    if (cambiaDeCliente || seRestaura) {
      await this.validarCliente(
        dto.clienteId ?? actual.clienteId,
        seRestaura ? ' Restauralo primero para restaurar el proyecto.' : '',
      );
    }
    try {
      return await this.prisma.proyecto.update({
        where: { id },
        data: dto,
        include,
      });
    } catch (e) {
      throw this.traducirError(e, dto.nombre ?? actual.nombre);
    }
  }

  // Los proyectos no se borran: se archivan para no romper las horas cargadas.
  async archivar(id: number) {
    await this.findOne(id);
    return this.prisma.proyecto.update({
      where: { id },
      data: { archivado: true },
      include,
    });
  }

  // No se pueden crear, mover ni restaurar proyectos de un cliente archivado.
  private async validarCliente(clienteId: number, ayuda = '') {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    if (!cliente) {
      throw new BadRequestException(`No existe el cliente ${clienteId}`);
    }
    if (cliente.archivado) {
      throw new BadRequestException(
        `El cliente "${cliente.nombre}" está archivado.${ayuda}`,
      );
    }
  }

  private traducirError(e: unknown, nombre?: string) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return new ConflictException(
        `Ya existe un proyecto llamado "${nombre}" para ese cliente`,
      );
    }
    return e;
  }
}
