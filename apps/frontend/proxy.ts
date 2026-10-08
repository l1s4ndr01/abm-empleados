import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION } from "./lib/constantes";

// Control rápido: sin la cookie de sesión, todo lleva al login.
// La validez del token la controla el backend en cada pedido (ver lib/api.ts).
export function proxy(request: NextRequest) {
  const tieneSesion = request.cookies.has(COOKIE_SESION);
  const esLogin = request.nextUrl.pathname === "/login";

  if (!tieneSesion && !esLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

// No corre para los archivos estáticos (los que tienen un punto, como favicon.ico).
export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
