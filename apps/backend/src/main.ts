import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // El navegador solo deja que el frontend llame a la API si su origen está habilitado.
  app.enableCors({
    origin: config.get('FRONTEND_URL', 'http://localhost:3001'),
  });

  // whitelist: descarta campos que no estén en el DTO.
  // forbidNonWhitelisted: en vez de descartarlos, responde 400.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(config.get('PORT', 3000));
}
// void: si el arranque falla, Node muestra el error y corta el proceso.
void bootstrap();
