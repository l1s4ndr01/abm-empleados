import Image from "next/image";
import { cerrarSesion } from "@/app/acciones/sesion";
import { EnlaceMenu } from "@/componentes/enlace-menu";
import { Logo } from "@/componentes/logo";
import { obtenerEmpleadoActual } from "@/lib/empleado-actual";

// Pantallas de la administración. Las tareas se manejan dentro de Proyectos.
const ADMINISTRACION = [
  { nombre: "Clientes", href: "/admin/clientes" },
  { nombre: "Proyectos", href: "/admin/proyectos" },
  { nombre: "Empleados", href: "/admin/empleados" },
];

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const empleado = await obtenerEmpleadoActual();
  const iniciales = `${empleado.nombre[0]}${empleado.apellido[0]}`;

  return (
    <div className="flex flex-1">
      <aside className="flex w-52 shrink-0 flex-col gap-1 border-r border-linea bg-gris px-3 py-4">
        <Logo className="px-3 pb-4 text-xl" />
        <EnlaceMenu href="/registro">Registro de tiempo</EnlaceMenu>
        {empleado.rol === "ADMIN" && (
          <>
            <EnlaceMenu href="/admin/reportes">Reportes</EnlaceMenu>
            <p className="px-3 pt-5 pb-1 text-xs font-semibold tracking-wider text-tenue uppercase">
              Administración
            </p>
            {ADMINISTRACION.map(({ nombre, href }) => (
              <EnlaceMenu key={nombre} href={href}>
                {nombre}
              </EnlaceMenu>
            ))}
          </>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-linea px-6 py-3 text-sm">
          {empleado.fotoUrl ? (
            <Image
              src={empleado.fotoUrl}
              alt=""
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <span className="grid size-7 place-items-center rounded-full bg-acento-suave text-xs font-semibold text-acento">
              {iniciales}
            </span>
          )}
          <span>
            {empleado.nombre} {empleado.apellido}
          </span>
          <form action={cerrarSesion}>
            <button type="submit" className="text-acento hover:underline">
              Cerrar sesión
            </button>
          </form>
        </header>
        <main className="flex-1 px-6 py-5">{children}</main>
      </div>
    </div>
  );
}
