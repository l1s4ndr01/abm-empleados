# Contexto de Mi Aplicación (NestJS + Next.js)

## Estructura del Proyecto
- Raíz del Monorepo usando npm Workspaces.
- **Backend:** `apps/backend` (NestJS)
- **Frontend:** `apps/frontend` (Next.js con App Router y Tailwind)

## Comandos del Entorno
- Instalar todo: `npm install`
- Levantar Backend (NestJS): `npm run start:dev -w apps/backend`
- Levantar Frontend (Next.js): `npm run dev -w apps/frontend`
- Correr Linter: `npm run lint -w apps/backend` o `npm run lint -w apps/frontend`
- Base de datos (PostgreSQL en Docker, puerto 5433): `docker compose up -d` / `docker compose down`
- Migraciones Prisma (desde `apps/backend`): `npx prisma migrate dev --name <nombre>`
- Explorar la base: `npx prisma studio` (desde `apps/backend`)

## Guías de Desarrollo para Claude
- En NestJS, sigue una arquitectura modular: organiza la funcionalidad en módulos y separa responsabilidades entre controladores y servicios.
- Usa DTOs (`class-validator`) para todas las peticiones POST/PUT en el backend.
- En Next.js, usa App Router y organiza las rutas y layouts dentro de `app/`.
- Prioriza React Server Components para fetching de datos.
- Usa `fetch` nativo hacia la URL del backend (`http://localhost:3000`).