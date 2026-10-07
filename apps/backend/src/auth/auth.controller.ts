import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Empleado } from '@prisma/client';
import { AuthService } from './auth.service';
import { EmpleadoActual, Public } from './decorators';
import { LoginGoogleDto } from './dto/login-google.dto';
import { paginaPrueba } from './pagina-prueba';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // Recibe el ID token de Google y devuelve el token propio del backend.
  @Public()
  @Post('google')
  @HttpCode(200)
  login(@Body() dto: LoginGoogleDto) {
    return this.authService.loginConGoogle(dto.credential);
  }

  // Datos del empleado logueado.
  @Get('me')
  me(@EmpleadoActual() empleado: Empleado) {
    return empleado;
  }

  @Public()
  @Get('prueba')
  @Header('Content-Type', 'text/html; charset=utf-8')
  prueba() {
    if (this.config.get('NODE_ENV') === 'production') {
      throw new NotFoundException();
    }
    return paginaPrueba(this.config.getOrThrow('GOOGLE_CLIENT_ID'));
  }
}
