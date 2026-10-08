"use client";

import { createContext, use } from "react";
import type { Proyecto, Tarea } from "@/lib/tipos";

// Lo que necesita la ventana de carga, compartido por el botón
// "Nueva entrada" y por el lápiz de cada fila.
interface Datos {
  proyectos: Proyecto[];
  tareas: Tarea[];
  semanaVisible: string;
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
