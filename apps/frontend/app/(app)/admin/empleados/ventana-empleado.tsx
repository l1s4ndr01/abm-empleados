"use client";

import { useState, useTransition } from "react";
import type { Empleado, Rol } from "@simep/tipos";
import { actualizarEmpleado, crearEmpleado } from "@/app/acciones/empleados";
import {
  Campo,
  estiloEntrada,
  VentanaFormulario,
} from "@/componentes/ventana-formulario";

// Ventana para dar de alta un empleado, o editarlo si recibe uno.
export function VentanaEmpleado({
  empleado,
  esYo,
  onCerrar,
}: {
  empleado?: Empleado;
  esYo: boolean;
  onCerrar: () => void;
}) {
  const [nombre, setNombre] = useState(empleado?.nombre ?? "");
  const [apellido, setApellido] = useState(empleado?.apellido ?? "");
  const [email, setEmail] = useState(empleado?.email ?? "");
  const [rol, setRol] = useState<Rol>(empleado?.rol ?? "EMPLEADO");
  const [error, setError] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();
  // Una vez que entró con Google, el login lo identifica por su cuenta de
  // Google y el backend no deja cambiarle el email.
  const yaEntro = Boolean(empleado?.googleId);

  function guardar() {
    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setError("Completá nombre, apellido y email.");
      return;
    }
    const emailNuevo = email.trim().toLowerCase();
    startTransition(async () => {
      const resultado = empleado
        ? await actualizarEmpleado(empleado.id, {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            rol,
            email: emailNuevo !== empleado.email ? emailNuevo : undefined,
          })
        : await crearEmpleado({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: emailNuevo,
            rol,
          });
      if (resultado.error) setError(resultado.error);
      else onCerrar();
    });
  }

  return (
    <VentanaFormulario
      titulo={empleado ? "Editar empleado" : "Nuevo empleado"}
      error={error}
      guardando={guardando}
      onGuardar={guardar}
      onCerrar={onCerrar}
    >
      <div className="grid gap-4 sm:grid-cols-2">
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
        <Campo etiqueta="Apellido">
          <input
            required
            maxLength={100}
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className={estiloEntrada}
          />
        </Campo>
      </div>
      <Campo
        etiqueta="Email"
        ayuda={
          yaEntro
            ? "No se puede cambiar: ya entró con su cuenta de Google."
            : "Con este email de Google va a entrar a SIMEP."
        }
      >
        <input
          type="email"
          required
          disabled={yaEntro}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={estiloEntrada}
        />
      </Campo>
      <Campo
        etiqueta="Rol"
        ayuda={
          esYo
            ? "No podés cambiar tu propio rol: perderías el acceso a Administración."
            : "El administrador gestiona clientes, proyectos y empleados, y ve las horas de todos."
        }
      >
        <select
          value={rol}
          disabled={esYo}
          onChange={(e) => setRol(e.target.value as Rol)}
          className={estiloEntrada}
        >
          <option value="EMPLEADO">Empleado</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </Campo>
    </VentanaFormulario>
  );
}
