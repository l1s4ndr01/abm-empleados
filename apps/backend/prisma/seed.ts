// Crea (o habilita) el primer administrador a partir de ADMIN_EMAIL del .env.
// Uso, desde apps/backend:  npx prisma db seed
// Se puede correr varias veces: si el empleado ya existe, lo deja como ADMIN activo.
import { PrismaClient, Rol } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error('Falta ADMIN_EMAIL en el .env');
  }

  const admin = await prisma.empleado.upsert({
    where: { email },
    update: { rol: Rol.ADMIN, activo: true },
    create: {
      email,
      nombre: process.env.ADMIN_NOMBRE?.trim() || 'Administrador',
      apellido: process.env.ADMIN_APELLIDO?.trim() || 'SIMEP',
      rol: Rol.ADMIN,
    },
  });
  console.log(`Administrador listo: ${admin.email} (id ${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
