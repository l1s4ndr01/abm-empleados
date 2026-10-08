"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { Empleado } from "@simep/tipos";
import { desactivarEmpleado, reactivarEmpleado } from "@/app/acciones/empleados";
import {
  BotonNuevo,
  BotonTexto,
  Buscador,
  Confirmacion,
  EtiquetaEstado,
  InterruptorArchivados,
} from "@/componentes/admin";
import { coincide } from "@/lib/texto";
import { VentanaEmpleado } from "./ventana-empleado";

const COLUMNAS = "grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_8rem_9rem_10rem]";

export function ListaEmpleados({
  empleados,
  conInactivos,
  miId,
}: {
  empleados: Empleado[];
  conInactivos: boolean;
  miId: number;
}) {
  const [busqueda, setBusqueda] = useState("");
  // "nuevo" abre la ventana vacía; un empleado la abre para editarlo.
  const [editando, setEditando] = useState<Empleado | "nuevo" | null>(null);

  const visibles = empleados.filter(
    (e) =>
      coincide(`${e.nombre} ${e.apellido}`, busqueda) ||
      coincide(`${e.apellido} ${e.nombre}`, busqueda) ||
      coincide(e.email, busqueda),
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <Buscador
            valor={busqueda}
            onCambiar={setBusqueda}
            placeholder="Buscar por nombre o email"
          />
          <InterruptorArchivados activo={conInactivos} texto="Mostrar inactivos" />
        </div>
        <BotonNuevo onClick={() => setEditando("nuevo")}>+ Nuevo empleado</BotonNuevo>
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-linea px-4 py-10 text-center text-tenue">
          Ningún empleado coincide con “{busqueda}”.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-linea bg-superficie">
          <div className={`grid ${COLUMNAS} gap-4 bg-gris px-4 py-2 text-xs font-semibold tracking-wider text-tenue uppercase`}>
            <span>Empleado</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Ingreso</span>
            <span />
          </div>
          <ul className="divide-y divide-linea">
            {visibles.map((empleado) => (
              <FilaEmpleado
                key={empleado.id}
                empleado={empleado}
                esYo={empleado.id === miId}
                onEditar={() => setEditando(empleado)}
              />
            ))}
          </ul>
        </div>
      )}

      {editando && (
        <VentanaEmpleado
          empleado={editando === "nuevo" ? undefined : editando}
          esYo={editando !== "nuevo" && editando.id === miId}
          onCerrar={() => setEditando(null)}
        />
      )}
    </>
  );
}

function FilaEmpleado({
  empleado,
  esYo,
  onEditar,
}: {
  empleado: Empleado;
  esYo: boolean;
  onEditar: () => void;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reactivando, startTransition] = useTransition();
  const nombre = `${empleado.nombre} ${empleado.apellido}`;

  return (
    <li>
      <div
        className={`grid ${COLUMNAS} items-center gap-4 px-4 py-2.5 text-sm ${
          empleado.activo ? "" : "text-tenue"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {empleado.fotoUrl ? (
            <Image
              src={empleado.fotoUrl}
              alt=""
              width={28}
              height={28}
              className="shrink-0 rounded-full"
            />
          ) : (
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-acento-suave text-xs font-semibold text-acento">
              {empleado.nombre[0]}
              {empleado.apellido[0]}
            </span>
          )}
          <span className="truncate font-medium">
            {empleado.apellido}, {empleado.nombre}
          </span>
          {esYo && <span className="text-xs text-tenue">(vos)</span>}
          {!empleado.activo && <EtiquetaEstado>Inactivo</EtiquetaEstado>}
        </div>
        <p className="truncate" title={empleado.email}>
          {empleado.email}
        </p>
        <p>
          {empleado.rol === "ADMIN" ? (
            <span className="rounded-full bg-acento-suave px-2 py-0.5 text-xs font-semibold text-acento">
              Administrador
            </span>
          ) : (
            "Empleado"
          )}
        </p>
        <p className={empleado.googleId ? "" : "text-tenue"}>
          {empleado.googleId ? "Ya entró" : "Todavía no entró"}
        </p>
        <div className="flex justify-end gap-1">
          <BotonTexto onClick={onEditar}>Editar</BotonTexto>
          {empleado.activo ? (
            // Desactivarse a uno mismo cerraría su propia sesión.
            !esYo && (
              <BotonTexto peligro onClick={() => setConfirmando(true)}>
                Desactivar
              </BotonTexto>
            )
          ) : (
            <BotonTexto
              disabled={reactivando}
              onClick={() =>
                startTransition(async () => {
                  const resultado = await reactivarEmpleado(empleado.id);
                  setError(resultado.error ?? null);
                })
              }
            >
              {reactivando ? "Reactivando…" : "Reactivar"}
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
          pregunta={`¿Desactivar a ${nombre}? No va a poder entrar a SIMEP. Sus horas cargadas se conservan.`}
          textoBoton="Desactivar"
          accion={() => desactivarEmpleado(empleado.id)}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </li>
  );
}
