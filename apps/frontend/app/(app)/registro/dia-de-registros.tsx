import { formatearDuracion, tituloDelDia } from "@/lib/fechas";
import type { Registro } from "@simep/tipos";
import { FilaDeRegistro } from "./fila-de-registro";

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
