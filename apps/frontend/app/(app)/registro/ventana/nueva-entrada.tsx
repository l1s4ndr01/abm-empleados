"use client";

import { useState } from "react";
import type { Proyecto, Tarea } from "@/lib/tipos";
import { VentanaRegistro } from "./ventana-registro";

// Botón "+ Nueva entrada de tiempo". Cada vez que se abre, la ventana
// arranca de cero (hora actual, duración 0).
export function NuevaEntrada(props: {
  proyectos: Proyecto[];
  tareas: Tarea[];
  semanaVisible: string;
}) {
  const [abierta, setAbierta] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="rounded-md bg-acento px-4 py-2 text-sm font-semibold text-superficie hover:opacity-90"
      >
        + Nueva entrada de tiempo
      </button>
      {abierta && <VentanaRegistro {...props} onCerrar={() => setAbierta(false)} />}
    </>
  );
}
