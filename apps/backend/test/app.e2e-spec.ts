import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Levanta la app completa contra la base de desarrollo (docker compose up -d).
// Solo hace lecturas: no modifica datos.
describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / es pública', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it.each(['/clientes', '/proyectos', '/tareas', '/empleados', '/registros'])(
    'GET %s sin token responde 401',
    (ruta) => {
      return request(app.getHttpServer()).get(ruta).expect(401);
    },
  );

  it('un token inválido responde 401', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer token-inventado')
      .expect(401);
  });
});
