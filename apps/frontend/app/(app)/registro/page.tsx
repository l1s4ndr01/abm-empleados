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
import type { Empleado, Proyecto, Registro, Tarea } from "@simep/tipos";
import { DatosDeCarga } from "./datos-de-carga";
import { DiaDeRegistros } from "./dia-de-registros";
import { urlRegistro } from "./rutas";
import { SelectorEmpleado } from "./selector-empleado";
import { NuevaEntrada } from "./ventana/nueva-entrada";

export const metadata: Metadata = { title: "Registro de tiempo" };

export default async function RegistroPage({
  searchParams,
}: PageProps<"/registro">) {
  // ?semana=2026-10-05 elige la semana; sin el parámetro, la actual.
  // ?empleado=todos o ?empleado=<id> (solo ADMIN) elige de quién son las horas.
  const { semana, empleado: parametro } = await searchParams;
  const lunesActual = lunesDe(hoy());
  const lunes =
    typeof semana === "string" && esFechaValida(semana)
      ? lunesDe(semana)
      : lunesActual;

  const yo = await obtenerEmpleadoActual();
  const esAdmin = yo.rol === "ADMIN";
  // El ADMIN puede ver a cualquiera, también a los inactivos (su historial).
  const empleados = esAdmin
    ? await pedirAlBackend<Empleado[]>("/empleados?inactivos=true")
    : [];

  // Un EMPLEADO siempre ve sus horas, aunque la dirección diga otra cosa.
  const verTodos = esAdmin && parametro === "todos";
  const otro =
    esAdmin && typeof parametro === "string"
      ? empleados.find((e) => String(e.id) === parametro && e.id !== yo.id)
      : undefined;
  const visto = verTodos ? null : (otro ?? yo);
  const parametroEmpleado = verTodos ? "todos" : otro ? String(otro.id) : undefined;

  const filtros = new URLSearchParams({
    desde: comienzoDelDia(lunes),
    hasta: comienzoDelDia(sumarDias(lunes, 7)),
  });
  if (visto) filtros.set("empleadoId", String(visto.id));
  // Proyectos no archivados y todas sus tareas, para la ventana de carga.
  const [registros, proyectos, tareas] = await Promise.all([
    pedirAlBackend<Registro[]>(`/registros?${filtros}`),
    pedirAlBackend<Proyecto[]>("/proyectos"),
    pedirAlBackend<Tarea[]>("/tareas"),
  ]);

  // El backend los devuelve del más reciente al más viejo; se agrupan por día.
  const porDia = Map.groupBy(registros, (r) => fechaDe(r.inicio));
  const totalSemana = registros.reduce((t, r) => t + r.duracionSegundos, 0);
  const url = (s?: string) =>
    urlRegistro({ semana: s, empleado: parametroEmpleado });

  return (
    <DatosDeCarga
      proyectos={proyectos}
      tareas={tareas}
      semanaVisible={lunes}
      miId={yo.id}
      esAdmin={esAdmin}
      empleados={empleados}
      empleadoVisto={visto?.id ?? null}
      parametroEmpleado={parametroEmpleado}
    >
      <div className="mx-auto grid max-w-5xl gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">
            Registro de tiempo
            {verTodos && <span className="text-tenue"> · Todos los empleados</span>}
            {otro && (
              <span className="text-tenue">
                {" "}
                · {otro.nombre} {otro.apellido}
                {!otro.activo && " (inactivo)"}
              </span>
            )}
          </h1>
          {esAdmin && <SelectorEmpleado />}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-2" aria-label="Semana">
            <FlechaSemana href={url(sumarDias(lunes, -7))} etiqueta="Semana anterior">
              ‹
            </FlechaSemana>
            <span className="min-w-40 text-center font-semibold">
              {rangoDeLaSemana(lunes)}
            </span>
            <FlechaSemana href={url(sumarDias(lunes, 7))} etiqueta="Semana siguiente">
              ›
            </FlechaSemana>
            {lunes !== lunesActual && (
              <Link href={url()} className="ml-2 text-sm text-acento hover:underline">
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
            {/* A un empleado inactivo no se le pueden cargar horas nuevas. */}
            {(!otro || otro.activo) && <NuevaEntrada />}
          </div>
        </div>

        {registros.length === 0 ? (
          <p className="rounded-lg border border-dashed border-linea px-4 py-10 text-center text-tenue">
            {otro
              ? `${otro.nombre} no tiene horas cargadas en esta semana.`
              : "No hay horas cargadas en esta semana."}
          </p>
        ) : (
          [...porDia].map(([fecha, delDia]) => (
            <DiaDeRegistros
              key={fecha}
              fecha={fecha}
              registros={delDia}
              mostrarEmpleado={verTodos}
            />
          ))
        )}
      </div>
    </DatosDeCarga>
  );
}

function FlechaSemana({
  href,
  etiqueta,
  children,
}: {
  href: string;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={etiqueta}
      title={etiqueta}
      className="grid size-8 place-items-center rounded-md border border-linea text-lg text-tenue hover:bg-gris hover:text-texto"
    >
      {children}
    </Link>
  );
}
