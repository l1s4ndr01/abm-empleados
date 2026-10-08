import "server-only";
import { redirect } from "next/navigation";
import { leerToken } from "./sesion";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

// Error del backend con un mensaje listo para mostrar al usuario.
export class ErrorDeApi extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// Pedido con el token del usuario logueado. Si el backend responde 401
// (token vencido o inválido), manda al usuario a volver a entrar.
export async function pedirAlBackend<T>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T> {
  const token = await leerToken();
  if (!token) redirect("/login");
  try {
    return await llamarAlBackend<T>(ruta, opciones, token);
  } catch (error) {
    if (error instanceof ErrorDeApi && error.status === 401) {
      redirect("/login?motivo=sesion-vencida");
    }
    throw error;
  }
}

// Pedido directo al backend. Lo usa el login, que todavía no tiene token.
export async function llamarAlBackend<T>(
  ruta: string,
  opciones: RequestInit = {},
  token?: string,
): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${BACKEND_URL}${ruta}`, {
      ...opciones,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opciones.headers,
      },
    });
  } catch {
    throw new ErrorDeApi(
      0,
      "No se pudo conectar con el servidor de SIMEP. Revisá que el backend esté levantado.",
    );
  }

  if (!respuesta.ok) {
    throw new ErrorDeApi(respuesta.status, await mensajeDeError(respuesta));
  }
  if (respuesta.status === 204) return undefined as T;
  return respuesta.json() as Promise<T>;
}

// El backend ya responde los errores en español. Las validaciones (400)
// pueden traer varios mensajes en una lista.
async function mensajeDeError(respuesta: Response): Promise<string> {
  try {
    const cuerpo = await respuesta.json();
    if (Array.isArray(cuerpo.message)) return cuerpo.message.join(". ");
    if (typeof cuerpo.message === "string") return cuerpo.message;
  } catch {
    // El cuerpo no era JSON: se usa el mensaje genérico.
  }
  if (respuesta.status === 403) return "No tenés permiso para hacer esto.";
  return "El servidor tuvo un problema. Probá de nuevo en un rato.";
}
