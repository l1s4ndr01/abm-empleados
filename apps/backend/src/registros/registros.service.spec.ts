import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Empleado, Proyecto, RegistroTiempo, Rol, Tarea } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrosService } from './registros.service';

const empleado = (datos: Partial<Empleado>): Empleado => ({
  id: 1,
  googleId: null,
  email: 'ana@gmail.com',
  nombre: 'Ana',
  apellido: 'Pérez',
  fotoUrl: null,
  rol: Rol.EMPLEADO,
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...datos,
});

const ana = empleado({ id: 1 });
const beto = empleado({ id: 2, nombre: 'Beto', email: 'beto@gmail.com' });
const admin = empleado({ id: 9, rol: Rol.ADMIN, email: 'admin@gmail.com' });

const registro = (datos: Partial<RegistroTiempo>): RegistroTiempo => ({
  id: 1,
  empleadoId: ana.id,
  proyectoId: 1,
  tareaId: null,
  descripcion: null,
  inicio: new Date('2026-10-07T12:00:00Z'),
  fin: new Date('2026-10-07T14:00:00Z'),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...datos,
});

describe('RegistrosService', () => {
  let service: RegistrosService;
  let proyectos: Partial<Proyecto>[];
  let tareas: Partial<Tarea>[];
  let registros: RegistroTiempo[];

  const porId =
    <T extends { id?: number }>(lista: () => T[]) =>
    ({ where }: { where: { id: number } }) =>
      Promise.resolve(lista().find((x) => x.id === where.id) ?? null);

  const prisma = {
    empleado: { findUnique: jest.fn(porId(() => [ana, beto, admin])) },
    proyecto: { findUnique: jest.fn(porId(() => proyectos)) },
    tarea: { findUnique: jest.fn(porId(() => tareas)) },
    registroTiempo: {
      findUnique: jest.fn(porId(() => registros)),
      findMany: jest.fn((_: { where: Partial<RegistroTiempo> }) =>
        Promise.resolve(registros),
      ),
      // Simula el filtro de solapamiento de la base.
      findFirst: jest.fn(
        ({
          where,
        }: {
          where: {
            empleadoId: number;
            inicio: { lt: Date };
            fin: { gt: Date };
            NOT?: { id: number };
          };
        }) =>
          Promise.resolve(
            registros.find(
              (r) =>
                r.empleadoId === where.empleadoId &&
                r.inicio < where.inicio.lt &&
                r.fin > where.fin.gt &&
                r.id !== where.NOT?.id,
            ) ?? null,
          ),
      ),
      create: jest.fn(({ data }: { data: Partial<RegistroTiempo> }) =>
        Promise.resolve(registro({ id: 99, ...data })),
      ),
      update: jest.fn(
        ({
          where,
          data,
        }: {
          where: { id: number };
          data: Partial<RegistroTiempo>;
        }) =>
          Promise.resolve({
            ...registros.find((r) => r.id === where.id)!,
            ...data,
          }),
      ),
    },
  };

  const nuevo = {
    proyectoId: 1,
    inicio: '2026-10-07T09:00:00-03:00',
    fin: '2026-10-07T10:30:00-03:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    proyectos = [
      { id: 1, nombre: 'Web', archivado: false },
      { id: 2, nombre: 'Viejo', archivado: true },
      { id: 3, nombre: 'App', archivado: false },
    ];
    tareas = [
      { id: 10, nombre: 'Diseño', proyectoId: 1, completada: true },
      { id: 30, nombre: 'Backend', proyectoId: 3, completada: false },
    ];
    registros = [];
    service = new RegistrosService(prisma as unknown as PrismaService);
  });

  it('crea el registro a nombre del logueado y devuelve la duración calculada', async () => {
    const res = await service.create(ana, { ...nuevo, tareaId: 10 });
    expect(prisma.registroTiempo.create.mock.calls[0][0].data).toMatchObject({
      empleadoId: ana.id,
      tareaId: 10,
    });
    // 1 h 30 min. La tarea está completada y aun así se acepta.
    expect(res.duracionSegundos).toBe(5400);
  });

  it('rechaza un fin igual o anterior al inicio (400)', async () => {
    await expect(
      service.create(ana, { ...nuevo, fin: nuevo.inicio }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rechaza un proyecto archivado (400)', async () => {
    await expect(
      service.create(ana, { ...nuevo, proyectoId: 2 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rechaza una tarea de otro proyecto (400)', async () => {
    await expect(
      service.create(ana, { ...nuevo, tareaId: 30 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rechaza un horario que se superpone con otro registro del mismo empleado (409)', async () => {
    // Existente: 9:00 a 11:00 (hora argentina).
    registros = [registro({})];
    await expect(service.create(ana, nuevo)).rejects.toThrow(ConflictException);
  });

  it('acepta un registro que empieza justo cuando termina otro', async () => {
    registros = [registro({})];
    await expect(
      service.create(ana, {
        ...nuevo,
        inicio: '2026-10-07T11:00:00-03:00',
        fin: '2026-10-07T12:00:00-03:00',
      }),
    ).resolves.toBeDefined();
  });

  it('el solapamiento es por empleado: otro empleado puede usar el mismo horario', async () => {
    registros = [registro({ empleadoId: beto.id })];
    await expect(service.create(ana, nuevo)).resolves.toBeDefined();
  });

  it('un EMPLEADO no puede cargar horas a nombre de otro (403)', async () => {
    await expect(
      service.create(ana, { ...nuevo, empleadoId: beto.id }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('el ADMIN puede cargar horas a nombre de otro empleado activo', async () => {
    await service.create(admin, { ...nuevo, empleadoId: beto.id });
    expect(prisma.registroTiempo.create.mock.calls[0][0].data).toMatchObject({
      empleadoId: beto.id,
    });
  });

  it('un EMPLEADO no puede ver registros ajenos (403)', async () => {
    registros = [registro({ empleadoId: beto.id })];
    await expect(service.findOne(ana, 1)).rejects.toThrow(ForbiddenException);
  });

  it('el listado de un EMPLEADO se limita a sus registros', async () => {
    await service.findAll(ana, {});
    expect(prisma.registroTiempo.findMany.mock.calls[0][0].where).toMatchObject(
      { empleadoId: ana.id },
    );
    await expect(service.findAll(ana, { empleadoId: beto.id })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('al cambiar de proyecto, la tarea anterior deja de ser válida (400)', async () => {
    registros = [registro({ tareaId: 10 })];
    await expect(service.update(ana, 1, { proyectoId: 3 })).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      service.update(ana, 1, { proyectoId: 3, tareaId: 30 }),
    ).resolves.toBeDefined();
  });

  it('al editar, el registro no choca consigo mismo', async () => {
    registros = [registro({})];
    await expect(
      service.update(ana, 1, { fin: '2026-10-07T11:30:00-03:00' }),
    ).resolves.toMatchObject({ duracionSegundos: 9000 });
  });

  it('se puede corregir un registro cuyo proyecto se archivó después', async () => {
    registros = [registro({ proyectoId: 2 })];
    await expect(
      service.update(ana, 1, { descripcion: 'Corrección' }),
    ).resolves.toBeDefined();
  });
});
