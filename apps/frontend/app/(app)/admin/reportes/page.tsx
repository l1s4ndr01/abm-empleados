import type { Metadata } from "next";
import Link from "next/link";
import type { Empleado, Proyecto, Registro } from "@simep/tipos";
import { pedirAlBackend } from "@/lib/api";
import { exigirAdmin } from "@/lib/empleado-actual";
import {
  comienzoDelDia,
  esFechaValida,
  formatearDuracion,
  hoy,
  lunesDe,
  sumarDias,
} from "@/lib/fechas";
import {
  horasPorTramo,
  pedazosDelPeriodo,
  totales,
  totalesAgrupados,
  type Pedazo,
} from "@/lib/reportes";
import { Detallado } from "./detallado";
import { FiltrosDelReporte } from "./filtros-reporte";
import { GraficoDeHoras } from "./grafico-de-horas";
import { urlReporte, type FiltrosReporte, type Vista } from "./rutas";
import { TablaDeTotales } from "./tabla-de-totales";

export const metadata: Metadata = { title: "Reportes" };

const VISTAS: { vista: Vista; nombre: string }[] = [
  { vista: "resumen", nombre: "Resumen" },
  { vista: "detallado", nombre: "Detallado" },
  { vista: "semanal", nombre: "Semanal" },
];

export default async function ReportesPage({
  searchParams,
}: PageProps<"/admin/reportes">) {
  await exigirAdmin();
  const parametros = await searchParams;
  const filtros = leerFiltros(parametros);

  // Se piden los registros que tocan el rango, aunque hayan empezado antes:
  // después se parten en la medianoche y se recortan al rango.
  const periodo = {
    desde: comienzoDelDia(filtros.desde),
    hasta: comienzoDelDia(sumarDias(filtros.hasta, 1)),
  };
  const consulta = new URLSearchParams({ ...periodo, solapados: "true" });
  if (filtros.empleado) consulta.set("empleadoId", String(filtros.empleado));
  if (filtros.proyecto) consulta.set("proyectoId", String(filtros.proyecto));
  // Empleados inactivos y proyectos archivados también: tienen horas pasadas.
  const [registros, empleados, proyectos] = await Promise.all([
    pedirAlBackend<Registro[]>(`/registros?${consulta}`),
    pedirAlBackend<Empleado[]>("/empleados?inactivos=true"),
    pedirAlBackend<Proyecto[]>("/proyectos?archivados=true"),
  ]);

  const pedazos = pedazosDelPeriodo(registros, periodo);
  const total = totales(pedazos);
  const proyecto = proyectos.find((p) => p.id === filtros.proyecto);

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <h1 className="text-xl font-semibold">Reportes</h1>

      <FiltrosDelReporte filtros={filtros} empleados={empleados} proyectos={proyectos} />

      <nav className="flex gap-1 border-b border-linea" aria-label="Tipo de reporte">
        {VISTAS.map(({ vista, nombre }) => (
          <Link
            key={vista}
            href={urlReporte({ ...filtros, vista })}
            aria-current={vista === filtros.vista ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${
              vista === filtros.vista
                ? "border-acento font-semibold text-acento"
                : "border-transparent text-tenue hover:text-texto"
            }`}
          >
            {nombre}
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap gap-3">
        <Dato titulo="Horas totales" valor={formatearDuracion(total.segundos)} />
        {/* Con un empleado elegido siempre sería 1. */}
        {!filtros.empleado && (
          <Dato
            titulo={proyecto ? `Personas en ${proyecto.nombre}` : "Personas que trabajaron"}
            valor={String(total.personas)}
          />
        )}
      </div>

      {pedazos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-linea px-4 py-10 text-center text-tenue">
          No hay horas cargadas con estos filtros.
        </p>
      ) : filtros.vista === "resumen" ? (
        <Resumen pedazos={pedazos} filtros={filtros} segundos={total.segundos} />
      ) : filtros.vista === "detallado" ? (
        <Detallado pedazos={pedazos} />
      ) : (
        <p className="rounded-lg border border-dashed border-linea px-4 py-10 text-center text-tenue">
          {VISTAS.find((v) => v.vista === filtros.vista)?.nombre}: en construcción.
        </p>
      )}

      <p className="text-xs text-tenue">
        Las horas se reparten en la medianoche. En Registro de tiempo, en
        cambio, cada registro se muestra entero en el día en que empieza.
      </p>
    </div>
  );
}

function Resumen({
  pedazos,
  filtros,
  segundos,
}: {
  pedazos: Pedazo[];
  filtros: FiltrosReporte;
  segundos: number;
}) {
  const grafico = horasPorTramo(pedazos, filtros.desde, filtros.hasta);
  return (
    <>
      <GraficoDeHoras {...grafico} />
      <TablaDeTotales grupos={totalesAgrupados(pedazos)} segundos={segundos} />
    </>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="min-w-44 rounded-lg border border-linea bg-superficie px-4 py-3">
      <p className="text-xs text-tenue">{titulo}</p>
      <p className="font-mono text-2xl font-medium tabular-nums">{valor}</p>
    </div>
  );
}

// Sin fechas válidas, el reporte arranca en la semana actual.
function leerFiltros(
  parametros: Record<string, string | string[] | undefined>,
): FiltrosReporte {
  const texto = (nombre: string) => {
    const valor = parametros[nombre];
    return typeof valor === "string" ? valor : undefined;
  };
  const numero = (nombre: string) => {
    const valor = Number(texto(nombre));
    return Number.isInteger(valor) && valor > 0 ? valor : undefined;
  };

  let desde = texto("desde");
  let hasta = texto("hasta");
  if (!desde || !hasta || !esFechaValida(desde) || !esFechaValida(hasta) || desde > hasta) {
    desde = lunesDe(hoy());
    hasta = sumarDias(desde, 6);
  }
  const vista = VISTAS.find((v) => v.vista === texto("vista"))?.vista ?? "resumen";
  return { vista, desde, hasta, empleado: numero("empleado"), proyecto: numero("proyecto") };
}
