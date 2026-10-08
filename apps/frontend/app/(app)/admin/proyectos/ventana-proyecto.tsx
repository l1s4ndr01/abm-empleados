"use client";

import { useState, useTransition } from "react";
import type { Cliente, Proyecto } from "@simep/tipos";
import { actualizarProyecto, crearProyecto } from "@/app/acciones/proyectos";
import {
  Campo,
  estiloEntrada,
  VentanaFormulario,
} from "@/componentes/ventana-formulario";

// Colores sugeridos. El primero es el que usa el backend si no se elige otro.
const PALETA = [
  { color: "#7986CB", nombre: "Índigo" },
  { color: "#64B5F6", nombre: "Azul" },
  { color: "#4DD0E1", nombre: "Cian" },
  { color: "#4DB6AC", nombre: "Verde azulado" },
  { color: "#81C784", nombre: "Verde" },
  { color: "#DCE775", nombre: "Lima" },
  { color: "#FFB74D", nombre: "Naranja" },
  { color: "#E57373", nombre: "Rojo" },
  { color: "#F06292", nombre: "Rosa" },
  { color: "#BA68C8", nombre: "Violeta" },
  { color: "#A1887F", nombre: "Marrón" },
  { color: "#90A4AE", nombre: "Gris" },
];

// Ventana para crear un proyecto, o editarlo si recibe uno.
export function VentanaProyecto({
  proyecto,
  clientes,
  clienteInicial,
  onCerrar,
}: {
  proyecto?: Proyecto;
  clientes: Cliente[];
  clienteInicial?: number;
  onCerrar: () => void;
}) {
  const [nombre, setNombre] = useState(proyecto?.nombre ?? "");
  const [clienteId, setClienteId] = useState(
    proyecto?.clienteId ?? clienteInicial ?? 0,
  );
  const [color, setColor] = useState(proyecto?.color ?? PALETA[0].color);
  const [error, setError] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();

  // Un proyecto de un cliente archivado mantiene su cliente en la lista.
  const opciones =
    proyecto && !clientes.some((c) => c.id === proyecto.clienteId)
      ? [...clientes, { ...proyecto.cliente, archivado: true }]
      : clientes;

  function guardar() {
    if (nombre.trim() === "") return setError("Escribí el nombre del proyecto.");
    if (!clienteId) return setError("Elegí el cliente.");
    const datos = { nombre: nombre.trim(), clienteId, color: color.toUpperCase() };
    startTransition(async () => {
      const resultado = proyecto
        ? await actualizarProyecto(proyecto.id, datos)
        : await crearProyecto(datos);
      if (resultado.error) setError(resultado.error);
      else onCerrar();
    });
  }

  const enPaleta = PALETA.some((p) => p.color === color.toUpperCase());

  return (
    <VentanaFormulario
      titulo={proyecto ? "Editar proyecto" : "Nuevo proyecto"}
      error={error}
      guardando={guardando}
      onGuardar={guardar}
      onCerrar={onCerrar}
    >
      <Campo etiqueta="Nombre" ayuda="No se puede repetir dentro del mismo cliente.">
        <input
          autoFocus
          required
          maxLength={100}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={estiloEntrada}
        />
      </Campo>
      <Campo etiqueta="Cliente">
        <select
          value={clienteId}
          onChange={(e) => setClienteId(Number(e.target.value))}
          className={estiloEntrada}
        >
          <option value={0} disabled>
            Elegí un cliente
          </option>
          {opciones.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
              {"archivado" in c && c.archivado ? " (archivado)" : ""}
            </option>
          ))}
        </select>
      </Campo>
      <fieldset className="grid gap-2 text-sm">
        <legend className="mb-1 font-medium">Color</legend>
        <div className="flex flex-wrap items-center gap-2">
          {PALETA.map((p) => (
            <button
              key={p.color}
              type="button"
              onClick={() => setColor(p.color)}
              aria-label={p.nombre}
              aria-pressed={color.toUpperCase() === p.color}
              title={p.nombre}
              className={`size-7 rounded-full ring-offset-2 ring-offset-superficie ${
                color.toUpperCase() === p.color ? "ring-2 ring-texto" : ""
              }`}
              style={{ backgroundColor: p.color }}
            />
          ))}
          <label
            className={`flex items-center gap-1.5 rounded-full border border-linea py-0.5 pr-2.5 pl-0.5 text-xs text-tenue ${
              enPaleta ? "" : "ring-2 ring-texto ring-offset-2 ring-offset-superficie"
            }`}
            title="Elegir otro color"
          >
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="size-6 cursor-pointer rounded-full border-0 bg-transparent p-0"
            />
            Otro
          </label>
        </div>
      </fieldset>
    </VentanaFormulario>
  );
}
