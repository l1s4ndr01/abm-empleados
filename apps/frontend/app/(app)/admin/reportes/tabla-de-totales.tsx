"use client";

import { useState } from "react";
import { formatearDuracion } from "@/lib/fechas";
import type { Agrupacion, FilaDeTotales } from "@/lib/reportes";

const AGRUPACIONES: { valor: Agrupacion; nombre: string; hijos: string }[] = [
  { valor: "proyecto", nombre: "Proyecto", hijos: "tareas" },
  { valor: "cliente", nombre: "Cliente", hijos: "proyectos" },
  { valor: "empleado", nombre: "Empleado", hijos: "proyectos" },
];

const porcentaje = (parte: number, total: number) =>
  total === 0 ? 0 : Math.round((parte / total) * 1000) / 10;

// Totales del rango agrupados por proyecto, cliente o empleado. Cada fila
// se despliega para ver cómo se reparten sus horas.
export function TablaDeTotales({
  grupos,
  segundos,
}: {
  grupos: Record<Agrupacion, FilaDeTotales[]>;
  segundos: number;
}) {
  const [agrupacion, setAgrupacion] = useState<Agrupacion>("proyecto");
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());
  const actual = AGRUPACIONES.find((a) => a.valor === agrupacion)!;

  function alternar(clave: string) {
    const nuevas = new Set(abiertas);
    if (nuevas.has(clave)) nuevas.delete(clave);
    else nuevas.add(clave);
    setAbiertas(nuevas);
  }

  return (
    <section className="overflow-hidden rounded-lg border border-linea bg-superficie">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linea px-4 py-3">
        <h2 className="font-semibold">Totales</h2>
        <div className="flex items-center gap-2 text-sm text-tenue" role="group" aria-label="Agrupar por">
          Agrupar por
          <span className="flex rounded-md border border-linea p-0.5">
            {AGRUPACIONES.map((a) => (
              <button
                key={a.valor}
                type="button"
                aria-pressed={a.valor === agrupacion}
                onClick={() => {
                  setAgrupacion(a.valor);
                  setAbiertas(new Set());
                }}
                className={`rounded px-2.5 py-1 ${
                  a.valor === agrupacion ? "bg-acento-suave font-semibold text-acento" : "hover:text-texto"
                }`}
              >
                {a.nombre}
              </button>
            ))}
          </span>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="text-left text-xs text-tenue">
          <tr className="border-b border-linea">
            <th className="px-4 py-2 font-normal">{actual.nombre}</th>
            <th className="w-24 px-4 py-2 text-right font-normal">Horas</th>
            <th className="w-44 px-4 py-2 font-normal max-sm:hidden">% del total</th>
          </tr>
        </thead>
        <tbody>
          {grupos[agrupacion].map((fila) => {
            const abierta = abiertas.has(fila.clave);
            return [
              <tr key={fila.clave} className="border-b border-linea last:border-b-0">
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => alternar(fila.clave)}
                    aria-expanded={abierta}
                    title={`${abierta ? "Ocultar" : "Ver"} ${actual.hijos}`}
                    className="flex items-center gap-2 text-left"
                  >
                    <span className="w-3 text-tenue" aria-hidden="true">{abierta ? "▾" : "▸"}</span>
                    <Nombre fila={fila} />
                  </button>
                </td>
                <Horas fila={fila} total={segundos} />
              </tr>,
              ...(abierta
                ? fila.hijos.map((hijo) => (
                    <tr key={`${fila.clave}-${hijo.clave}`} className="border-b border-linea bg-fondo/60 text-tenue">
                      <td className="py-1.5 pr-4 pl-13">
                        <Nombre fila={hijo} />
                      </td>
                      <Horas fila={hijo} total={segundos} />
                    </tr>
                  ))
                : []),
            ];
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-linea font-semibold">
            <td className="px-4 py-2">Total</td>
            <td className="px-4 py-2 text-right font-mono tabular-nums">{formatearDuracion(segundos)}</td>
            <td className="max-sm:hidden" />
          </tr>
        </tfoot>
      </table>
    </section>
  );
}

function Nombre({ fila }: { fila: FilaDeTotales }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {fila.color && <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: fila.color }} />}
      <span className="truncate">
        {fila.nombre}
        {fila.detalle && <span className="text-tenue"> · {fila.detalle}</span>}
      </span>
    </span>
  );
}

function Horas({ fila, total }: { fila: FilaDeTotales; total: number }) {
  const valor = porcentaje(fila.segundos, total);
  return (
    <>
      <td className="px-4 py-2 text-right font-mono tabular-nums">{formatearDuracion(fila.segundos)}</td>
      <td className="px-4 py-2 max-sm:hidden">
        <span className="flex items-center gap-2">
          <span className="h-1.5 flex-1 rounded-full bg-gris">
            <span className="block h-full rounded-full bg-acento" style={{ width: `${valor}%` }} />
          </span>
          <span className="w-11 text-right text-xs tabular-nums">{valor.toLocaleString("es-AR")}%</span>
        </span>
      </td>
    </>
  );
}
