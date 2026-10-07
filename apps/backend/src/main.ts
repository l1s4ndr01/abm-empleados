import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // whitelist: descarta campos que no estén en el DTO.
  // forbidNonWhitelisted: en vez de descartarlos, responde 400.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(3000);
}
// void: si el arranque falla, Node muestra el error y corta el proceso.
void bootstrap();
