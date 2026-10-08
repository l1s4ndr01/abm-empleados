"use server";

import { revalidatePath } from "next/cache";
import { ErrorDeApi, pedirAlBackend } from "@/lib/api";
import {
  fechaDe,
  formatearHora,
  tituloDelDia,
} from "@/lib/fechas";
import type { Registro } from "@/lib/tipos";

// Lo que manda la ventana de carga. Las fechas van en ISO con zona.
export interface DatosRegistro {
  proyectoId: number;
  tareaId: number | null;
  descripcion: string | null;
  inicio: string;
  fin: string;
}

export interface ResultadoGuardar {
  error?: string;
}

export async function crearRegistro(
  datos: DatosRegistro,
): Promise<ResultadoGuardar> {
  try {
    await pedirAlBackend<Registro>("/registros", {
      method: "POST",
      body: JSON.stringify({
        proyectoId: datos.proyectoId,
        tareaId: datos.tareaId,
        descripcion: datos.descripcion,
        inicio: datos.inicio,
        fin: datos.fin,
      }),
    });
  } catch (error) {
    if (error instanceof ErrorDeApi) return { error: await explicar(error) };
    throw error;
  }
  revalidatePath("/registro");
  return {};
}

// El backend avisa la superposición con el id del otro registro
// ("...con el registro 123..."). Se busca para mostrar cuál es.
async function explicar(error: ErrorDeApi) {
  const id = error.status === 409 && /registro (\d+)/.exec(error.message)?.[1];
  if (!id) return error.message;
  try {
    const otro = await pedirAlBackend<Registro>(`/registros/${id}`);
    const nombre = otro.descripcion ? `“${otro.descripcion}”` : "otro registro";
    return (
      `Se superpone con ${nombre} (${tituloDelDia(fechaDe(otro.inicio))}, ` +
      `${formatearHora(otro.inicio)} – ${formatearHora(otro.fin)}, ${otro.proyecto.nombre}). ` +
      "Cambiá el horario."
    );
  } catch {
    return error.message;
  }
}
