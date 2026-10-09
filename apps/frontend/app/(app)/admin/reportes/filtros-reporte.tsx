"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Empleado, Proyecto } from "@simep/tipos";
import {
  fechaCorta,
  fechaLocal,
  hoy,
  lunesDe,
  primeroDelMes,
  sumarDias,
  ultimoDelMes,
} from "@/lib/fechas";
import { Calendario } from "../../registro/ventana/calendario";
import { SelectorProyecto } from "../../registro/ventana/selector-proyecto";
import { urlReporte, type FiltrosReporte } from "./rutas";

// Atajos del rango. Cada uno devuelve [desde, hasta], las dos inclusive.
const ATAJOS: { texto: string; rango: () => [string, string] }[] = [
  { texto: "Esta semana", rango: () => semanaDe(hoy()) },
  { texto: "Semana pasada", rango: () => semanaDe(sumarDias(hoy(), -7)) },
  { texto: "Este mes", rango: () => mesDe(hoy()) },
  { texto: "Mes pasado", rango: () => mesDe(sumarDias(primeroDelMes(hoy()), -1)) },
];

function semanaDe(fecha: string): [string, string] {
  const lunes = lunesDe(fecha);
  return [lunes, sumarDias(lunes, 6)];
}

function mesDe(fecha: string): [string, string] {
  return [primeroDelMes(fecha), ultimoDelMes(fecha)];
}

// "2026-10-05" como fecha local, para el calendario.
const comoFechaLocal = (fecha: string) => {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(a, m - 1, d);
};

// Primero el rango de fechas y después los filtros de empleado y proyecto.
// Cada cambio se aplica enseguida y queda en la dirección.
export function FiltrosDelReporte({
  filtros,
  empleados,
  proyectos,
}: {
  filtros: FiltrosReporte;
  empleados: Empleado[];
  proyectos: Proyecto[];
}) {
  const router = useRouter();
  const [eligiendo, setEligiendo] = useState<"desde" | "hasta" | null>(null);

  const ir = (cambios: Partial<FiltrosReporte>) =>
    router.push(urlReporte({ ...filtros, ...cambios }));

  // Si el rango queda al revés, el otro extremo se mueve al mismo día.
  function elegirFecha(dia: Date) {
    const fecha = fechaLocal(dia);
    setEligiendo(null);
    if (eligiendo === "desde") {
      ir({ desde: fecha, hasta: fecha > filtros.hasta ? fecha : filtros.hasta });
    } else {
      ir({ hasta: fecha, desde: fecha < filtros.desde ? fecha : filtros.desde });
    }
  }

  const estiloCampo =
    "rounded-md border border-linea bg-superficie px-3 py-1.5 text-sm text-texto hover:bg-gris";
  const estiloEtiqueta = "text-xs font-semibold tracking-wider text-tenue uppercase";

  return (
    <div className="grid gap-4 rounded-lg border border-linea bg-superficie p-4 md:grid-cols-[auto_1fr_1fr]">
      <fieldset className="grid gap-1.5">
        <legend className={`${estiloEtiqueta} pb-1.5`}>Rango de fechas</legend>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setEligiendo("desde")} className={estiloCampo} aria-label="Desde">
            {fechaCorta(filtros.desde)}
          </button>
          <span className="text-tenue">–</span>
          <button type="button" onClick={() => setEligiendo("hasta")} className={estiloCampo} aria-label="Hasta">
            {fechaCorta(filtros.hasta)}
          </button>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {ATAJOS.map((atajo) => {
            const [desde, hasta] = atajo.rango();
            const elegido = desde === filtros.desde && hasta === filtros.hasta;
            return (
              <button
                key={atajo.texto}
                type="button"
                onClick={() => ir({ desde, hasta })}
                aria-pressed={elegido}
                className={`text-xs hover:underline ${elegido ? "font-semibold text-acento" : "text-tenue"}`}
              >
                {atajo.texto}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="grid content-start gap-1.5">
        <span className={estiloEtiqueta}>Empleado</span>
        <select
          value={filtros.empleado ?? ""}
          onChange={(e) => ir({ empleado: Number(e.target.value) || undefined })}
          className={estiloCampo}
        >
          <option value="">Todos los empleados</option>
          {empleados.map((e) => (
            <option key={e.id} value={e.id}>
              {e.apellido}, {e.nombre}
              {e.activo ? "" : " (inactivo)"}
            </option>
          ))}
        </select>
      </label>

      <div className="grid content-start gap-1.5">
        <span className={estiloEtiqueta}>Proyecto</span>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <SelectorProyecto
              proyectos={proyectos}
              tareas={[]}
              proyectoId={filtros.proyecto ?? null}
              tareaId={null}
              onElegir={(proyecto) => ir({ proyecto })}
              textoVacio="Todos los proyectos"
            />
          </div>
          {filtros.proyecto && (
            <button
              type="button"
              onClick={() => ir({ proyecto: undefined })}
              className="py-1.5 text-sm text-acento hover:underline"
            >
              Todos
            </button>
          )}
        </div>
      </div>

      {eligiendo && (
        <Calendario
          fecha={comoFechaLocal(eligiendo === "desde" ? filtros.desde : filtros.hasta)}
          onElegir={elegirFecha}
          onCancelar={() => setEligiendo(null)}
        />
      )}
    </div>
  );
}
