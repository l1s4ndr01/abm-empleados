"use server";

import { revalidatePath } from "next/cache";
import { esId, type Resultado } from "@/lib/acciones";
import { ErrorDeApi, pedirAlBackend } from "@/lib/api";
import { fechaDe, formatearHora, tituloDelDia } from "@/lib/fechas";
import type { NuevoRegistro, Registro } from "@simep/tipos";

// Lo que manda la ventana de carga. Las fechas van en ISO con zona.
// Es lo mismo para crear y para editar: siempre se mandan todos los campos.
type DatosRegistro = Required<Omit<NuevoRegistro, "empleadoId">>;

// empleadoId solo lo manda el ADMIN, para cargar horas a nombre de otro.
// Si no es ADMIN, el backend lo rechaza (403).
export async function crearRegistro(
  datos: DatosRegistro,
  empleadoId?: number,
): Promise<Resultado> {
  if (empleadoId !== undefined && !esId(empleadoId)) {
    return { error: "El empleado no es válido." };
  }
  return guardar("/registros", "POST", datos, empleadoId);
}

export async function actualizarRegistro(
  id: number,
  datos: DatosRegistro,
): Promise<Resultado> {
  if (!esId(id)) return { error: "El registro no es válido." };
  return guardar(`/registros/${id}`, "PATCH", datos);
}

export async function borrarRegistro(id: number): Promise<Resultado> {
  if (!esId(id)) return { error: "El registro no es válido." };
  try {
    await pedirAlBackend(`/registros/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ErrorDeApi) return { error: error.message };
    throw error;
  }
  revalidatePath("/registro");
  return {};
}

async function guardar(
  ruta: string,
  method: "POST" | "PATCH",
  datos: DatosRegistro,
  empleadoId?: number,
): Promise<Resultado> {
  try {
    // Se arma el cuerpo campo por campo: el backend rechaza campos de más.
    const cuerpo: NuevoRegistro = {
      proyectoId: datos.proyectoId,
      tareaId: datos.tareaId,
      descripcion: datos.descripcion,
      inicio: datos.inicio,
      fin: datos.fin,
      ...(empleadoId !== undefined && { empleadoId }),
    };
    await pedirAlBackend<Registro>(ruta, {
      method,
      body: JSON.stringify(cuerpo),
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
