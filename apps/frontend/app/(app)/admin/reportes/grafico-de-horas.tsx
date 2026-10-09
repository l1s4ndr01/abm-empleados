"use client";

import { useState } from "react";
import { DIAS_CORTOS, MESES, MESES_CORTOS, formatearDuracion, tituloDelDia } from "@/lib/fechas";
import type { Escala, ProyectoDelGrafico, Tramo } from "@/lib/reportes";

const ALTO = 200; // px del área de las barras
const SEPARACION = 2; // px entre los pedazos de una pila
// Pasos posibles de la escala vertical, en horas.
const PASOS = [1, 2, 4, 5, 8, 10, 20, 25, 50, 100, 200, 250, 500, 1000];

const comoDia = (fecha: string) => new Date(`${fecha}T00:00:00Z`);

function etiqueta(fecha: string, escala: Escala, primera: boolean) {
  const dia = comoDia(fecha);
  if (escala === "dia") return `${DIAS_CORTOS[dia.getUTCDay()]} ${dia.getUTCDate()}`;
  if (escala === "semana") return `${dia.getUTCDate()} ${MESES_CORTOS[dia.getUTCMonth()]}`;
  // El año va en la primera barra y en cada enero.
  const mes = MESES_CORTOS[dia.getUTCMonth()];
  return primera || dia.getUTCMonth() === 0 ? `${mes} ${dia.getUTCFullYear()}` : mes;
}

function titulo(fecha: string, escala: Escala) {
  const dia = comoDia(fecha);
  if (escala === "dia") return tituloDelDia(fecha);
  if (escala === "semana") return `Semana del ${dia.getUTCDate()} ${MESES_CORTOS[dia.getUTCMonth()]}`;
  const mes = MESES[dia.getUTCMonth()];
  return `${mes[0].toUpperCase()}${mes.slice(1)} ${dia.getUTCFullYear()}`;
}

// Hasta 5 líneas de referencia con números redondos.
function escalaVertical(maximoSegundos: number) {
  const maximo = Math.max(maximoSegundos / 3600, 1);
  const paso = PASOS.find((p) => maximo / p <= 5) ?? PASOS.at(-1)!;
  const tope = Math.ceil(maximo / paso) * paso;
  return { tope, marcas: Array.from({ length: tope / paso + 1 }, (_, i) => i * paso) };
}

// Barras apiladas por proyecto, con el color de cada uno. Al pasar el mouse
// (o con el teclado) sobre una barra se ve el detalle de ese tramo.
export function GraficoDeHoras({
  escala,
  proyectos,
  tramos,
}: {
  escala: Escala;
  proyectos: ProyectoDelGrafico[];
  tramos: Tramo[];
}) {
  const [elegido, setElegido] = useState<number | null>(null);
  const { tope, marcas } = escalaVertical(Math.max(...tramos.map((t) => t.segundos)));
  const porId = new Map(proyectos.map((p) => [p.id, p]));
  const altoDe = (segundos: number) => (segundos / 3600 / tope) * ALTO;
  // Con muchas barras, solo se rotula una de cada tanto.
  const cadaCuanto = Math.ceil(tramos.length / 12);

  return (
    <section className="grid gap-4 rounded-lg border border-linea bg-superficie p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="font-semibold">
          Horas por {escala === "dia" ? "día" : escala}
        </h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-tenue" aria-label="Proyectos">
          {proyectos.map((p) => (
            <li key={p.id} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
              {p.nombre}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-2">
        {/* Escala vertical */}
        <div className="relative w-9 text-right text-[11px] text-tenue tabular-nums" style={{ height: ALTO }}>
          {marcas.map((m) => (
            <span key={m} className="absolute right-0 translate-y-1/2" style={{ bottom: (m / tope) * ALTO }}>
              {m} h
            </span>
          ))}
        </div>

        <div className="relative" style={{ height: ALTO }}>
          {marcas.map((m) => (
            <div
              key={m}
              className="absolute inset-x-0 border-t border-linea"
              style={{ bottom: (m / tope) * ALTO }}
            />
          ))}
          <div className="absolute inset-0 flex">
            {tramos.map((tramo, i) => {
              const activo = elegido === i;
              let base = 0;
              return (
                <button
                  key={tramo.fecha}
                  type="button"
                  onPointerEnter={() => setElegido(i)}
                  onPointerLeave={() => setElegido(null)}
                  onFocus={() => setElegido(i)}
                  onBlur={() => setElegido(null)}
                  aria-label={`${titulo(tramo.fecha, escala)}: ${formatearDuracion(tramo.segundos)} horas`}
                  className={`relative flex-1 focus:outline-none ${activo ? "bg-gris/70" : ""}`}
                >
                  <span className="absolute inset-x-0 bottom-0 mx-auto block h-full w-[min(24px,70%)]">
                    {tramo.porProyecto.map((parte, j) => {
                      const alto = altoDe(parte.segundos);
                      const abajo = base;
                      base += alto;
                      const ultimo = j === tramo.porProyecto.length - 1;
                      // La separación sale del pedazo de arriba, para no
                      // agrandar la barra.
                      const separacion = j > 0 ? SEPARACION : 0;
                      return (
                        <span
                          key={parte.id}
                          className={`absolute inset-x-0 block ${ultimo ? "rounded-t-[4px]" : ""}`}
                          style={{
                            bottom: abajo + separacion,
                            height: Math.max(alto - separacion, 1),
                            backgroundColor: porId.get(parte.id)?.color,
                            filter: activo ? "brightness(1.08)" : undefined,
                          }}
                        />
                      );
                    })}
                  </span>
                </button>
              );
            })}
          </div>

          {elegido !== null && (
            <Detalle
              tramo={tramos[elegido]}
              escala={escala}
              porId={porId}
              // Se alinea al costado que tenga lugar.
              posicion={(elegido + 0.5) / tramos.length}
            />
          )}
        </div>

        <span />
        <div className="flex pt-1.5 text-[11px] text-tenue">
          {tramos.map((tramo, i) => (
            <span key={tramo.fecha} className="flex-1 text-center whitespace-nowrap">
              {i % cadaCuanto === 0 ? etiqueta(tramo.fecha, escala, i === 0) : ""}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Detalle({
  tramo,
  escala,
  porId,
  posicion,
}: {
  tramo: Tramo;
  escala: Escala;
  porId: Map<number, ProyectoDelGrafico>;
  posicion: number;
}) {
  const izquierda = posicion < 0.5;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute top-2 z-10 w-60 rounded-md border border-linea bg-superficie px-3 py-2 text-xs shadow-lg"
      style={
        izquierda
          ? { left: `calc(${posicion * 100}% + 1rem)` }
          : { right: `calc(${(1 - posicion) * 100}% + 1rem)` }
      }
    >
      <p className="flex justify-between gap-3 pb-1.5">
        <span className="text-tenue">{titulo(tramo.fecha, escala)}</span>
        <span className="font-mono font-semibold tabular-nums">{formatearDuracion(tramo.segundos)}</span>
      </p>
      {tramo.porProyecto.length === 0 ? (
        <p className="text-tenue">Sin horas.</p>
      ) : (
        <ul className="grid gap-1">
          {tramo.porProyecto.toReversed().map((parte) => {
            const proyecto = porId.get(parte.id)!;
            return (
              <li key={parte.id} className="flex items-center gap-2">
                <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: proyecto.color }} />
                <span className="font-mono font-semibold tabular-nums">{formatearDuracion(parte.segundos)}</span>
                <span className="truncate text-tenue">{proyecto.nombre}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
