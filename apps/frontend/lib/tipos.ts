// Tipos de los datos que devuelve la API del backend.
// Si cambia una respuesta del backend, hay que actualizarlos acá.

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

// GET /registros. Las fechas llegan como texto ISO (UTC).
export interface Registro {
  id: number;
  empleadoId: number;
  proyectoId: number;
  tareaId: number | null;
  descripcion: string | null;
  inicio: string;
  fin: string;
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

// GET /proyectos (por defecto, solo los no archivados).
export interface Proyecto {
  id: number;
  nombre: string;
  color: string;
  clienteId: number;
  archivado: boolean;
  cliente: { id: number; nombre: string };
}

// GET /tareas
export interface Tarea {
  id: number;
  nombre: string;
  proyectoId: number;
  completada: boolean;
}
