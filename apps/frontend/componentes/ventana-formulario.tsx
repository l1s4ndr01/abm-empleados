"use client";

import { Dialogo } from "./dialogo";
import { IconoCerrar } from "./iconos";

// Ventana con un formulario: título, campos, aviso de error y los botones
// Cancelar y Guardar. La usan las pantallas de Administración.
export function VentanaFormulario({
  titulo,
  error,
  guardando,
  onGuardar,
  onCerrar,
  children,
}: {
  titulo: string;
  error: string | null;
  guardando: boolean;
  onGuardar: () => void;
  onCerrar: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialogo
      etiqueta={titulo}
      onCerrar={onCerrar}
      className="w-[min(30rem,calc(100vw-2rem))]"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onGuardar();
        }}
      >
        <div className="flex items-center gap-3 border-b border-linea px-5 py-3.5">
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-tenue hover:text-texto"
          >
            <IconoCerrar />
          </button>
          <h2 className="text-lg">{titulo}</h2>
        </div>

        <div className="grid gap-4 px-5 py-4">{children}</div>

        {error && (
          <p
            role="alert"
            className="mx-5 rounded-md bg-aviso-suave px-3 py-2 text-sm text-aviso"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 px-5 py-3.5">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md border border-linea px-4 py-1.5 text-sm text-tenue hover:bg-gris"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-acento px-4 py-1.5 text-sm font-semibold text-superficie disabled:opacity-45"
          >
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </Dialogo>
  );
}

// Un campo del formulario con su etiqueta y, si hace falta, una ayuda.
export function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{etiqueta}</span>
      {children}
      {ayuda && <span className="text-xs text-tenue">{ayuda}</span>}
    </label>
  );
}

export const estiloEntrada =
  "w-full rounded-md border border-linea bg-superficie px-3 py-1.5 text-texto placeholder:text-tenue focus:border-acento focus:outline focus:outline-acento disabled:bg-gris disabled:text-tenue";
