"use client";

import { useState, useTransition } from "react";
import type { Cliente, Proyecto, Tarea } from "@simep/tipos";
import { archivarProyecto, restaurarProyecto } from "@/app/acciones/proyectos";
import {
  BotonNuevo,
  BotonTexto,
  Buscador,
  Confirmacion,
  EtiquetaEstado,
  InterruptorArchivados,
} from "@/componentes/admin";
import { coincide } from "@/lib/texto";
import { PanelTareas } from "./panel-tareas";
import { VentanaProyecto } from "./ventana-proyecto";

const COLUMNAS = "grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_9rem_10rem]";

export function ListaProyectos({
  proyectos,
  clientes,
  tareas,
  conArchivados,
}: {
  proyectos: Proyecto[];
  clientes: Cliente[];
  tareas: Tarea[];
  conArchivados: boolean;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [clienteId, setClienteId] = useState(0);
  // "nuevo" abre la ventana vacía; un proyecto la abre para editarlo.
  const [editando, setEditando] = useState<Proyecto | "nuevo" | null>(null);

  // Los clientes del filtro salen de los proyectos que se están mostrando.
  const clientesDelFiltro = [
    ...new Map(proyectos.map((p) => [p.cliente.id, p.cliente])).values(),
  ].sort((a, b) => a.nombre.localeCompare(b.nombre));

  const visibles = proyectos
    .filter((p) => clienteId === 0 || p.clienteId === clienteId)
    .filter((p) => coincide(p.nombre, busqueda) || coincide(p.cliente.nombre, busqueda))
    .toSorted(
      (a, b) =>
        a.cliente.nombre.localeCompare(b.cliente.nombre) ||
        a.nombre.localeCompare(b.nombre),
    );
  const tareasDe = (id: number) => tareas.filter((t) => t.proyectoId === id);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <Buscador
            valor={busqueda}
            onCambiar={setBusqueda}
            placeholder="Buscar proyecto o cliente"
          />
          <select
            value={clienteId}
            onChange={(e) => setClienteId(Number(e.target.value))}
            aria-label="Filtrar por cliente"
            className="rounded-md border border-linea bg-superficie px-2 py-1.5 text-sm"
          >
            <option value={0}>Todos los clientes</option>
            {clientesDelFiltro.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <InterruptorArchivados activo={conArchivados} texto="Mostrar archivados" />
        </div>
        <BotonNuevo onClick={() => setEditando("nuevo")}>+ Nuevo proyecto</BotonNuevo>
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-linea px-4 py-10 text-center text-tenue">
          {proyectos.length === 0
            ? "Todavía no hay proyectos. Creá el primero con “+ Nuevo proyecto”."
            : "Ningún proyecto coincide con la búsqueda."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-linea bg-superficie">
          <div className={`grid ${COLUMNAS} gap-4 bg-gris px-4 py-2 text-xs font-semibold tracking-wider text-tenue uppercase`}>
            <span>Proyecto</span>
            <span>Cliente</span>
            <span>Tareas</span>
            <span />
          </div>
          <ul className="divide-y divide-linea">
            {visibles.map((proyecto) => (
              <FilaProyecto
                key={proyecto.id}
                proyecto={proyecto}
                tareas={tareasDe(proyecto.id)}
                onEditar={() => setEditando(proyecto)}
              />
            ))}
          </ul>
        </div>
      )}

      {editando && (
        <VentanaProyecto
          proyecto={editando === "nuevo" ? undefined : editando}
          clientes={clientes}
          clienteInicial={clienteId || undefined}
          onCerrar={() => setEditando(null)}
        />
      )}
    </>
  );
}

function FilaProyecto({
  proyecto,
  tareas,
  onEditar,
}: {
  proyecto: Proyecto;
  tareas: Tarea[];
  onEditar: () => void;
}) {
  const [conTareas, setConTareas] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurando, startTransition] = useTransition();
  const completadas = tareas.filter((t) => t.completada).length;

  return (
    <li>
      <div
        className={`grid ${COLUMNAS} items-center gap-4 px-4 py-2.5 text-sm ${
          proyecto.archivado ? "text-tenue" : ""
        }`}
      >
        <p className="flex min-w-0 items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: proyecto.color }}
          />
          <span className="truncate font-medium">{proyecto.nombre}</span>
          {proyecto.archivado && <EtiquetaEstado>Archivado</EtiquetaEstado>}
        </p>
        <p className="truncate">{proyecto.cliente.nombre}</p>
        <button
          type="button"
          onClick={() => setConTareas(!conTareas)}
          aria-expanded={conTareas}
          className="justify-self-start rounded-md px-2 py-1 text-left text-acento hover:bg-gris"
        >
          {tareas.length === 0
            ? "Sin tareas"
            : `${tareas.length} ${tareas.length === 1 ? "tarea" : "tareas"}`}
          {completadas > 0 && (
            <span className="text-xs text-tenue"> ({completadas} ✓)</span>
          )}{" "}
          <span aria-hidden="true">{conTareas ? "▴" : "▾"}</span>
        </button>
        <div className="flex justify-end gap-1">
          <BotonTexto onClick={onEditar}>Editar</BotonTexto>
          {proyecto.archivado ? (
            <BotonTexto
              disabled={restaurando}
              onClick={() =>
                startTransition(async () => {
                  const resultado = await restaurarProyecto(proyecto.id);
                  setError(resultado.error ?? null);
                })
              }
            >
              {restaurando ? "Restaurando…" : "Restaurar"}
            </BotonTexto>
          ) : (
            <BotonTexto peligro onClick={() => setConfirmando(true)}>
              Archivar
            </BotonTexto>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="border-t border-linea bg-peligro-suave px-4 py-2 text-sm text-peligro">
          {error}
        </p>
      )}
      {confirmando && (
        <Confirmacion
          pregunta={`¿Archivar “${proyecto.nombre}”? No se van a poder cargar horas en él. Las horas ya cargadas no se modifican.`}
          textoBoton="Archivar"
          accion={() => archivarProyecto(proyecto.id)}
          onCancelar={() => setConfirmando(false)}
        />
      )}
      {conTareas && <PanelTareas proyecto={proyecto} tareas={tareas} />}
    </li>
  );
}
