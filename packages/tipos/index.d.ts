// Tipos de la API de SIMEP, compartidos por el backend y el frontend.
//
// Solo hay declaraciones de tipos (sin código), así que no hace falta
// compilar este paquete. Los controladores del backend declaran que
// devuelven estos tipos: si una respuesta deja de cumplirlos, el backend
// no compila.

export type Rol = "ADMIN" | "EMPLEADO";

export interface Empleado {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  fotoUrl: string | null;
  rol: Rol;
  activo: boolean;
}

export interface Cliente {
  id: number;
  nombre: string;
  email: string | null;
  direccion: string | null;
  nota: string | null;
  archivado: boolean;
}

// POST /clientes. Los textos opcionales se borran mandándolos en null.
export interface NuevoCliente {
  nombre: string;
  email?: string | null;
  direccion?: string | null;
  nota?: string | null;
}

// PATCH /clientes/:id. { archivado: false } lo desarchiva; con
// restaurarProyectos: true vuelven también todos sus proyectos.
export interface CambiosCliente extends Partial<NuevoCliente> {
  archivado?: boolean;
  restaurarProyectos?: boolean;
}

export interface Proyecto {
  id: number;
  nombre: string;
  color: string;
  clienteId: number;
  archivado: boolean;
  cliente: { id: number; nombre: string };
}

// POST /proyectos. Sin color, el backend usa #7986CB.
export interface NuevoProyecto {
  nombre: string;
  clienteId: number;
  color?: string;
}

// PATCH /proyectos/:id. { archivado: false } lo restaura (si su cliente está activo).
export interface CambiosProyecto extends Partial<NuevoProyecto> {
  archivado?: boolean;
}

export interface Tarea {
  id: number;
  nombre: string;
  proyectoId: number;
  completada: boolean;
  proyecto: { id: number; nombre: string };
}

// POST /tareas
export interface NuevaTarea {
  nombre: string;
  proyectoId: number;
}

// PATCH /tareas/:id. Una tarea no se puede pasar a otro proyecto.
export interface CambiosTarea {
  nombre?: string;
  completada?: boolean;
}

// Las fechas son `Date` en el backend y llegan como texto ISO al frontend.
export interface Registro<Fecha = string> {
  id: number;
  empleadoId: number;
  proyectoId: number;
  tareaId: number | null;
  descripcion: string | null;
  inicio: Fecha;
  fin: Fecha;
  duracionSegundos: number;
  empleado: { id: number; nombre: string; apellido: string };
  proyecto: {
    id: number;
    nombre: string;
    color: string;
    cliente: { id: number; nombre: string };
  };
  tarea: { id: number; nombre: string } | null;
}

// POST /registros. Las fechas van en ISO 8601 con zona horaria.
export interface NuevoRegistro {
  proyectoId: number;
  tareaId?: number | null;
  descripcion?: string | null;
  inicio: string;
  fin: string;
  // Solo el ADMIN, para cargar horas a nombre de otro empleado.
  empleadoId?: number;
}

// PATCH /registros/:id. El empleado del registro no se puede cambiar.
export type CambiosRegistro = Partial<Omit<NuevoRegistro, "empleadoId">>;

// POST /auth/google
export interface RespuestaLogin {
  accessToken: string;
  empleado: Empleado;
}
