import type { Metadata } from "next";
import Link from "next/link";
import { pedirAlBackend } from "@/lib/api";
import { obtenerEmpleadoActual } from "@/lib/empleado-actual";
import {
  comienzoDelDia,
  esFechaValida,
  fechaDe,
  formatearDuracion,
  hoy,
  lunesDe,
  rangoDeLaSemana,
  sumarDias,
} from "@/lib/fechas";
import type { Proyecto, Registro, Tarea } from "@simep/tipos";
import { DatosDeCarga } from "./datos-de-carga";
import { DiaDeRegistros } from "./dia-de-registros";
import { NuevaEntrada } from "./ventana/nueva-entrada";

export const metadata: Metadata = { title: "Registro de tiempo" };

export default async function RegistroPage({
  searchParams,
}: PageProps<"/registro">) {
  // ?semana=2026-10-05 elige la semana; sin el parámetro, la actual.
  const { semana } = await searchParams;
  const lunesActual = lunesDe(hoy());
  const lunes =
    typeof semana === "string" && esFechaValida(semana)
      ? lunesDe(semana)
      : lunesActual;

  // En esta versión cada uno ve sus propias horas, también el ADMIN.
  const empleado = await obtenerEmpleadoActual();
  const filtros = new URLSearchParams({
    desde: comienzoDelDia(lunes),
    hasta: comienzoDelDia(sumarDias(lunes, 7)),
    empleadoId: String(empleado.id),
  });
  // Proyectos no archivados y todas sus tareas, para la ventana de carga.
  const [registros, proyectos, tareas] = await Promise.all([
    pedirAlBackend<Registro[]>(`/registros?${filtros}`),
    pedirAlBackend<Proyecto[]>("/proyectos"),
    pedirAlBackend<Tarea[]>("/tareas"),
  ]);

  // El backend los devuelve del más reciente al más viejo; se agrupan por día.
  const porDia = Map.groupBy(registros, (r) => fechaDe(r.inicio));
  const totalSemana = registros.reduce((t, r) => t + r.duracionSegundos, 0);

  return (
    <DatosDeCarga proyectos={proyectos} tareas={tareas} semanaVisible={lunes}>
      <div className="mx-auto grid max-w-5xl gap-5">
        <h1 className="text-xl font-semibold">Registro de tiempo</h1>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-2" aria-label="Semana">
            <FlechaSemana
              lunes={sumarDias(lunes, -7)}
              etiqueta="Semana anterior"
            >
              ‹
            </FlechaSemana>
            <span className="min-w-40 text-center font-semibold">
              {rangoDeLaSemana(lunes)}
            </span>
            <FlechaSemana
              lunes={sumarDias(lunes, 7)}
              etiqueta="Semana siguiente"
            >
              ›
            </FlechaSemana>
            {lunes !== lunesActual && (
              <Link
                href="/registro"
                className="ml-2 text-sm text-acento hover:underline"
              >
                Esta semana
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-4">
            <p className="text-sm text-tenue">
              Total de la semana{" "}
              <span className="font-mono text-base font-medium text-texto">
                {formatearDuracion(totalSemana)}
              </span>
            </p>
            <NuevaEntrada />
          </div>
        </div>

        {registros.length === 0 ? (
          <p className="rounded-lg border border-dashed border-linea px-4 py-10 text-center text-tenue">
            No hay horas cargadas en esta semana.
          </p>
        ) : (
          [...porDia].map(([fecha, delDia]) => (
            <DiaDeRegistros key={fecha} fecha={fecha} registros={delDia} />
          ))
        )}
      </div>
    </DatosDeCarga>
  );
}

function FlechaSemana({
  lunes,
  etiqueta,
  children,
}: {
  lunes: string;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/registro?semana=${lunes}`}
      aria-label={etiqueta}
      title={etiqueta}
      className="grid size-8 place-items-center rounded-md border border-linea text-lg text-tenue hover:bg-gris hover:text-texto"
    >
      {children}
    </Link>
  );
}
