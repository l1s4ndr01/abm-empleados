"use server";

import { esId, mandarCambio, type Resultado } from "@/lib/acciones";
import type {
  CambiosProyecto,
  CambiosTarea,
  NuevaTarea,
  NuevoProyecto,
} from "@simep/tipos";

// Las tareas se manejan dentro de la pantalla de Proyectos.
const PANTALLA = "/admin/proyectos";
const NO_VALIDO = { error: "El proyecto o la tarea no es válido." };

// --- Proyectos ---

// Se arma el cuerpo campo por campo: el backend rechaza campos de más.
const cuerpoProyecto = (datos: NuevoProyecto): NuevoProyecto => ({
  nombre: datos.nombre,
  clienteId: datos.clienteId,
  color: datos.color,
});

export async function crearProyecto(datos: NuevoProyecto): Promise<Resultado> {
  return mandarCambio("/proyectos", "POST", PANTALLA, cuerpoProyecto(datos));
}

export async function actualizarProyecto(
  id: number,
  datos: NuevoProyecto,
): Promise<Resultado> {
  if (!esId(id)) return NO_VALIDO;
  return mandarCambio(
    `/proyectos/${id}`,
    "PATCH",
    PANTALLA,
    cuerpoProyecto(datos),
  );
}

// DELETE archiva el proyecto: no lo borra de la base.
export async function archivarProyecto(id: number): Promise<Resultado> {
  if (!esId(id)) return NO_VALIDO;
  return mandarCambio(`/proyectos/${id}`, "DELETE", PANTALLA);
}

export async function restaurarProyecto(id: number): Promise<Resultado> {
  if (!esId(id)) return NO_VALIDO;
  const cambios: CambiosProyecto = { archivado: false };
  return mandarCambio(`/proyectos/${id}`, "PATCH", PANTALLA, cambios);
}

// --- Tareas ---

export async function crearTarea(datos: NuevaTarea): Promise<Resultado> {
  if (!esId(datos.proyectoId)) return NO_VALIDO;
  const cuerpo: NuevaTarea = {
    nombre: datos.nombre,
    proyectoId: datos.proyectoId,
  };
  return mandarCambio("/tareas", "POST", PANTALLA, cuerpo);
}

export async function cambiarTarea(
  id: number,
  cambios: CambiosTarea,
): Promise<Resultado> {
  if (!esId(id)) return NO_VALIDO;
  const cuerpo: CambiosTarea = {
    nombre: cambios.nombre,
    completada: cambios.completada,
  };
  return mandarCambio(`/tareas/${id}`, "PATCH", PANTALLA, cuerpo);
}

// Solo se puede borrar si no tiene horas cargadas (si no, el backend responde 409).
export async function borrarTarea(id: number): Promise<Resultado> {
  if (!esId(id)) return NO_VALIDO;
  return mandarCambio(`/tareas/${id}`, "DELETE", PANTALLA);
}
