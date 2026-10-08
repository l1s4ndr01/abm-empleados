import type { Metadata } from "next";
import type { Cliente, Proyecto, Tarea } from "@simep/tipos";
import { pedirAlBackend } from "@/lib/api";
import { exigirAdmin } from "@/lib/empleado-actual";
import { ListaProyectos } from "./lista-proyectos";

export const metadata: Metadata = { title: "Proyectos" };

export default async function ProyectosPage({
  searchParams,
}: PageProps<"/admin/proyectos">) {
  await exigirAdmin();
  // ?archivados=1 muestra también los archivados (y los de clientes archivados).
  const { archivados } = await searchParams;
  const conArchivados = archivados === "1";

  // Los clientes activos son los que se pueden elegir al crear o editar.
  const [proyectos, clientes, tareas] = await Promise.all([
    pedirAlBackend<Proyecto[]>(
      `/proyectos${conArchivados ? "?archivados=true" : ""}`,
    ),
    pedirAlBackend<Cliente[]>("/clientes"),
    pedirAlBackend<Tarea[]>("/tareas"),
  ]);

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <h1 className="text-xl font-semibold">Proyectos</h1>
      <ListaProyectos
        proyectos={proyectos}
        clientes={clientes}
        tareas={tareas}
        conArchivados={conArchivados}
      />
    </div>
  );
}
