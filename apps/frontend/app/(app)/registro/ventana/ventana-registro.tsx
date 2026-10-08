"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { crearRegistro } from "@/app/acciones/registros";
import { Dialogo } from "@/componentes/dialogo";
import {
  IconoCalendario,
  IconoCarpeta,
  IconoCerrar,
  IconoCronometro,
  IconoTexto,
} from "@/componentes/iconos";
import {
  ahoraRedondeado,
  conZona,
  duracionLarga,
  fechaCortaLocal,
  fechaLocal,
  horaLocal,
  lunesDe,
  mismoDia,
} from "@/lib/fechas";
import type { Proyecto, Tarea } from "@/lib/tipos";
import { Calendario } from "./calendario";
import { DialogoHoras } from "./dialogo-horas";
import { SelectorProyecto } from "./selector-proyecto";

type Editando = "inicio" | "fin" | "duracion" | "fecha" | null;

const PASOS = [
  { minutos: -60, texto: "−1h" },
  { minutos: -15, texto: "−15min" },
  { minutos: 15, texto: "+15min" },
  { minutos: 60, texto: "+1h" },
];

// Ventana "Nueva entrada de tiempo". El fin no se guarda en el estado:
// se calcula como inicio + duración, así cambiar uno mueve el otro.
export function VentanaRegistro({
  proyectos,
  tareas,
  semanaVisible,
  onCerrar,
}: {
  proyectos: Proyecto[];
  tareas: Tarea[];
  semanaVisible: string;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [descripcion, setDescripcion] = useState("");
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [tareaId, setTareaId] = useState<number | null>(null);
  const [inicio, setInicio] = useState(ahoraRedondeado);
  const [minutos, setMinutos] = useState(0);
  const [editando, setEditando] = useState<Editando>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();

  const fin = new Date(inicio.getTime() + minutos * 60_000);
  const diasDespues = Math.round(
    (Date.parse(fechaLocal(fin)) - Date.parse(fechaLocal(inicio))) / 86_400_000,
  );

  // Cada cambio borra el aviso anterior (por ejemplo, el de superposición).
  function cambiar(accion: () => void) {
    accion();
    setError(null);
    setEditando(null);
  }

  const conHora = (dia: Date, h: number, m: number) =>
    new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), h, m);

  function cambiarFin(h: number, m: number) {
    // Si el fin queda antes del inicio, es del día siguiente.
    const nuevoFin = conHora(inicio, h, m);
    if (nuevoFin < inicio) nuevoFin.setDate(nuevoFin.getDate() + 1);
    setMinutos(Math.round((nuevoFin.getTime() - inicio.getTime()) / 60_000));
  }

  function guardar() {
    if (proyectoId === null) {
      setError("Elegí un proyecto.");
      return;
    }
    startTransition(async () => {
      const resultado = await crearRegistro({
        proyectoId,
        tareaId,
        descripcion: descripcion.trim() || null,
        inicio: conZona(inicio),
        fin: conZona(fin),
      });
      if (resultado.error) {
        setError(resultado.error);
        return;
      }
      onCerrar();
      // Si el registro es de otra semana, se muestra esa semana.
      const semana = lunesDe(fechaLocal(inicio));
      if (semana !== semanaVisible) router.push(`/registro?semana=${semana}`);
    });
  }

  const estiloValor =
    "rounded-md border border-linea px-2 py-0.5 hover:bg-gris";

  return (
    <Dialogo
      etiqueta="Nueva entrada de tiempo"
      onCerrar={onCerrar}
      className="w-[min(28rem,calc(100vw-2rem))]"
    >
      <div className="flex items-center gap-3 border-b border-linea px-5 py-3.5">
        <button type="button" onClick={onCerrar} aria-label="Cerrar" className="text-tenue hover:text-texto">
          <IconoCerrar />
        </button>
        <h2 className="text-lg">Nueva entrada de tiempo</h2>
      </div>

      <div className="grid grid-cols-[1.25rem_1fr] items-start gap-x-3.5 border-b border-linea px-5 py-3.5 text-tenue">
        <IconoTexto />
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={500}
          placeholder="¿En qué trabajaste?"
          aria-label="¿En qué trabajaste?"
          className="border-b border-linea bg-transparent pb-1 text-texto placeholder:text-tenue focus:border-acento focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-[1.25rem_1fr] items-start gap-x-3.5 border-b border-linea px-5 py-3.5 text-tenue">
        <span className="pt-1.5"><IconoCarpeta /></span>
        <div className="text-texto">
          <SelectorProyecto
            proyectos={proyectos}
            tareas={tareas}
            proyectoId={proyectoId}
            tareaId={tareaId}
            onElegir={(pid, tid) =>
              cambiar(() => {
                setProyectoId(pid);
                setTareaId(tid);
              })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-[1.25rem_1fr] items-start gap-x-3.5 border-b border-linea px-5 py-3.5 text-tenue">
        <span className="pt-1"><IconoCalendario /></span>
        <div className="grid gap-1.5 text-sm">
          <div className="grid grid-cols-[4.5rem_auto_1fr] items-center gap-2">
            <span>Inicio</span>
            <button type="button" onClick={() => setEditando("inicio")} className={`${estiloValor} font-mono text-base text-texto`}>
              {horaLocal(inicio)}
            </button>
            <button type="button" onClick={() => setEditando("fecha")} className={`${estiloValor} justify-self-end text-texto`}>
              {fechaCortaLocal(inicio)}
            </button>
          </div>
          <div className="grid grid-cols-[4.5rem_auto_1fr] items-center gap-2">
            <span>Finalizar</span>
            <button type="button" onClick={() => setEditando("fin")} className={`${estiloValor} font-mono text-base text-texto`}>
              {horaLocal(fin)}
            </button>
            {!mismoDia(inicio, fin) && (
              <span className="justify-self-end text-xs">
                {fechaCortaLocal(fin)} (+{diasDespues} {diasDespues === 1 ? "día" : "días"})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-1 border-b border-linea px-5 py-3.5">
        <p className="flex items-center gap-3.5 text-sm text-tenue">
          <IconoCronometro /> Duración
        </p>
        <button
          type="button"
          onClick={() => setEditando("duracion")}
          aria-label={`Duración: ${duracionLarga(minutos)} horas. Tocá para escribirla.`}
          className="justify-self-center rounded-lg px-4 font-mono text-5xl font-light tabular-nums hover:bg-gris"
        >
          {duracionLarga(minutos)}
          <span className="ml-1.5 text-base text-tenue">h</span>
        </button>
        <div className="grid grid-cols-4">
          {PASOS.map((paso) => (
            <button
              key={paso.texto}
              type="button"
              onClick={() => cambiar(() => setMinutos((m) => Math.max(0, m + paso.minutos)))}
              className={`rounded-md py-1.5 text-sm hover:bg-gris ${
                paso.minutos < 0 ? "text-tenue" : "font-semibold text-acento"
              }`}
            >
              {paso.texto}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mx-5 mt-3 rounded-md bg-aviso-suave px-3 py-2 text-sm text-aviso">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 px-5 py-3.5">
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-md border border-linea px-4 py-1.5 text-sm text-tenue hover:bg-gris"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={minutos === 0 || guardando}
          className="rounded-md bg-acento px-4 py-1.5 text-sm font-semibold text-superficie disabled:cursor-not-allowed disabled:opacity-45"
        >
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </div>

      {editando === "inicio" && (
        <DialogoHoras
          titulo="Hora de inicio"
          horas={inicio.getHours()}
          minutos={inicio.getMinutes()}
          maxHoras={23}
          onCancelar={() => setEditando(null)}
          onAceptar={(h, m) => cambiar(() => setInicio(conHora(inicio, h, m)))}
        />
      )}
      {editando === "fin" && (
        <DialogoHoras
          titulo="Hora de fin"
          horas={fin.getHours()}
          minutos={fin.getMinutes()}
          maxHoras={23}
          onCancelar={() => setEditando(null)}
          onAceptar={(h, m) => cambiar(() => cambiarFin(h, m))}
        />
      )}
      {editando === "duracion" && (
        <DialogoHoras
          titulo="Introduce la duración"
          horas={Math.floor(minutos / 60)}
          minutos={minutos % 60}
          maxHoras={99}
          onCancelar={() => setEditando(null)}
          onAceptar={(h, m) => cambiar(() => setMinutos(h * 60 + m))}
        />
      )}
      {editando === "fecha" && (
        <Calendario
          fecha={inicio}
          onCancelar={() => setEditando(null)}
          onElegir={(dia) =>
            cambiar(() => setInicio(conHora(dia, inicio.getHours(), inicio.getMinutes())))
          }
        />
      )}
    </Dialogo>
  );
}
