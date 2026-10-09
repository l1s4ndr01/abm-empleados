// Dirección de la pantalla de registro. Sin parámetros: la semana actual y
// las horas propias. `empleado` (solo ADMIN) es "todos" o el id de otro empleado.
export function urlRegistro({
  semana,
  empleado,
}: {
  semana?: string;
  empleado?: string;
}) {
  const parametros = new URLSearchParams();
  if (semana) parametros.set("semana", semana);
  if (empleado) parametros.set("empleado", empleado);
  const consulta = parametros.toString();
  return consulta ? `/registro?${consulta}` : "/registro";
}
