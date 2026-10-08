import {
  fechaDe,
  formatearDuracion,
  formatearHora,
  tituloDelDia,
} from "@/lib/fechas";
import type { Registro } from "@/lib/tipos";

// Un día de la lista: encabezado con el total y una fila por registro.
export function DiaDeRegistros({
  fecha,
  registros,
}: {
  fecha: string;
  registros: Registro[];
}) {
  const total = registros.reduce((t, r) => t + r.duracionSegundos, 0);

  return (
    <section className="overflow-hidden rounded-lg border border-linea bg-superficie">
      <header className="flex justify-between bg-gris px-4 py-2 text-sm text-tenue">
        <h2>{tituloDelDia(fecha)}</h2>
        <span>
          Total{" "}
          <span className="font-mono font-medium text-texto">
            {formatearDuracion(total)}
          </span>
        </span>
      </header>
      <ul className="divide-y divide-linea">
        {registros.map((registro) => (
          <FilaDeRegistro key={registro.id} registro={registro} />
        ))}
      </ul>
    </section>
  );
}

function FilaDeRegistro({ registro }: { registro: Registro }) {
  const { proyecto, tarea } = registro;
  // Si termina otro día (pasó la medianoche), se avisa junto a la hora.
  const diasDespues = Math.round(
    (Date.parse(fechaDe(registro.fin)) - Date.parse(fechaDe(registro.inicio))) /
      86_400_000,
  );

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_minmax(0,16rem)_8rem_3.5rem] items-center gap-4 px-4 py-2.5 text-sm">
      <p
        className={`truncate ${registro.descripcion ? "" : "text-tenue italic"}`}
        title={registro.descripcion ?? undefined}
      >
        {registro.descripcion ?? "Sin descripción"}
      </p>
      <div className="min-w-0">
        <p className="flex items-center gap-2 truncate">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: proyecto.color }}
          />
          <span className="truncate">
            {proyecto.nombre}
            {tarea && <span className="text-tenue"> · {tarea.nombre}</span>}
          </span>
        </p>
        <p className="truncate pl-4.5 text-xs text-tenue">
          {proyecto.cliente.nombre}
        </p>
      </div>
      <p className="font-mono text-tenue">
        {formatearHora(registro.inicio)} – {formatearHora(registro.fin)}
        {diasDespues > 0 && (
          <sup className="ml-0.5 text-[10px]" title="Termina otro día">
            +{diasDespues}
          </sup>
        )}
      </p>
      <p className="text-right font-mono font-medium">
        {formatearDuracion(registro.duracionSegundos)}
      </p>
    </li>
  );
}
