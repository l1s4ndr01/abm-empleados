import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { TareasModule } from './tareas/tareas.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Lee apps/backend/.env. Si falta una variable obligatoria, la app no arranca.
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        const faltan = [
          'DATABASE_URL',
          'GOOGLE_CLIENT_ID',
          'JWT_SECRET',
        ].filter((k) => !env[k]);
        if (faltan.length) {
          throw new Error(`Faltan variables en el .env: ${faltan.join(', ')}`);
        }
        return env;
      },
    }),
    PrismaModule,
    AuthModule,
    ClientesModule,
    EmpleadosModule,
    ProyectosModule,
    TareasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
