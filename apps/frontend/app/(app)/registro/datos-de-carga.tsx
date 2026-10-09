"use client";

import { createContext, use } from "react";
import type { Empleado, Proyecto, Tarea } from "@simep/tipos";

// Lo que necesitan la ventana de carga y los controles de la pantalla,
// compartido por el botón "Nueva entrada", el lápiz de cada fila y el
// selector de empleado.
interface Datos {
  proyectos: Proyecto[];
  tareas: Tarea[];
  semanaVisible: string;
  miId: number;
  esAdmin: boolean;
  // Solo para el ADMIN: todos los empleados, también los inactivos.
  empleados: Empleado[];
  // Empleado cuyas horas se están viendo; null cuando se ven las de todos.
  empleadoVisto: number | null;
  // Valor de ?empleado= en la dirección (undefined: las horas propias).
  parametroEmpleado?: string;
}

const Contexto = createContext<Datos | null>(null);

export function DatosDeCarga({
  children,
  ...datos
}: Datos & { children: React.ReactNode }) {
  return <Contexto value={datos}>{children}</Contexto>;
}

export function useDatosDeCarga() {
  const datos = use(Contexto);
  if (!datos) throw new Error("Falta <DatosDeCarga> en la pantalla");
  return datos;
}
