# Contexto de Mi Aplicación (NestJS + Next.js)

## Estructura del Proyecto
- Raíz del Monorepo usando npm Workspaces.
- **Backend:** `apps/backend` (NestJS)
- **Frontend:** `apps/frontend` (Next.js con App Router y Tailwind)
- **Tipos compartidos:** `packages/tipos` (`@simep/tipos`), solo declaraciones de tipos de la API que usan el backend y el frontend

## Comandos del Entorno
- Instalar todo: `npm install`
- Levantar Backend (NestJS, puerto 3000): `npm run start:dev -w apps/backend`
- Levantar Frontend (Next.js, puerto 3001): `npm run dev -w apps/frontend`
- Correr Linter: `npm run lint -w apps/backend` o `npm run lint -w apps/frontend`
- Tests del backend: `npm test -w apps/backend` (unitarios) y `npm run test:e2e -w apps/backend` (necesita la base levantada)
- Primer administrador (desde `apps/backend`): `npx prisma db seed`
- Datos de ejemplo para desarrollo (desde `apps/backend`): `npm run seed:ejemplo`
- Base de datos (PostgreSQL en Docker, puerto 5433): `docker compose up -d` / `docker compose down`
- Migraciones Prisma (desde `apps/backend`): `npx prisma migrate dev --name <nombre>`
- Explorar la base: `npx prisma studio` (desde `apps/backend`)

## Guías de Desarrollo para Claude
- En NestJS, sigue una arquitectura modular: organiza la funcionalidad en módulos y separa responsabilidades entre controladores y servicios.
- Usa DTOs (`class-validator`) para todas las peticiones POST/PUT en el backend.
- Los tipos de las respuestas y de los datos de entrada de la API están en `packages/tipos/index.d.ts`. Los controladores del backend declaran que devuelven esos tipos (las fechas, como `Registro<Date>`). Si cambia una respuesta, actualiza ese archivo en el mismo cambio. El frontend importa los tipos desde `@simep/tipos` y no los redefine.
- En Next.js, usa App Router y organiza las rutas y layouts dentro de `app/`.
- Prioriza React Server Components para fetching de datos.
- Usa `fetch` nativo hacia la URL del backend (`http://localhost:3000`).