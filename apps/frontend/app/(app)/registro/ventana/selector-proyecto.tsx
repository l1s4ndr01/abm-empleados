"use client";

import { useEffect, useRef, useState } from "react";
import type { Proyecto, Tarea } from "@simep/tipos";
import { coincide } from "@/lib/texto";

// Lista desplegable de proyectos agrupados por cliente. Al elegir un
// proyecto con tareas, se despliegan para elegir una o "Sin tarea".
export function SelectorProyecto({
  proyectos,
  tareas,
  proyectoId,
  tareaId,
  onElegir,
  textoVacio = "Elegí un proyecto",
}: {
  proyectos: Proyecto[];
  tareas: Tarea[];
  proyectoId: number | null;
  tareaId: number | null;
  onElegir: (proyectoId: number, tareaId: number | null) => void;
  textoVacio?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [desplegado, setDesplegado] = useState<number | null>(proyectoId);
  const contenedor = useRef<HTMLDivElement>(null);

  // Se cierra al tocar afuera.
  useEffect(() => {
    if (!abierto) return;
    const alTocar = (e: PointerEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("pointerdown", alTocar);
    return () => document.removeEventListener("pointerdown", alTocar);
  }, [abierto]);

  const elegido = proyectos.find((p) => p.id === proyectoId);
  const tareaElegida = tareas.find((t) => t.id === tareaId);
  const tareasDe = (id: number) => tareas.filter((t) => t.proyectoId === id);

  function elegir(pid: number, tid: number | null) {
    onElegir(pid, tid);
    setAbierto(false);
    setBusqueda("");
  }

  // Filtra por proyecto o cliente, sin importar mayúsculas ni acentos.
  const visibles = proyectos.filter(
    (p) => coincide(p.nombre, busqueda) || coincide(p.cliente.nombre, busqueda),
  );
  const porCliente = Map.groupBy(
    visibles.toSorted((a, b) => a.cliente.nombre.localeCompare(b.cliente.nombre)),
    (p) => p.cliente.nombre,
  );

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        className="flex w-full items-center gap-2 rounded-md border border-linea px-3 py-1.5 text-left text-sm hover:bg-gris"
      >
        {elegido ? (
          <>
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: elegido.color }} />
            <span className="min-w-0 flex-1 truncate">
              {elegido.nombre}
              {tareaElegida && <span className="text-tenue"> · {tareaElegida.nombre}</span>}
              <span className="block truncate text-xs text-tenue">{elegido.cliente.nombre}</span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-tenue">{textoVacio}</span>
        )}
        <span className="text-tenue" aria-hidden="true">▾</span>
      </button>

      {abierto && (
        <div
          className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-linea bg-superficie shadow-lg"
          onKeyDown={(e) => {
            // Esc cierra solo la lista, no la ventana de carga.
            if (e.key === "Escape") {
              e.preventDefault();
              setAbierto(false);
            }
          }}
        >
          <input
            autoFocus
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar proyecto o cliente…"
            aria-label="Buscar proyecto o cliente"
            className="m-2 w-[calc(100%-1rem)] rounded-md border border-linea bg-superficie px-2.5 py-1.5 text-sm"
          />
          <ul className="max-h-64 overflow-y-auto pb-1 text-sm">
            {visibles.length === 0 && (
              <li className="px-3 py-2 text-tenue">No hay proyectos con ese nombre.</li>
            )}
            {[...porCliente].map(([cliente, delCliente]) => (
              <li key={cliente}>
                <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-tenue uppercase">
                  {cliente}
                </p>
                <ul>
                  {delCliente.map((p) => {
                    const suyas = tareasDe(p.id);
                    const abiertoEste = desplegado === p.id && suyas.length > 0;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() =>
                            suyas.length === 0
                              ? elegir(p.id, null)
                              : setDesplegado(abiertoEste ? null : p.id)
                          }
                          aria-expanded={suyas.length > 0 ? abiertoEste : undefined}
                          className={`flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gris ${
                            p.id === proyectoId ? "bg-acento-suave" : ""
                          }`}
                        >
                          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="flex-1 truncate">{p.nombre}</span>
                          {suyas.length > 0 && (
                            <span className="text-xs text-tenue">
                              {suyas.length} {suyas.length === 1 ? "tarea" : "tareas"} {abiertoEste ? "▴" : "▾"}
                            </span>
                          )}
                        </button>
                        {abiertoEste && (
                          <ul>
                            <OpcionTarea
                              nombre="Sin tarea"
                              elegida={p.id === proyectoId && tareaId === null}
                              onClick={() => elegir(p.id, null)}
                            />
                            {suyas.map((t) => (
                              <OpcionTarea
                                key={t.id}
                                nombre={t.nombre}
                                completada={t.completada}
                                elegida={t.id === tareaId}
                                onClick={() => elegir(p.id, t.id)}
                              />
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function OpcionTarea({
  nombre,
  completada = false,
  elegida,
  onClick,
}: {
  nombre: string;
  completada?: boolean;
  elegida: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full gap-2 py-1 pr-3 pl-8 text-left hover:bg-gris ${
          elegida ? "font-semibold text-acento" : "text-tenue"
        }`}
      >
        <span className="w-3">{elegida ? "✓" : ""}</span>
        {nombre}
        {completada && <span className="text-xs">(completada)</span>}
      </button>
    </li>
  );
}
