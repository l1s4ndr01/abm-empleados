"use client";

import { useState, useTransition } from "react";
import type { Proyecto, Tarea } from "@simep/tipos";
import { borrarTarea, cambiarTarea, crearTarea } from "@/app/acciones/proyectos";
import { BotonTexto, Confirmacion } from "@/componentes/admin";

// Tareas de un proyecto, desplegadas debajo de su fila.
export function PanelTareas({
  proyecto,
  tareas,
}: {
  proyecto: Proyecto;
  tareas: Tarea[];
}) {
  const [nueva, setNueva] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [agregando, startTransition] = useTransition();

  function agregar() {
    if (nueva.trim() === "") return;
    startTransition(async () => {
      const resultado = await crearTarea({
        nombre: nueva.trim(),
        proyectoId: proyecto.id,
      });
      if (resultado.error) setError(resultado.error);
      else {
        setNueva("");
        setError(null);
      }
    });
  }

  return (
    <div className="border-t border-linea bg-fondo px-4 py-3 pl-10">
      {tareas.length === 0 ? (
        <p className="pb-2 text-sm text-tenue">Este proyecto no tiene tareas.</p>
      ) : (
        <ul className="divide-y divide-linea overflow-hidden rounded-md border border-linea bg-superficie">
          {tareas.map((tarea) => (
            <FilaTarea key={tarea.id} tarea={tarea} />
          ))}
        </ul>
      )}

      {proyecto.archivado ? (
        <p className="pt-2 text-xs text-tenue">
          El proyecto está archivado: no se le pueden agregar tareas.
        </p>
      ) : (
        <form
          className="flex gap-2 pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            agregar();
          }}
        >
          <input
            value={nueva}
            onChange={(e) => {
              setNueva(e.target.value);
              setError(null);
            }}
            maxLength={100}
            placeholder="Nueva tarea"
            aria-label={`Nueva tarea para ${proyecto.nombre}`}
            className="w-full max-w-xs rounded-md border border-linea bg-superficie px-3 py-1.5 text-sm placeholder:text-tenue focus:border-acento focus:outline focus:outline-acento"
          />
          <button
            type="submit"
            disabled={agregando || nueva.trim() === ""}
            className="rounded-md border border-acento/40 px-3 py-1.5 text-sm font-semibold text-acento hover:bg-acento-suave disabled:opacity-45"
          >
            {agregando ? "Agregando…" : "Agregar"}
          </button>
        </form>
      )}
      {error && <p role="alert" className="pt-2 text-sm text-peligro">{error}</p>}
    </div>
  );
}

function FilaTarea({ tarea }: { tarea: Tarea }) {
  const [renombrando, setRenombrando] = useState(false);
  const [nombre, setNombre] = useState(tarea.nombre);
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enCurso, startTransition] = useTransition();

  function cambiar(cambios: { nombre?: string; completada?: boolean }) {
    startTransition(async () => {
      const resultado = await cambiarTarea(tarea.id, cambios);
      setError(resultado.error ?? null);
      if (!resultado.error) setRenombrando(false);
    });
  }

  return (
    <li>
      <div className="flex items-center gap-3 px-3 py-1.5 text-sm">
        <input
          type="checkbox"
          checked={tarea.completada}
          disabled={enCurso}
          onChange={(e) => cambiar({ completada: e.target.checked })}
          aria-label={`Marcar “${tarea.nombre}” como completada`}
          title="Completada"
          className="size-4 accent-acento"
        />
        {renombrando ? (
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (nombre.trim()) cambiar({ nombre: nombre.trim() });
            }}
          >
            <input
              autoFocus
              value={nombre}
              maxLength={100}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setNombre(tarea.nombre);
                  setRenombrando(false);
                }
              }}
              aria-label="Nombre de la tarea"
              className="flex-1 rounded-md border border-linea bg-superficie px-2 py-0.5 focus:border-acento focus:outline focus:outline-acento"
            />
            <BotonTexto onClick={() => nombre.trim() && cambiar({ nombre: nombre.trim() })} disabled={enCurso}>
              Guardar
            </BotonTexto>
            <BotonTexto
              onClick={() => {
                setNombre(tarea.nombre);
                setRenombrando(false);
              }}
            >
              Cancelar
            </BotonTexto>
          </form>
        ) : (
          <>
            <span className={`flex-1 ${tarea.completada ? "text-tenue line-through" : ""}`}>
              {tarea.nombre}
            </span>
            <BotonTexto onClick={() => setRenombrando(true)}>Renombrar</BotonTexto>
            <BotonTexto peligro onClick={() => setBorrando(true)}>
              Borrar
            </BotonTexto>
          </>
        )}
      </div>
      {error && <p role="alert" className="px-3 pb-2 text-sm text-peligro">{error}</p>}
      {borrando && (
        <Confirmacion
          pregunta={`¿Borrar la tarea “${tarea.nombre}”? Solo se puede si no tiene horas cargadas.`}
          textoBoton="Borrar"
          accion={() => borrarTarea(tarea.id)}
          onCancelar={() => setBorrando(false)}
        />
      )}
    </li>
  );
}
