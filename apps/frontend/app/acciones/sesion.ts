"use server";

import { redirect } from "next/navigation";
import { ErrorDeApi, llamarAlBackend } from "@/lib/api";
import { borrarToken, guardarToken } from "@/lib/sesion";
import type { RespuestaLogin } from "@simep/tipos";

export interface ResultadoLogin {
  error?: string;
}

// Recibe el token que Google le dio al navegador, lo canjea en el backend
// por el token propio de SIMEP y lo guarda en la cookie.
export async function iniciarSesion(
  credential: string,
): Promise<ResultadoLogin> {
  if (typeof credential !== "string" || credential === "") {
    return { error: "Google no devolvió los datos de la cuenta. Probá de nuevo." };
  }

  let token: string;
  try {
    const respuesta = await llamarAlBackend<RespuestaLogin>(
      "/auth/google",
      { method: "POST", body: JSON.stringify({ credential }) },
    );
    token = respuesta.accessToken;
  } catch (error) {
    if (error instanceof ErrorDeApi) return { error: error.message };
    throw error;
  }

  await guardarToken(token);
  redirect("/registro");
}

export async function cerrarSesion() {
  await borrarToken();
  redirect("/login");
}
