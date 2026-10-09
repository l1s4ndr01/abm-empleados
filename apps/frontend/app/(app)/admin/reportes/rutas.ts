export type Vista = "resumen" | "detallado" | "semanal";

export interface FiltrosReporte {
  vista: Vista;
  // Fechas "2026-10-05", las dos inclusive.
  desde: string;
  hasta: string;
  empleado?: number;
  proyecto?: number;
}

// Dirección del reporte: los filtros quedan en ella, así se puede recargar
// o compartir tal cual.
export function urlReporte({ vista, desde, hasta, empleado, proyecto }: FiltrosReporte) {
  const parametros = new URLSearchParams({ desde, hasta });
  if (vista !== "resumen") parametros.set("vista", vista);
  if (empleado) parametros.set("empleado", String(empleado));
  if (proyecto) parametros.set("proyecto", String(proyecto));
  return `/admin/reportes?${parametros}`;
}
