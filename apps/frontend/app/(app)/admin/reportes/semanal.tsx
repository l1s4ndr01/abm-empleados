"use client";

import { useState } from "react";
import { DIAS_CORTOS, formatearDuracion, rangoDeLaSemana } from "@/lib/fechas";
import type { FilaSemanal, FilasSemanales, Semana } from "@/lib/reportes";

const OPCIONES: { valor: FilasSemanales; nombre: string }[] = [
  { valor: "empleado", nombre: "Empleados" },
  { valor: "proyecto", nombre: "Proyectos" },
];

// Una grilla por semana del rango: filas de empleados (o proyectos) y
// columnas de lunes a domingo, con los totales por fila y por día.
export function Semanal({ semanas }: { semanas: Semana[] }) {
  const [filas, setFilas] = useState<FilasSemanales>("empleado");

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-end gap-2 text-sm text-tenue" role="group" aria-label="Filas">
        Filas
        <span className="flex rounded-md border border-linea bg-superficie p-0.5">
          {OPCIONES.map((o) => (
            <button
              key={o.valor}
              type="button"
              aria-pressed={o.valor === filas}
              onClick={() => setFilas(o.valor)}
              className={`rounded px-2.5 py-1 ${
                o.valor === filas ? "bg-acento-suave font-semibold text-acento" : "hover:text-texto"
              }`}
            >
              {o.nombre}
            </button>
          ))}
        </span>
      </div>

      {semanas.map((semana) => (
        <Grilla
          key={semana.lunes}
          semana={semana}
          filas={semana.filas[filas]}
          titulo={filas === "empleado" ? "Empleado" : "Proyecto"}
        />
      ))}
    </div>
  );
}

function Grilla({
  semana,
  filas,
  titulo,
}: {
  semana: Semana;
  filas: FilaSemanal[];
  titulo: string;
}) {
  const fueraDelRango = (i: number) => !semana.dias[i].enRango;
  const celda = "px-2 py-2 text-right font-mono tabular-nums";

  return (
    <section className="overflow-x-auto rounded-lg border border-linea bg-superficie">
      <header className="flex justify-between bg-gris px-4 py-2 text-sm text-tenue">
        <h2>Semana {rangoDeLaSemana(semana.lunes)}</h2>
        <span>
          Total{" "}
          <span className="font-mono font-medium text-texto">{formatearDuracion(semana.segundos)}</span>
        </span>
      </header>

      {filas.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-tenue">Sin horas en esta semana.</p>
      ) : (
        <table className="w-full min-w-[42rem] text-sm">
          <thead className="text-xs text-tenue">
            <tr className="border-b border-linea">
              <th className="px-4 py-2 text-left font-normal">{titulo}</th>
              {semana.dias.map(({ fecha }, i) => (
                <th
                  key={fecha}
                  className={`w-16 px-2 py-2 text-right font-normal ${fueraDelRango(i) ? "bg-gris/60" : ""}`}
                >
                  {DIAS_CORTOS[(i + 1) % 7]} {Number(fecha.slice(8))}
                </th>
              ))}
              <th className="w-20 px-4 py-2 text-right font-semibold text-texto">Total</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila.clave} className="border-b border-linea">
                <td className="max-w-0 px-4 py-2">
                  <span className="flex min-w-0 items-center gap-2">
                    {fila.color && (
                      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: fila.color }} />
                    )}
                    <span className="truncate" title={fila.detalle ? `${fila.nombre} · ${fila.detalle}` : fila.nombre}>
                      {fila.nombre}
                      {fila.detalle && <span className="text-tenue"> · {fila.detalle}</span>}
                    </span>
                  </span>
                </td>
                {fila.porDia.map((segundos, i) => (
                  <td key={i} className={`${celda} ${fueraDelRango(i) ? "bg-gris/60" : ""}`}>
                    <Valor segundos={segundos} />
                  </td>
                ))}
                <td className={`${celda} px-4 font-medium`}>{formatearDuracion(fila.segundos)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="px-4 py-2">Total</td>
              {semana.porDia.map((segundos, i) => (
                <td key={i} className={`${celda} ${fueraDelRango(i) ? "bg-gris/60" : ""}`}>
                  <Valor segundos={segundos} />
                </td>
              ))}
              <td className={`${celda} px-4`}>{formatearDuracion(semana.segundos)}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </section>
  );
}

// Los días sin horas se muestran con una raya, para que se lean mejor los que tienen.
function Valor({ segundos }: { segundos: number }) {
  return segundos === 0 ? (
    <span className="text-tenue/60">–</span>
  ) : (
    <>{formatearDuracion(segundos)}</>
  );
}
