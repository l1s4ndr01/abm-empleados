"use client";

import { useState, useTransition } from "react";
import type { Cliente } from "@simep/tipos";
import { archivarCliente, restaurarCliente } from "@/app/acciones/clientes";
import {
  BotonNuevo,
  BotonTexto,
  Buscador,
  Confirmacion,
  EtiquetaEstado,
  InterruptorArchivados,
} from "@/componentes/admin";
import { coincide } from "@/lib/texto";
import { VentanaCliente } from "./ventana-cliente";

export function ListaClientes({
  clientes,
  conArchivados,
}: {
  clientes: Cliente[];
  conArchivados: boolean;
}) {
  const [busqueda, setBusqueda] = useState("");
  // "nuevo" abre la ventana vacía; un cliente la abre para editarlo.
  const [editando, setEditando] = useState<Cliente | "nuevo" | null>(null);

  const visibles = clientes.filter(
    (c) =>
      coincide(c.nombre, busqueda) ||
      coincide(c.email, busqueda) ||
      coincide(c.direccion, busqueda),
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <Buscador
            valor={busqueda}
            onCambiar={setBusqueda}
            placeholder="Buscar por nombre, email o dirección"
          />
          <InterruptorArchivados activo={conArchivados} texto="Mostrar archivados" />
        </div>
        <BotonNuevo onClick={() => setEditando("nuevo")}>+ Nuevo cliente</BotonNuevo>
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-linea px-4 py-10 text-center text-tenue">
          {clientes.length === 0
            ? "Todavía no hay clientes. Creá el primero con “+ Nuevo cliente”."
            : `Ningún cliente coincide con “${busqueda}”.`}
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-linea bg-superficie">
          <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_10rem] gap-4 bg-gris px-4 py-2 text-xs font-semibold tracking-wider text-tenue uppercase">
            <span>Nombre</span>
            <span>Email</span>
            <span>Dirección</span>
            <span />
          </div>
          <ul className="divide-y divide-linea">
            {visibles.map((cliente) => (
              <FilaCliente
                key={cliente.id}
                cliente={cliente}
                onEditar={() => setEditando(cliente)}
              />
            ))}
          </ul>
        </div>
      )}

      {editando && (
        <VentanaCliente
          cliente={editando === "nuevo" ? undefined : editando}
          onCerrar={() => setEditando(null)}
        />
      )}
    </>
  );
}

function FilaCliente({
  cliente,
  onEditar,
}: {
  cliente: Cliente;
  onEditar: () => void;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);

  return (
    <li>
      <div
        className={`grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_10rem] items-center gap-4 px-4 py-2.5 text-sm ${
          cliente.archivado ? "text-tenue" : ""
        }`}
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2">
            <span className="truncate font-medium">{cliente.nombre}</span>
            {cliente.archivado && <EtiquetaEstado>Archivado</EtiquetaEstado>}
          </p>
          {cliente.nota && (
            <p className="truncate text-xs text-tenue" title={cliente.nota}>
              {cliente.nota}
            </p>
          )}
        </div>
        <p className="truncate" title={cliente.email ?? undefined}>
          {cliente.email ?? <span className="text-tenue">—</span>}
        </p>
        <p className="truncate" title={cliente.direccion ?? undefined}>
          {cliente.direccion ?? <span className="text-tenue">—</span>}
        </p>
        <div className="flex justify-end gap-1">
          <BotonTexto onClick={onEditar}>Editar</BotonTexto>
          {cliente.archivado ? (
            <BotonTexto onClick={() => setRestaurando(true)}>
              Restaurar
            </BotonTexto>
          ) : (
            <BotonTexto peligro onClick={() => setConfirmando(true)}>
              Archivar
            </BotonTexto>
          )}
        </div>
      </div>
      {restaurando && (
        <ConfirmarRestaurar
          cliente={cliente}
          onCerrar={() => setRestaurando(false)}
        />
      )}
      {confirmando && (
        <Confirmacion
          pregunta={`¿Archivar “${cliente.nombre}”? También se archivan sus proyectos, así que no se van a poder cargar horas en ellos. Las horas ya cargadas no se modifican.`}
          textoBoton="Archivar"
          accion={() => archivarCliente(cliente.id)}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </li>
  );
}

// Al restaurar se pregunta si vuelven también sus proyectos. Con "Restaurar
// con proyectos" vuelven todos, incluso los que se habían archivado antes.
function ConfirmarRestaurar({
  cliente,
  onCerrar,
}: {
  cliente: Cliente;
  onCerrar: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [enCurso, startTransition] = useTransition();

  const restaurar = (conProyectos: boolean) =>
    startTransition(async () => {
      const resultado = await restaurarCliente(cliente.id, conProyectos);
      if (resultado.error) setError(resultado.error);
      else onCerrar();
    });

  return (
    <div
      role="alertdialog"
      aria-label={`Restaurar ${cliente.nombre}`}
      className="flex flex-wrap items-center justify-between gap-3 border-t border-linea bg-acento-suave px-4 py-2 text-sm"
    >
      <span>
        {error ??
          `¿Restaurar también los proyectos de “${cliente.nombre}”? Vuelven todos sus proyectos archivados.`}
      </span>
      <span className="flex flex-wrap gap-2">
        <button
          type="button"
          autoFocus
          disabled={enCurso}
          onClick={() => restaurar(true)}
          className="rounded-md bg-acento px-3 py-1 font-semibold text-superficie disabled:opacity-50"
        >
          Restaurar con proyectos
        </button>
        <button
          type="button"
          disabled={enCurso}
          onClick={() => restaurar(false)}
          className="rounded-md border border-acento/40 px-3 py-1 text-acento disabled:opacity-50"
        >
          Solo el cliente
        </button>
        <button
          type="button"
          disabled={enCurso}
          onClick={onCerrar}
          className="rounded-md px-3 py-1 text-tenue hover:text-texto"
        >
          Cancelar
        </button>
      </span>
    </div>
  );
}
