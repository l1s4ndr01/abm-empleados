import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { pedirAlBackend } from "./api";
import type { Empleado } from "@simep/tipos";

// Empleado logueado. `cache` evita pedirlo más de una vez por render.
export const obtenerEmpleadoActual = cache(() =>
  pedirAlBackend<Empleado>("/auth/me"),
);

// Pantallas de Administración: si no es ADMIN, vuelve a su pantalla.
// El backend igual rechaza con 403 lo que no le corresponde.
export async function exigirAdmin() {
  const empleado = await obtenerEmpleadoActual();
  if (empleado.rol !== "ADMIN") redirect("/registro");
  return empleado;
}
