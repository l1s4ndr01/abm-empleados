"use client";

import { useState, useTransition } from "react";
import { borrarRegistro } from "@/app/acciones/registros";
import { fechaDe, formatearDuracion, formatearHora } from "@/lib/fechas";
import type { Registro } from "@simep/tipos";
import { VentanaRegistro } from "./ventana/ventana-registro";

// Una fila de la lista. El lápiz abre la ventana de carga con el registro;
// el tacho pide confirmación en la misma lista antes de borrar.
export function FilaDeRegistro({
  registro,
  mostrarEmpleado,
}: {
  registro: Registro;
  mostrarEmpleado: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [borrando, startTransition] = useTransition();
  const { proyecto, tarea } = registro;

  // Si termina otro día (pasó la medianoche), se avisa junto a la hora.
  const diasDespues = Math.round(
    (Date.parse(fechaDe(registro.fin)) - Date.parse(fechaDe(registro.inicio))) /
      86_400_000,
  );

  function borrar() {
    startTransition(async () => {
      const resultado = await borrarRegistro(registro.id);
      if (resultado.error) setError(resultado.error);
      // Si se borró, la lista se vuelve a cargar sin esta fila.
    });
  }

  const estiloAccion =
    "grid size-8 place-items-center rounded-md text-tenue hover:bg-gris hover:text-texto";

  return (
    <li>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,16rem)_8rem_3.5rem_4.5rem] items-center gap-4 py-1.5 pr-2 pl-4 text-sm">
        <div className="min-w-0">
          <p
            className={`truncate ${registro.descripcion ? "" : "text-tenue italic"}`}
            title={registro.descripcion ?? undefined}
          >
            {registro.descripcion ?? "Sin descripción"}
          </p>
          {mostrarEmpleado && (
            <p className="truncate text-xs text-tenue">
              {registro.empleado.nombre} {registro.empleado.apellido}
            </p>
          )}
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: proyecto.color }}
            />
            <span className="truncate">
              {proyecto.nombre}
              {tarea && <span className="text-tenue"> · {tarea.nombre}</span>}
            </span>
          </p>
          <p className="truncate pl-4.5 text-xs text-tenue">
            {proyecto.cliente.nombre}
          </p>
        </div>
        <p className="font-mono text-tenue">
          {formatearHora(registro.inicio)} – {formatearHora(registro.fin)}
          {diasDespues > 0 && (
            <sup className="ml-0.5 text-[10px]" title="Termina otro día">
              +{diasDespues}
            </sup>
          )}
        </p>
        <p className="text-right font-mono font-medium">
          {formatearDuracion(registro.duracionSegundos)}
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setEditando(true)}
            aria-label="Editar registro"
            title="Editar"
            className={estiloAccion}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h4L19 9l-4-4L4 16z M13.5 6.5l4 4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setConfirmando(true);
            }}
            aria-label="Borrar registro"
            title="Borrar"
            className={estiloAccion}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      {confirmando && (
        <div
          role="alertdialog"
          aria-label="Confirmar borrado"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-linea bg-peligro-suave px-4 py-2 text-sm text-peligro"
        >
          <span>
            {error ??
              `¿Borrar este registro de ${formatearDuracion(registro.duracionSegundos)} h? No se puede deshacer.`}
          </span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={borrar}
              disabled={borrando}
              autoFocus
              className="rounded-md bg-peligro px-3 py-1 font-semibold text-superficie disabled:opacity-50"
            >
              {borrando ? "Borrando…" : "Borrar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              disabled={borrando}
              className="rounded-md border border-peligro/40 px-3 py-1"
            >
              Cancelar
            </button>
          </span>
        </div>
      )}

      {editando && (
        <VentanaRegistro registro={registro} onCerrar={() => setEditando(false)} />
      )}
    </li>
  );
}
