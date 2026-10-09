import { formatearDuracion, formatearHora, tituloDelDia, fechaDe } from "@/lib/fechas";
import type { Pedazo } from "@/lib/reportes";

// Reporte detallado: los registros del rango por día, del más reciente al
// más viejo, como en Registro de tiempo. Es solo para mirar.
// Un registro que pasa la medianoche aparece partido: una fila en cada día.
export function Detallado({ pedazos }: { pedazos: Pedazo[] }) {
  const ordenados = pedazos.toSorted((a, b) => b.inicio.getTime() - a.inicio.getTime());
  const porDia = Map.groupBy(ordenados, (p) => p.fecha);

  return (
    <div className="grid gap-4">
      {[...porDia].map(([fecha, delDia]) => (
        <section key={fecha} className="overflow-hidden rounded-lg border border-linea bg-superficie">
          <header className="flex justify-between bg-gris px-4 py-2 text-sm text-tenue">
            <h2>{tituloDelDia(fecha)}</h2>
            <span>
              Total{" "}
              <span className="font-mono font-medium text-texto">
                {formatearDuracion(delDia.reduce((t, p) => t + p.segundos, 0))}
              </span>
            </span>
          </header>
          <ul className="divide-y divide-linea">
            {delDia.map((pedazo) => (
              <Fila key={`${pedazo.registro.id}-${pedazo.fecha}`} pedazo={pedazo} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Fila({ pedazo }: { pedazo: Pedazo }) {
  const { registro, viene, sigue } = pedazo;
  const { proyecto, tarea, empleado } = registro;
  const partido = viene || sigue;
  // En las filas partidas, el registro tal como se cargó.
  const completo = partido
    ? `Registro completo: ${tituloDelDia(fechaDe(registro.inicio))} ${formatearHora(registro.inicio)} → ` +
      `${tituloDelDia(fechaDe(registro.fin))} ${formatearHora(registro.fin)} ` +
      `(${formatearDuracion(registro.duracionSegundos)} h)`
    : undefined;

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_minmax(0,16rem)_10.5rem_3.5rem] items-center gap-4 px-4 py-1.5 text-sm max-md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <p
          className={`truncate ${registro.descripcion ? "" : "text-tenue italic"}`}
          title={registro.descripcion ?? undefined}
        >
          {registro.descripcion ?? "Sin descripción"}
        </p>
        <p className="truncate text-xs text-tenue">
          {empleado.nombre} {empleado.apellido}
        </p>
      </div>
      <div className="min-w-0 max-md:hidden">
        <p className="flex items-center gap-2 truncate">
          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: proyecto.color }} />
          <span className="truncate">
            {proyecto.nombre}
            {tarea && <span className="text-tenue"> · {tarea.nombre}</span>}
          </span>
        </p>
        <p className="truncate pl-4.5 text-xs text-tenue">{proyecto.cliente.nombre}</p>
      </div>
      <p className="flex items-center font-mono text-tenue max-md:hidden" title={completo}>
        {/* Las flechas tienen siempre su lugar, así los horarios quedan alineados. */}
        <Flecha visible={viene} texto="Viene del día anterior">⤴</Flecha>
        {formatearHora(pedazo.inicio.toISOString())} – {formatearHora(pedazo.fin.toISOString())}
        <Flecha visible={sigue} texto="Sigue al día siguiente">⤵</Flecha>
      </p>
      <p className="text-right font-mono font-medium" title={completo}>
        {formatearDuracion(pedazo.segundos)}
      </p>
    </li>
  );
}

function Flecha({
  visible,
  texto,
  children,
}: {
  visible: boolean;
  texto: string;
  children: string;
}) {
  return (
    <span
      aria-label={visible ? texto : undefined}
      aria-hidden={!visible}
      className="w-5 text-center font-sans text-base leading-none font-semibold text-acento"
    >
      {visible ? children : ""}
    </span>
  );
}
