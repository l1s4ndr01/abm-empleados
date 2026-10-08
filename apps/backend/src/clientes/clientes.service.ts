import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(incluirArchivados = false) {
    return this.prisma.cliente.findMany({
      where: incluirArchivados ? undefined : { archivado: false },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`No existe el cliente ${id}`);
    }
    return cliente;
  }

  async create(dto: CreateClienteDto) {
    try {
      return await this.prisma.cliente.create({ data: dto });
    } catch (e) {
      throw this.traducirError(e, dto.nombre);
    }
  }

  async update(id: number, dto: UpdateClienteDto) {
    const { restaurarProyectos, ...datos } = dto;
    if (restaurarProyectos !== undefined && datos.archivado !== false) {
      throw new BadRequestException(
        'restaurarProyectos solo se puede usar junto con "archivado": false',
      );
    }
    await this.findOne(id);
    try {
      // Al restaurar, si se pide, vuelven también todos sus proyectos.
      const [cliente] = await this.prisma.$transaction([
        this.prisma.cliente.update({ where: { id }, data: datos }),
        ...(restaurarProyectos
          ? [
              this.prisma.proyecto.updateMany({
                where: { clienteId: id },
                data: { archivado: false },
              }),
            ]
          : []),
      ]);
      return cliente;
    } catch (e) {
      throw this.traducirError(e, dto.nombre);
    }
  }

  // Los clientes no se borran: se archivan para no romper proyectos ni horas
  // cargadas. Sus proyectos se archivan con él.
  async archivar(id: number) {
    await this.findOne(id);
    const [cliente] = await this.prisma.$transaction([
      this.prisma.cliente.update({
        where: { id },
        data: { archivado: true },
      }),
      this.prisma.proyecto.updateMany({
        where: { clienteId: id },
        data: { archivado: true },
      }),
    ]);
    return cliente;
  }

  private traducirError(e: unknown, nombre?: string) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return new ConflictException(`Ya existe un cliente llamado "${nombre}"`);
    }
    return e;
  }
}
