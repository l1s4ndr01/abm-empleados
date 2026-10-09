"use client";

import { useRouter } from "next/navigation";
import { useDatosDeCarga } from "./datos-de-carga";
import { urlRegistro } from "./rutas";

// Solo para el ADMIN: elige de quién son las horas que se ven.
// La elección queda en la dirección y se mantiene al cambiar de semana.
export function SelectorEmpleado() {
  const router = useRouter();
  const { empleados, miId, parametroEmpleado, semanaVisible } =
    useDatosDeCarga();
  const otros = empleados.filter((e) => e.id !== miId);

  return (
    <label className="flex items-center gap-2 text-sm text-tenue">
      Ver horas de
      <select
        value={parametroEmpleado ?? ""}
        onChange={(e) =>
          router.push(
            urlRegistro({
              semana: semanaVisible,
              empleado: e.target.value || undefined,
            }),
          )
        }
        className="rounded-md border border-linea bg-superficie px-2 py-1.5 text-texto"
      >
        <option value="">Mis horas</option>
        <option value="todos">Todos los empleados</option>
        <optgroup label="Empleados">
          {otros.map((e) => (
            <option key={e.id} value={String(e.id)}>
              {e.apellido}, {e.nombre}
              {e.activo ? "" : " (inactivo)"}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
