"use client";

import Script from "next/script";
import { useRef, useState, useTransition } from "react";
import { iniciarSesion } from "@/app/acciones/sesion";

// Lo mínimo que usamos de Google Identity Services (accounts.google.com/gsi/client).
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(opciones: {
            client_id: string;
            callback: (respuesta: { credential: string }) => void;
          }): void;
          renderButton(
            elemento: HTMLElement,
            opciones: Record<string, string | number>,
          ): void;
        };
      };
    };
  }
}

export function BotonGoogle({ clientId }: { clientId: string }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ingresando, startTransition] = useTransition();

  // onReady corre cuando el script termina de cargar y cada vez que el
  // componente se vuelve a montar con el script ya cargado.
  function mostrarBoton() {
    const google = window.google;
    if (!google || !contenedor.current) return;
    google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => {
        setError(null);
        startTransition(async () => {
          const resultado = await iniciarSesion(credential);
          if (resultado?.error) setError(resultado.error);
        });
      },
    });
    google.accounts.id.renderButton(contenedor.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      locale: "es",
      width: 280,
    });
  }

  return (
    <div className="grid justify-items-center gap-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        onReady={mostrarBoton}
      />
      <div ref={contenedor} className="h-11" aria-busy={ingresando} />
      {ingresando && <p className="text-sm text-tenue">Ingresando…</p>}
      {error && (
        <p
          role="alert"
          className="w-full rounded-md bg-peligro-suave px-3 py-2 text-left text-sm text-peligro"
        >
          {error}
        </p>
      )}
    </div>
  );
}
