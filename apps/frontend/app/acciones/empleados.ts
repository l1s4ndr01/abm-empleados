"use server";

import { esId, mandarCambio, type Resultado } from "@/lib/acciones";
import type { CambiosEmpleado, NuevoEmpleado } from "@simep/tipos";

const PANTALLA = "/admin/empleados";
const NO_VALIDO = { error: "El empleado no es válido." };

// Se arma el cuerpo campo por campo: el backend rechaza campos de más.
const cuerpo = (datos: NuevoEmpleado): NuevoEmpleado => ({
  email: datos.email,
  nombre: datos.nombre,
  apellido: datos.apellido,
  rol: datos.rol,
});

export async function crearEmpleado(datos: NuevoEmpleado): Promise<Resultado> {
  return mandarCambio("/empleados", "POST", PANTALLA, cuerpo(datos));
}

// El email no se manda si no cambió: el backend no deja tocarlo cuando el
// empleado ya entró con Google, aunque sea el mismo.
export async function actualizarEmpleado(
  id: number,
  datos: CambiosEmpleado,
): Promise<Resultado> {
  if (!esId(id)) return NO_VALIDO;
  const cambios: CambiosEmpleado = {
    nombre: datos.nombre,
    apellido: datos.apellido,
    rol: datos.rol,
    ...(datos.email !== undefined && { email: datos.email }),
  };
  return mandarCambio(`/empleados/${id}`, "PATCH", PANTALLA, cambios);
}

// DELETE desactiva al empleado: conserva sus horas y ya no puede entrar.
export async function desactivarEmpleado(id: number): Promise<Resultado> {
  if (!esId(id)) return NO_VALIDO;
  return mandarCambio(`/empleados/${id}`, "DELETE", PANTALLA);
}

export async function reactivarEmpleado(id: number): Promise<Resultado> {
  if (!esId(id)) return NO_VALIDO;
  const cambios: CambiosEmpleado = { activo: true };
  return mandarCambio(`/empleados/${id}`, "PATCH", PANTALLA, cambios);
}
