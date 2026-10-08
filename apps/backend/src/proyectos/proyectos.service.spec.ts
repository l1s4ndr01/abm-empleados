import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProyectosService } from './proyectos.service';

describe('ProyectosService', () => {
  let service: ProyectosService;

  const clientes = [
    { id: 1, nombre: 'Ríos', archivado: false },
    { id: 2, nombre: 'Panadería', archivado: true },
  ];
  const prisma = {
    proyecto: {
      findMany: jest.fn((_: { where: object }) => Promise.resolve([])),
      findUnique: jest.fn(),
      update: jest.fn((args: { data: object }) => args.data),
    },
    cliente: {
      findUnique: jest.fn(({ where }: { where: { id: number } }) =>
        clientes.find((c) => c.id === where.id),
      ),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProyectosService(prisma as unknown as PrismaService);
  });

  it('por defecto oculta los proyectos archivados y los de clientes archivados', async () => {
    await service.findAll({});
    expect(prisma.proyecto.findMany.mock.calls[0][0].where).toEqual({
      clienteId: undefined,
      archivado: false,
      cliente: { archivado: false },
    });

    await service.findAll({ incluirArchivados: true });
    expect(prisma.proyecto.findMany.mock.calls[1][0].where).toEqual({
      clienteId: undefined,
    });
  });

  it('no restaura un proyecto si su cliente está archivado (400)', async () => {
    prisma.proyecto.findUnique.mockResolvedValue({
      id: 5,
      clienteId: 2,
      archivado: true,
    });
    await expect(service.update(5, { archivado: false })).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.proyecto.update).not.toHaveBeenCalled();
  });

  it('restaura un proyecto si su cliente está activo', async () => {
    prisma.proyecto.findUnique.mockResolvedValue({
      id: 6,
      clienteId: 1,
      archivado: true,
    });
    await service.update(6, { archivado: false });
    expect(prisma.proyecto.update).toHaveBeenCalled();
  });
});
