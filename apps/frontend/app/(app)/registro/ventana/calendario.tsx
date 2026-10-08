"use client";

import { useState } from "react";
import { Dialogo } from "@/componentes/dialogo";
import { DIAS, MESES, mismoDia } from "@/lib/fechas";

const ENCABEZADOS = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];

// Calendario para elegir la fecha del registro. Las semanas empiezan el lunes.
export function Calendario({
  fecha,
  onElegir,
  onCancelar,
}: {
  fecha: Date;
  onElegir: (dia: Date) => void;
  onCancelar: () => void;
}) {
  const [mes, setMes] = useState(
    () => new Date(fecha.getFullYear(), fecha.getMonth(), 1),
  );
  const hoy = new Date();
  const huecos = (mes.getDay() + 6) % 7;
  const diasDelMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const cambiarMes = (delta: number) =>
    setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1));

  const estiloFlecha =
    "grid size-8 place-items-center rounded-full text-lg text-tenue hover:bg-gris";

  return (
    <Dialogo etiqueta="Elegir fecha" onCerrar={onCancelar} className="w-76 p-4">
      <div className="grid gap-3">
        <div className="flex items-center justify-between font-semibold">
          <button type="button" onClick={() => cambiarMes(-1)} aria-label="Mes anterior" className={estiloFlecha}>
            ‹
          </button>
          <span>
            {MESES[mes.getMonth()][0].toUpperCase() + MESES[mes.getMonth()].slice(1)}{" "}
            {mes.getFullYear()}
          </span>
          <button type="button" onClick={() => cambiarMes(1)} aria-label="Mes siguiente" className={estiloFlecha}>
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {ENCABEZADOS.map((d) => (
            <span key={d} className="pb-1 text-[11px] text-tenue uppercase">
              {d}
            </span>
          ))}
          {Array.from({ length: huecos }, (_, i) => (
            <span key={`hueco-${i}`} />
          ))}
          {Array.from({ length: diasDelMes }, (_, i) => {
            const dia = new Date(mes.getFullYear(), mes.getMonth(), i + 1);
            const elegido = mismoDia(dia, fecha);
            return (
              <button
                key={i}
                type="button"
                autoFocus={elegido}
                onClick={() => onElegir(dia)}
                aria-label={`${DIAS[dia.getDay()]} ${i + 1} de ${MESES[dia.getMonth()]}`}
                aria-pressed={elegido}
                className={`aspect-square rounded-full text-sm tabular-nums ${
                  elegido
                    ? "bg-acento font-semibold text-superficie"
                    : "hover:bg-gris"
                } ${mismoDia(dia, hoy) && !elegido ? "ring-1 ring-acento ring-inset" : ""}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-acento hover:bg-gris"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
