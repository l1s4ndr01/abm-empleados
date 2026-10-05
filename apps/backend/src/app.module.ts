import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { TareasModule } from './tareas/tareas.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, ClientesModule, ProyectosModule, TareasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
