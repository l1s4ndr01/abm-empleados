import type { Metadata } from "next";
import type { Cliente } from "@simep/tipos";
import { pedirAlBackend } from "@/lib/api";
import { exigirAdmin } from "@/lib/empleado-actual";
import { ListaClientes } from "./lista-clientes";

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientesPage({
  searchParams,
}: PageProps<"/admin/clientes">) {
  await exigirAdmin();
  // ?archivados=1 muestra también los archivados.
  const { archivados } = await searchParams;
  const conArchivados = archivados === "1";
  const clientes = await pedirAlBackend<Cliente[]>(
    `/clientes${conArchivados ? "?archivados=true" : ""}`,
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <h1 className="text-xl font-semibold">Clientes</h1>
      <ListaClientes clientes={clientes} conArchivados={conArchivados} />
    </div>
  );
}
