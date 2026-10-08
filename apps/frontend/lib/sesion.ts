import "server-only";
import { cookies } from "next/headers";
import { COOKIE_SESION } from "./constantes";

// El token del backend vive en una cookie httpOnly: el JavaScript del
// navegador no la puede leer, solo el servidor de Next.

export async function guardarToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: vencimientoDelToken(token),
  });
}

export async function leerToken() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_SESION)?.value;
}

export async function borrarToken() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESION);
}

// La cookie vence junto con el token (8 h en el backend). Solo se lee el
// campo `exp`; la firma la verifica el backend en cada pedido.
function vencimientoDelToken(token: string): Date | undefined {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    return typeof payload.exp === "number"
      ? new Date(payload.exp * 1000)
      : undefined;
  } catch {
    return undefined;
  }
}
