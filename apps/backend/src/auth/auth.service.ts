import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly google: OAuth2Client;
  private readonly clientId: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.clientId = config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    this.google = new OAuth2Client(this.clientId);
  }

  // Solo entran empleados dados de alta por un admin y activos.
  // El primer ingreso vincula la cuenta de Google (googleId) con el empleado.
  async loginConGoogle(credential: string) {
    const google = await this.verificarTokenDeGoogle(credential);
    const email = google.email!.toLowerCase();

    // Ingresos siguientes: se identifica por googleId.
    // Primer ingreso: por email, si todavía no está vinculado a otra cuenta.
    let empleado = await this.prisma.empleado.findUnique({
      where: { googleId: google.sub },
    });
    if (!empleado) {
      const porEmail = await this.prisma.empleado.findUnique({
        where: { email },
      });
      if (porEmail && !porEmail.googleId) empleado = porEmail;
    }
    if (!empleado) {
      throw new UnauthorizedException(
        `La cuenta ${email} no está habilitada en SIMEP. Pedile a un administrador que te dé de alta`,
      );
    }
    if (!empleado.activo) {
      throw new ForbiddenException('Tu usuario está desactivado');
    }

    empleado = await this.prisma.empleado.update({
      where: { id: empleado.id },
      data: { googleId: google.sub, fotoUrl: google.picture ?? null },
    });
    const accessToken = await this.jwt.signAsync({ sub: empleado.id });
    return { accessToken, empleado };
  }

  private async verificarTokenDeGoogle(
    credential: string,
  ): Promise<TokenPayload> {
    let payload: TokenPayload | undefined;
    try {
      const ticket = await this.google.verifyIdToken({
        idToken: credential,
        audience: this.clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('El token de Google es inválido');
    }
    if (!payload?.email || !payload.email_verified) {
      throw new UnauthorizedException(
        'La cuenta de Google no tiene un email verificado',
      );
    }
    return payload;
  }
}
