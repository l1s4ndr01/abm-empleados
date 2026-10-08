"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import type { Resultado } from "@/lib/acciones";

// Piezas comunes de las pantallas de Administración.

export function Buscador({
  valor,
  onCambiar,
  placeholder,
}: {
  valor: string;
  onCambiar: (valor: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="search"
      value={valor}
      onChange={(e) => onCambiar(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full max-w-xs rounded-md border border-linea bg-superficie px-3 py-1.5 text-sm placeholder:text-tenue focus:border-acento focus:outline focus:outline-acento"
    />
  );
}

// "Mostrar archivados": se guarda en la dirección (?archivados=1), así el
// servidor pide al backend la lista que corresponde.
export function InterruptorArchivados({
  activo,
  texto,
}: {
  activo: boolean;
  texto: string;
}) {
  const ruta = usePathname();
  return (
    <Link
      href={activo ? ruta : `${ruta}?archivados=1`}
      role="switch"
      aria-checked={activo}
      className="flex items-center gap-2 text-sm text-tenue hover:text-texto"
    >
      <span
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
          activo ? "justify-end bg-acento" : "bg-linea"
        }`}
      >
        <span className="size-4 rounded-full bg-superficie shadow" />
      </span>
      {texto}
    </Link>
  );
}

export function BotonNuevo({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md bg-acento px-4 py-2 text-sm font-semibold text-superficie hover:opacity-90"
    >
      {children}
    </button>
  );
}

export function EtiquetaEstado({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-linea px-2 py-0.5 text-[11px] tracking-wide text-tenue uppercase">
      {children}
    </span>
  );
}

export function BotonTexto({
  onClick,
  disabled,
  peligro = false,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  peligro?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-2 py-1 text-sm hover:bg-gris disabled:opacity-50 ${
        peligro ? "text-peligro" : "text-acento"
      }`}
    >
      {children}
    </button>
  );
}

// Confirmación dentro de la lista (en rojo, debajo de la fila), en lugar
// de una ventana emergente. Si la acción falla, muestra el error ahí mismo.
export function Confirmacion({
  pregunta,
  textoBoton,
  accion,
  onCancelar,
}: {
  pregunta: string;
  textoBoton: string;
  accion: () => Promise<Resultado>;
  onCancelar: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [enCurso, startTransition] = useTransition();

  return (
    <div
      role="alertdialog"
      aria-label={pregunta}
      className="flex flex-wrap items-center justify-between gap-3 border-t border-linea bg-peligro-suave px-4 py-2 text-sm text-peligro"
    >
      <span>{error ?? pregunta}</span>
      <span className="flex gap-2">
        <button
          type="button"
          autoFocus
          disabled={enCurso}
          onClick={() =>
            startTransition(async () => {
              const resultado = await accion();
              if (resultado.error) setError(resultado.error);
              else onCancelar();
            })
          }
          className="rounded-md bg-peligro px-3 py-1 font-semibold text-superficie disabled:opacity-50"
        >
          {enCurso ? "Un momento…" : textoBoton}
        </button>
        <button
          type="button"
          disabled={enCurso}
          onClick={onCancelar}
          className="rounded-md border border-peligro/40 px-3 py-1"
        >
          Cancelar
        </button>
      </span>
    </div>
  );
}
