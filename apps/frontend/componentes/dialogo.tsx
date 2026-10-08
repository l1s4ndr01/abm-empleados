"use client";

import { useEffect, useRef } from "react";

// Ventana modal con el <dialog> del navegador: bloquea el resto de la
// página, mantiene el foco adentro y se cierra con Esc (llama a onCerrar).
// Se abre al montarse; para cerrarla, el padre deja de mostrarla.
export function Dialogo({
  onCerrar,
  className = "",
  etiqueta,
  children,
}: {
  onCerrar: () => void;
  className?: string;
  etiqueta: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    dialogo?.showModal();
    return () => dialogo?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={etiqueta}
      onCancel={(e) => {
        e.preventDefault();
        onCerrar();
      }}
      className={`m-auto rounded-xl border border-linea bg-superficie text-texto shadow-2xl backdrop:bg-black/40 ${className}`}
    >
      {children}
    </dialog>
  );
}
