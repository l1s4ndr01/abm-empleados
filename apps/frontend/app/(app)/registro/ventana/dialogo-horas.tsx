"use client";

import { useRef, useState } from "react";
import { Dialogo } from "@/componentes/dialogo";

// Ventanita "Horas : Minutos" para la hora de inicio, la de fin o la duración.
export function DialogoHoras({
  titulo,
  horas,
  minutos,
  maxHoras,
  onAceptar,
  onCancelar,
}: {
  titulo: string;
  horas: number;
  minutos: number;
  maxHoras: number;
  onAceptar: (horas: number, minutos: number) => void;
  onCancelar: () => void;
}) {
  const [textoHoras, setTextoHoras] = useState(dosCifras(horas));
  const [textoMinutos, setTextoMinutos] = useState(dosCifras(minutos));
  const [error, setError] = useState<string | null>(null);
  const campoMinutos = useRef<HTMLInputElement>(null);

  function aceptar() {
    const h = Number(textoHoras);
    const m = Number(textoMinutos || "0");
    if (textoHoras === "" || h > maxHoras || m > 59) {
      setError(`Escribí las horas (0 a ${maxHoras}) y los minutos (0 a 59).`);
      return;
    }
    onAceptar(h, m);
  }

  const estiloCampo =
    "w-full rounded-lg border border-linea bg-gris px-1 py-2.5 text-center font-mono text-3xl focus:border-acento focus:outline focus:outline-acento";

  return (
    <Dialogo etiqueta={titulo} onCerrar={onCancelar} className="w-72 p-5">
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          aceptar();
        }}
      >
        <h3 className="text-sm font-semibold">{titulo}</h3>
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2.5">
          <label className="grid gap-1 text-xs text-tenue">
            <input
              autoFocus
              inputMode="numeric"
              maxLength={2}
              value={textoHoras}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const valor = soloNumeros(e.target.value);
                setTextoHoras(valor);
                setError(null);
                if (valor.length === 2) campoMinutos.current?.focus();
              }}
              className={`${estiloCampo} text-texto`}
            />
            Horas
          </label>
          <span className="pt-2.5 text-3xl font-semibold">:</span>
          <label className="grid gap-1 text-xs text-tenue">
            <input
              ref={campoMinutos}
              inputMode="numeric"
              maxLength={2}
              value={textoMinutos}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                setTextoMinutos(soloNumeros(e.target.value));
                setError(null);
              }}
              className={`${estiloCampo} text-texto`}
            />
            Minutos
          </label>
        </div>
        {error && <p className="text-xs text-peligro">{error}</p>}
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-acento hover:bg-gris"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-acento hover:bg-gris"
          >
            OK
          </button>
        </div>
      </form>
    </Dialogo>
  );
}

const dosCifras = (n: number) => String(n).padStart(2, "0");
const soloNumeros = (texto: string) => texto.replace(/\D/g, "");
