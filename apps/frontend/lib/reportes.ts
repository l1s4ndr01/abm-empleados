// Cuentas de los reportes. Los registros se parten en la medianoche y se
// recortan al período, así los totales cierran aunque un registro cruce
// de un día (o de un período) a otro.
import type { Registro } from "@simep/tipos";
import {
  diasDelRango,
  lunesDe,
  partirEnDias,
  primeroDelMes,
  sumarDias,
  type ParteDelDia,
} from "./fechas";

export interface Pedazo extends ParteDelDia {
  registro: Registro;
  // Para las marcas ⤴ (viene del día anterior) y ⤵ (sigue al día siguiente).
  viene: boolean;
  sigue: boolean;
}

export function pedazosDelPeriodo(
  registros: Registro[],
  periodo: { desde: string; hasta: string },
): Pedazo[] {
  return registros.flatMap((registro) => {
    const inicio = new Date(registro.inicio).getTime();
    const fin = new Date(registro.fin).getTime();
    return partirEnDias(registro.inicio, registro.fin, periodo).map((parte) => ({
      ...parte,
      registro,
      viene: parte.inicio.getTime() > inicio,
      sigue: parte.fin.getTime() < fin,
    }));
  });
}

export function totales(pedazos: Pedazo[]) {
  return {
    segundos: pedazos.reduce((t, p) => t + p.segundos, 0),
    // Empleados distintos con horas en el período.
    personas: new Set(pedazos.map((p) => p.registro.empleadoId)).size,
  };
}

// --- Gráfico: horas por tramo (día, semana o mes), apiladas por proyecto ---

export type Escala = "dia" | "semana" | "mes";

export interface ProyectoDelGrafico {
  id: number;
  nombre: string;
  cliente: string;
  color: string;
  segundos: number;
}

export interface Tramo {
  // Primer día del tramo ("2026-10-05"), recortado al rango.
  fecha: string;
  escala: Escala;
  segundos: number;
  // Segundos de cada proyecto, en el mismo orden que la leyenda.
  porProyecto: { id: number; segundos: number }[];
}

// Una barra por día hasta 31 días, por semana hasta ~6 meses y si no, por mes.
export function escalaDelRango(desde: string, hasta: string): Escala {
  const dias = diasDelRango(desde, hasta);
  if (dias <= 31) return "dia";
  if (dias <= 186) return "semana";
  return "mes";
}

export function horasPorTramo(pedazos: Pedazo[], desde: string, hasta: string) {
  const escala = escalaDelRango(desde, hasta);
  const comienzoDelTramo = (fecha: string) => {
    const comienzo =
      escala === "dia" ? fecha : escala === "semana" ? lunesDe(fecha) : primeroDelMes(fecha);
    // La primera semana o el primer mes pueden empezar antes del rango.
    return comienzo < desde ? desde : comienzo;
  };

  // Todos los tramos del rango, también los que no tienen horas.
  const fechas: string[] = [];
  for (let fecha = desde; fecha <= hasta; fecha = sumarDias(fecha, 1)) {
    const comienzo = comienzoDelTramo(fecha);
    if (fechas.at(-1) !== comienzo) fechas.push(comienzo);
  }

  // La leyenda (y el orden de las pilas) va del proyecto con más horas al de menos.
  const proyectos = [
    ...Map.groupBy(pedazos, (p) => p.registro.proyectoId).values(),
  ]
    .map((delProyecto): ProyectoDelGrafico => {
      const { proyecto } = delProyecto[0].registro;
      return {
        id: proyecto.id,
        nombre: proyecto.nombre,
        cliente: proyecto.cliente.nombre,
        color: proyecto.color,
        segundos: delProyecto.reduce((t, p) => t + p.segundos, 0),
      };
    })
    .sort((a, b) => b.segundos - a.segundos);

  const porTramo = Map.groupBy(pedazos, (p) => comienzoDelTramo(p.fecha));
  const tramos = fechas.map((fecha): Tramo => {
    const delTramo = porTramo.get(fecha) ?? [];
    const porProyecto = proyectos
      .map(({ id }) => ({
        id,
        segundos: delTramo
          .filter((p) => p.registro.proyectoId === id)
          .reduce((t, p) => t + p.segundos, 0),
      }))
      .filter((p) => p.segundos > 0);
    return {
      fecha,
      escala,
      segundos: porProyecto.reduce((t, p) => t + p.segundos, 0),
      porProyecto,
    };
  });

  return { escala, proyectos, tramos };
}

// --- Tabla: totales agrupados, con un segundo nivel desplegable ---

export type Agrupacion = "proyecto" | "cliente" | "empleado";

export interface FilaDeTotales {
  clave: string;
  nombre: string;
  detalle?: string;
  color?: string;
  segundos: number;
  hijos: FilaDeTotales[];
}

interface Nivel {
  clave: (p: Pedazo) => string | number;
  fila: (p: Pedazo) => Omit<FilaDeTotales, "clave" | "segundos" | "hijos">;
}

const NIVEL_PROYECTO: Nivel = {
  clave: (p) => p.registro.proyectoId,
  fila: ({ registro: { proyecto } }) => ({
    nombre: proyecto.nombre,
    detalle: proyecto.cliente.nombre,
    color: proyecto.color,
  }),
};

const NIVELES: Record<Agrupacion, [Nivel, Nivel]> = {
  proyecto: [
    NIVEL_PROYECTO,
    {
      clave: (p) => p.registro.tareaId ?? "sin-tarea",
      fila: (p) => ({ nombre: p.registro.tarea?.nombre ?? "Sin tarea" }),
    },
  ],
  cliente: [
    {
      clave: (p) => p.registro.proyecto.cliente.id,
      fila: (p) => ({ nombre: p.registro.proyecto.cliente.nombre }),
    },
    NIVEL_PROYECTO,
  ],
  empleado: [
    {
      clave: (p) => p.registro.empleadoId,
      fila: ({ registro: { empleado } }) => ({
        nombre: `${empleado.apellido}, ${empleado.nombre}`,
      }),
    },
    NIVEL_PROYECTO,
  ],
};

function agrupar(pedazos: Pedazo[], niveles: Nivel[]): FilaDeTotales[] {
  if (niveles.length === 0) return [];
  const [nivel, ...resto] = niveles;
  return [...Map.groupBy(pedazos, nivel.clave)]
    .map(([clave, delGrupo]) => ({
      clave: String(clave),
      ...nivel.fila(delGrupo[0]),
      segundos: delGrupo.reduce((t, p) => t + p.segundos, 0),
      hijos: agrupar(delGrupo, resto),
    }))
    .sort((a, b) => b.segundos - a.segundos);
}

export function totalesAgrupados(pedazos: Pedazo[]) {
  return {
    proyecto: agrupar(pedazos, NIVELES.proyecto),
    cliente: agrupar(pedazos, NIVELES.cliente),
    empleado: agrupar(pedazos, NIVELES.empleado),
  } satisfies Record<Agrupacion, FilaDeTotales[]>;
}
