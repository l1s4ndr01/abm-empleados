"use server";

import { esId, mandarCambio, type Resultado } from "@/lib/acciones";
import type { CambiosCliente, NuevoCliente } from "@simep/tipos";

const PANTALLA = "/admin/clientes";
const NO_VALIDO = { error: "El cliente no es válido." };

// Se arma el cuerpo campo por campo: el backend rechaza campos de más.
// Los textos opcionales vacíos van en null, para que se borren al editar.
const cuerpo = (datos: NuevoCliente): NuevoCliente => ({
  nombre: datos.nombre,
  email: datos.email || null,
  direccion: datos.direccion || null,
  nota: datos.nota || null,
});

export async function crearCliente(datos: NuevoCliente): Promise<Resultado> {
  return mandarCambio("/clientes", "POST", PANTALLA, cuerpo(datos));
}

export async function actualizarCliente(
  id: number,
  datos: NuevoCliente,
): Promise<Resultado> {
  if (!esId(id)) return NO_VALIDO;
  return mandarCambio(`/clientes/${id}`, "PATCH", PANTALLA, cuerpo(datos));
}

// DELETE archiva el cliente y sus proyectos: no los borra de la base.
export async function archivarCliente(id: number): Promise<Resultado> {
  if (!esId(id)) return NO_VALIDO;
  return mandarCambio(`/clientes/${id}`, "DELETE", PANTALLA);
}

// Con conProyectos, vuelven también todos sus proyectos.
export async function restaurarCliente(
  id: number,
  conProyectos: boolean,
): Promise<Resultado> {
  if (!esId(id)) return NO_VALIDO;
  const cambios: CambiosCliente = {
    archivado: false,
    restaurarProyectos: conProyectos === true,
  };
  return mandarCambio(`/clientes/${id}`, "PATCH", PANTALLA, cambios);
}
