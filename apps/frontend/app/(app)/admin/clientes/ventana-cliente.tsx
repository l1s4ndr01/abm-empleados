"use client";

import { useState, useTransition } from "react";
import type { Cliente } from "@simep/tipos";
import { actualizarCliente, crearCliente } from "@/app/acciones/clientes";
import {
  Campo,
  estiloEntrada,
  VentanaFormulario,
} from "@/componentes/ventana-formulario";

// Ventana para crear un cliente, o editarlo si recibe uno.
export function VentanaCliente({
  cliente,
  onCerrar,
}: {
  cliente?: Cliente;
  onCerrar: () => void;
}) {
  const [nombre, setNombre] = useState(cliente?.nombre ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [direccion, setDireccion] = useState(cliente?.direccion ?? "");
  const [nota, setNota] = useState(cliente?.nota ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();

  function guardar() {
    if (nombre.trim() === "") {
      setError("Escribí el nombre del cliente.");
      return;
    }
    const datos = {
      nombre: nombre.trim(),
      email: email.trim(),
      direccion: direccion.trim(),
      nota: nota.trim(),
    };
    startTransition(async () => {
      const resultado = cliente
        ? await actualizarCliente(cliente.id, datos)
        : await crearCliente(datos);
      if (resultado.error) setError(resultado.error);
      else onCerrar();
    });
  }

  return (
    <VentanaFormulario
      titulo={cliente ? "Editar cliente" : "Nuevo cliente"}
      error={error}
      guardando={guardando}
      onGuardar={guardar}
      onCerrar={onCerrar}
    >
      <Campo etiqueta="Nombre">
        <input
          autoFocus
          required
          maxLength={100}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={estiloEntrada}
        />
      </Campo>
      <Campo etiqueta="Email" ayuda="Opcional.">
        <input
          type="email"
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={estiloEntrada}
        />
      </Campo>
      <Campo etiqueta="Dirección" ayuda="Opcional.">
        <input
          maxLength={200}
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          className={estiloEntrada}
        />
      </Campo>
      <Campo etiqueta="Nota" ayuda="Opcional. Hasta 1000 caracteres.">
        <textarea
          maxLength={1000}
          rows={3}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          className={estiloEntrada}
        />
      </Campo>
    </VentanaFormulario>
  );
}
