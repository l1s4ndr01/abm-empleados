import "server-only";
import { cache } from "react";
import { pedirAlBackend } from "./api";
import type { Empleado } from "@simep/tipos";

// Empleado logueado. `cache` evita pedirlo más de una vez por render.
export const obtenerEmpleadoActual = cache(() =>
  pedirAlBackend<Empleado>("/auth/me"),
);
