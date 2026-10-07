import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Empleado, Rol } from '@prisma/client';
import { TokenPayload } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

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

describe('AuthService.loginConGoogle', () => {
  let service: AuthService;
  let base: Empleado[];
  let googlePayload: TokenPayload;

  const prisma = {
    empleado: {
      findUnique: jest.fn(({ where }: { where: Partial<Empleado> }) =>
        Promise.resolve(
          base.find((e) =>
            where.googleId !== undefined
              ? e.googleId === where.googleId
              : e.email === where.email,
          ) ?? null,
        ),
      ),
      update: jest.fn(
        ({ where, data }: { where: { id: number }; data: Partial<Empleado> }) =>
          Promise.resolve({ ...base.find((e) => e.id === where.id)!, ...data }),
      ),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    googlePayload = {
      sub: 'google-123',
      email: 'Ana@Gmail.com',
      email_verified: true,
      picture: 'https://foto',
    } as TokenPayload;
    service = new AuthService(
      prisma as unknown as PrismaService,
      {
        signAsync: jest.fn().mockResolvedValue('token-simep'),
      } as unknown as JwtService,
      { getOrThrow: () => 'client-id' } as unknown as ConfigService,
    );
    // Simula la verificación de Google sin salir a internet.
    jest
      .spyOn(service['google'], 'verifyIdToken')
      .mockImplementation(() =>
        Promise.resolve({ getPayload: () => googlePayload }),
      );
  });

  it('primer ingreso: encuentra por email (sin importar mayúsculas) y vincula googleId y foto', async () => {
    base = [empleado({})];
    const res = await service.loginConGoogle('cred');
    expect(res.accessToken).toBe('token-simep');
    expect(prisma.empleado.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { googleId: 'google-123', fotoUrl: 'https://foto' },
    });
  });

  it('ingresos siguientes: lo encuentra por googleId aunque el email cambie', async () => {
    base = [empleado({ googleId: 'google-123', email: 'viejo@gmail.com' })];
    const res = await service.loginConGoogle('cred');
    expect(res.empleado.id).toBe(1);
  });

  it('rechaza un email que no fue dado de alta', async () => {
    base = [];
    await expect(service.loginConGoogle('cred')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza si el email ya está vinculado a otra cuenta de Google', async () => {
    base = [empleado({ googleId: 'otra-cuenta' })];
    await expect(service.loginConGoogle('cred')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza a un empleado inactivo y no lo vincula', async () => {
    base = [empleado({ activo: false })];
    await expect(service.loginConGoogle('cred')).rejects.toThrow(
      ForbiddenException,
    );
    expect(prisma.empleado.update).not.toHaveBeenCalled();
  });

  it('rechaza una cuenta de Google sin email verificado', async () => {
    base = [empleado({})];
    googlePayload.email_verified = false;
    await expect(service.loginConGoogle('cred')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza un token que Google no valida', async () => {
    jest
      .spyOn(service['google'], 'verifyIdToken')
      .mockImplementation(() => Promise.reject(new Error('firma inválida')));
    await expect(service.loginConGoogle('cred')).rejects.toThrow(
      'El token de Google es inválido',
    );
  });
});
