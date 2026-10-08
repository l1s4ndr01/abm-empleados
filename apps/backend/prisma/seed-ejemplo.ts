// Datos de ejemplo para desarrollar el frontend: clientes, proyectos, tareas,
// dos empleados y horas cargadas en los últimos 10 días hábiles.
// Uso, desde apps/backend:  npm run seed:ejemplo
// Solo para desarrollo. Se puede correr varias veces: lo que ya existe no se toca,
// y no carga horas en un día en el que el empleado ya tiene registros.
import { PrismaClient, Rol } from '@prisma/client';

const prisma = new PrismaClient();

const ZONA = 'America/Argentina/Buenos_Aires';
const DIAS_HABILES = 10;

const clientes = [
  {
    nombre: 'Ferretería El Tornillo',
    proyectos: [
      {
        nombre: 'Sitio web',
        color: '#E57373',
        tareas: ['Diseño', 'Maquetado', 'Carga de productos'],
      },
      {
        nombre: 'Sistema de stock',
        color: '#64B5F6',
        tareas: ['Relevamiento', 'Base de datos', 'Reportes'],
      },
    ],
  },
  {
    nombre: 'Estudio Contable Ríos',
    proyectos: [
      {
        nombre: 'Migración de datos',
        color: '#81C784',
        tareas: ['Análisis', 'Migración', 'Control'],
      },
    ],
  },
  {
    nombre: 'Panadería La Espiga',
    proyectos: [
      {
        nombre: 'App de pedidos',
        color: '#FFB74D',
        tareas: ['Prototipo', 'Backend', 'Frontend'],
      },
    ],
  },
  {
    nombre: 'Interno',
    proyectos: [{ nombre: 'Reuniones', color: '#BA68C8', tareas: [] }],
  },
];

// Emails ficticios: no pueden entrar con Google. Para probar el rol EMPLEADO,
// cambiarle el email a uno con una cuenta de Google real (PATCH /empleados/:id).
const empleados = [
  { email: 'maria.gomez@example.com', nombre: 'María', apellido: 'Gómez' },
  { email: 'juan.perez@example.com', nombre: 'Juan', apellido: 'Pérez' },
];

// Bloques de un día de trabajo (hora argentina). Proyecto y tarea van rotando.
const bloques = [
  { inicio: '09:00', fin: '11:30', descripcion: 'Avance del día' },
  { inicio: '11:30', fin: '13:00', descripcion: 'Revisión con el equipo' },
  { inicio: '14:00', fin: '16:45', descripcion: null },
  { inicio: '16:45', fin: '18:00', descripcion: 'Correcciones' },
];

// "2026-10-07" según la hora argentina.
const fechaArgentina = (d: Date) =>
  d.toLocaleDateString('en-CA', { timeZone: ZONA });

const ultimosDiasHabiles = (cantidad: number) => {
  const mediodiaDeHoy = new Date(
    `${fechaArgentina(new Date())}T12:00:00-03:00`,
  );
  const dias: string[] = [];
  // Empieza ayer, para no chocar con lo que se esté cargando hoy.
  for (let i = 1; dias.length < cantidad; i++) {
    const dia = new Date(mediodiaDeHoy.getTime() - i * 86_400_000);
    const diaDeLaSemana = dia.getUTCDay(); // al mediodía argentino coincide con el día local
    if (diaDeLaSemana !== 0 && diaDeLaSemana !== 6) {
      dias.push(fechaArgentina(dia));
    }
  }
  return dias;
};

async function main() {
  // Proyectos con sus tareas, en una lista plana para repartir las horas.
  const opciones: { proyectoId: number; tareaId: number | null }[] = [];

  for (const c of clientes) {
    const cliente = await prisma.cliente.upsert({
      where: { nombre: c.nombre },
      update: {},
      create: { nombre: c.nombre },
    });
    for (const p of c.proyectos) {
      const proyecto = await prisma.proyecto.upsert({
        where: {
          clienteId_nombre: { clienteId: cliente.id, nombre: p.nombre },
        },
        update: {},
        create: { nombre: p.nombre, color: p.color, clienteId: cliente.id },
      });
      if (p.tareas.length === 0) {
        opciones.push({ proyectoId: proyecto.id, tareaId: null });
      }
      for (const nombre of p.tareas) {
        const tarea = await prisma.tarea.upsert({
          where: { proyectoId_nombre: { proyectoId: proyecto.id, nombre } },
          update: {},
          create: { nombre, proyectoId: proyecto.id },
        });
        opciones.push({ proyectoId: proyecto.id, tareaId: tarea.id });
      }
    }
  }

  // También se cargan horas para el administrador del .env, si ya existe.
  const personas = await Promise.all(
    empleados.map((e) =>
      prisma.empleado.upsert({
        where: { email: e.email },
        update: {},
        create: { ...e, rol: Rol.EMPLEADO },
      }),
    ),
  );
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const admin = adminEmail
    ? await prisma.empleado.findUnique({ where: { email: adminEmail } })
    : null;
  if (admin) {
    personas.push(admin);
  }

  let creados = 0;
  const dias = ultimosDiasHabiles(DIAS_HABILES);
  for (const [p, persona] of personas.entries()) {
    for (const [d, dia] of dias.entries()) {
      const comienzoDelDia = new Date(`${dia}T00:00:00-03:00`);
      const yaTiene = await prisma.registroTiempo.count({
        where: {
          empleadoId: persona.id,
          inicio: {
            gte: comienzoDelDia,
            lt: new Date(comienzoDelDia.getTime() + 86_400_000),
          },
        },
      });
      if (yaTiene > 0) {
        continue;
      }
      for (const [b, bloque] of bloques.entries()) {
        const { proyectoId, tareaId } =
          opciones[(p * 3 + d * 2 + b) % opciones.length];
        await prisma.registroTiempo.create({
          data: {
            empleadoId: persona.id,
            proyectoId,
            tareaId,
            descripcion: bloque.descripcion,
            inicio: new Date(`${dia}T${bloque.inicio}:00-03:00`),
            fin: new Date(`${dia}T${bloque.fin}:00-03:00`),
          },
        });
        creados++;
      }
    }
  }

  console.log(
    `Datos de ejemplo listos: ${clientes.length} clientes, ${opciones.length} combinaciones de proyecto y tarea, ` +
      `${personas.length} empleados con horas, ${creados} registros nuevos (${dias[dias.length - 1]} a ${dias[0]}).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
