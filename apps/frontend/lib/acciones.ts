import "server-only";
import { revalidatePath } from "next/cache";
import { ErrorDeApi, pedirAlBackend } from "./api";

// Resultado de una acción de la interfaz: sin error, salió bien.
export interface Resultado {
  error?: string;
}

// Las acciones del servidor se pueden llamar desde afuera de la app:
// el id se controla antes de armar la URL.
export const esId = (id: unknown): id is number =>
  Number.isInteger(id) && (id as number) > 0;

// Manda un cambio al backend y vuelve a cargar la pantalla. Los errores
// del backend (400, 403, 409...) se devuelven como mensaje para mostrar.
export async function mandarCambio(
  ruta: string,
  method: "POST" | "PATCH" | "DELETE",
  pantalla: string,
  cuerpo?: object,
): Promise<Resultado> {
  try {
    await pedirAlBackend(ruta, {
      method,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
  } catch (error) {
    if (error instanceof ErrorDeApi) return { error: error.message };
    throw error;
  }
  revalidatePath(pantalla);
  return {};
}
