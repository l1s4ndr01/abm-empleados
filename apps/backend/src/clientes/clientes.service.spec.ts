import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientesService } from './clientes.service';

describe('ClientesService', () => {
  let service: ClientesService;

  // $transaction recibe las operaciones ya armadas y devuelve sus resultados.
  const prisma = {
    cliente: {
      findUnique: jest.fn(),
      update: jest.fn((args: { data: object }) => ({ id: 1, ...args.data })),
    },
    proyecto: {
      updateMany: jest.fn((args: { data: object }) => args),
    },
    $transaction: jest.fn((operaciones: unknown[]) =>
      Promise.resolve(operaciones),
    ),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.cliente.findUnique.mockResolvedValue({ id: 1, nombre: 'Ríos' });
    service = new ClientesService(prisma as unknown as PrismaService);
  });

  it('al archivar un cliente archiva también sus proyectos', async () => {
    const cliente = await service.archivar(1);
    expect(cliente).toMatchObject({ id: 1, archivado: true });
    expect(prisma.proyecto.updateMany).toHaveBeenCalledWith({
      where: { clienteId: 1 },
      data: { archivado: true },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('al restaurarlo solo vuelven sus proyectos si se pide', async () => {
    await service.update(1, { archivado: false });
    expect(prisma.proyecto.updateMany).not.toHaveBeenCalled();

    await service.update(1, { archivado: false, restaurarProyectos: true });
    expect(prisma.proyecto.updateMany).toHaveBeenCalledWith({
      where: { clienteId: 1 },
      data: { archivado: false },
    });
    // restaurarProyectos no llega a la tabla de clientes.
    expect(prisma.cliente.update).toHaveBeenLastCalledWith({
      where: { id: 1 },
      data: { archivado: false },
    });
  });

  it('rechaza restaurarProyectos sin "archivado": false (400)', async () => {
    await expect(
      service.update(1, { nombre: 'Otro', restaurarProyectos: true }),
    ).rejects.toThrow(BadRequestException);
  });
});
