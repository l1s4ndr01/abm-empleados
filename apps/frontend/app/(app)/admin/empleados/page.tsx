import type { Metadata } from "next";
import type { Empleado } from "@simep/tipos";
import { pedirAlBackend } from "@/lib/api";
import { exigirAdmin } from "@/lib/empleado-actual";
import { ListaEmpleados } from "./lista-empleados";

export const metadata: Metadata = { title: "Empleados" };

export default async function EmpleadosPage({
  searchParams,
}: PageProps<"/admin/empleados">) {
  const yo = await exigirAdmin();
  // ?archivados=1 (el interruptor común) muestra también los inactivos.
  const { archivados } = await searchParams;
  const conInactivos = archivados === "1";
  const empleados = await pedirAlBackend<Empleado[]>(
    `/empleados${conInactivos ? "?inactivos=true" : ""}`,
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <h1 className="text-xl font-semibold">Empleados</h1>
      <ListaEmpleados
        empleados={empleados}
        conInactivos={conInactivos}
        miId={yo.id}
      />
    </div>
  );
}
