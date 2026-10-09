// Fechas y horas de SIMEP. Todo se muestra en hora argentina.
// Las fechas sin hora se manejan como texto "2026-10-06".

export const ZONA = "America/Argentina/Buenos_Aires";
// Argentina no tiene horario de verano: el offset es siempre -03:00.
const OFFSET = "-03:00";

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

// Para hacer cuentas con días se usa la medianoche UTC, que no tiene saltos.
const comoDia = (fecha: string) => new Date(`${fecha}T00:00:00Z`);
const comoTexto = (dia: Date) => dia.toISOString().slice(0, 10);

export function esFechaValida(texto: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(texto) && comoTexto(comoDia(texto)) === texto;
}

// Día (en hora argentina) de un momento dado.
export function fechaDe(momento: Date | string) {
  return new Date(momento).toLocaleDateString("en-CA", { timeZone: ZONA });
}

export function hoy() {
  return fechaDe(new Date());
}

export function sumarDias(fecha: string, dias: number) {
  const dia = comoDia(fecha);
  dia.setUTCDate(dia.getUTCDate() + dias);
  return comoTexto(dia);
}

// Las semanas empiezan el lunes.
export function lunesDe(fecha: string) {
  const diaDeLaSemana = (comoDia(fecha).getUTCDay() + 6) % 7;
  return sumarDias(fecha, -diaDeLaSemana);
}

// Comienzo del día en formato ISO con zona, como lo pide el backend.
export function comienzoDelDia(fecha: string) {
  return `${fecha}T00:00:00${OFFSET}`;
}

export interface ParteDelDia {
  fecha: string;
  inicio: Date;
  fin: Date;
  segundos: number;
}

// Parte un registro en la medianoche (hora argentina): un pedazo por día.
// Si se pasa un período, solo devuelve lo que cae dentro de él.
// Lo usan los reportes y el aviso de la ventana de carga.
export function partirEnDias(
  inicio: Date | string,
  fin: Date | string,
  periodo?: { desde: Date | string; hasta: Date | string },
): ParteDelDia[] {
  let desde = new Date(inicio).getTime();
  let hasta = new Date(fin).getTime();
  if (periodo) {
    desde = Math.max(desde, new Date(periodo.desde).getTime());
    hasta = Math.min(hasta, new Date(periodo.hasta).getTime());
  }
  const partes: ParteDelDia[] = [];
  while (desde < hasta) {
    const fecha = fechaDe(new Date(desde));
    const medianoche = Date.parse(comienzoDelDia(sumarDias(fecha, 1)));
    const corte = Math.min(medianoche, hasta);
    partes.push({
      fecha,
      inicio: new Date(desde),
      fin: new Date(corte),
      segundos: Math.round((corte - desde) / 1000),
    });
    desde = corte;
  }
  return partes;
}

// "14:05"
export function formatearHora(momento: string) {
  return new Date(momento).toLocaleTimeString("es-AR", {
    timeZone: ZONA,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

// "3:30" (horas y minutos; las horas se cargan a mano, sin segundos)
export function formatearDuracion(segundos: number) {
  const minutos = Math.round(segundos / 60);
  return `${Math.floor(minutos / 60)}:${String(minutos % 60).padStart(2, "0")}`;
}

// "Martes 6 de octubre"
export function tituloDelDia(fecha: string) {
  const dia = comoDia(fecha);
  const texto = `${DIAS[dia.getUTCDay()]} ${dia.getUTCDate()} de ${MESES[dia.getUTCMonth()]}`;
  return texto[0].toUpperCase() + texto.slice(1);
}

// "5 – 11 oct 2026", "28 sept – 4 oct 2026" o "29 dic 2025 – 4 ene 2026"
export function rangoDeLaSemana(lunes: string) {
  const desde = comoDia(lunes);
  const hasta = comoDia(sumarDias(lunes, 6));
  const fin = `${hasta.getUTCDate()} ${MESES_CORTOS[hasta.getUTCMonth()]} ${hasta.getUTCFullYear()}`;
  if (desde.getUTCFullYear() !== hasta.getUTCFullYear()) {
    return `${desde.getUTCDate()} ${MESES_CORTOS[desde.getUTCMonth()]} ${desde.getUTCFullYear()} – ${fin}`;
  }
  if (desde.getUTCMonth() !== hasta.getUTCMonth()) {
    return `${desde.getUTCDate()} ${MESES_CORTOS[desde.getUTCMonth()]} – ${fin}`;
  }
  return `${desde.getUTCDate()} – ${fin}`;
}

// --- Hora local del navegador (ventana de carga) ---
// Para los usuarios de SIMEP coincide con la hora argentina.

export const DIAS_CORTOS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
export { DIAS, MESES, MESES_CORTOS };

const dosCifras = (n: number) => String(n).padStart(2, "0");

// "15:15"
export function horaLocal(momento: Date) {
  return `${dosCifras(momento.getHours())}:${dosCifras(momento.getMinutes())}`;
}

// "jue, 8 oct"
export function fechaCortaLocal(momento: Date) {
  return `${DIAS_CORTOS[momento.getDay()]}, ${momento.getDate()} ${MESES_CORTOS[momento.getMonth()]}`;
}

// "2026-10-08"
export function fechaLocal(momento: Date) {
  return `${momento.getFullYear()}-${dosCifras(momento.getMonth() + 1)}-${dosCifras(momento.getDate())}`;
}

export function mismoDia(a: Date, b: Date) {
  return fechaLocal(a) === fechaLocal(b);
}

// "2026-10-08T15:15:00-03:00": ISO con la zona del navegador, como lo pide el backend.
export function conZona(momento: Date) {
  const offset = -momento.getTimezoneOffset();
  const signo = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  return `${fechaLocal(momento)}T${horaLocal(momento)}:00${signo}${dosCifras(Math.floor(abs / 60))}:${dosCifras(abs % 60)}`;
}

// La hora actual redondeada a 15 minutos, para que +15min dé horas redondas.
export function ahoraRedondeado() {
  const cuarto = 15 * 60 * 1000;
  return new Date(Math.round(Date.now() / cuarto) * cuarto);
}

// "01:30" (duración de la ventana de carga, en minutos)
export function duracionLarga(minutos: number) {
  return `${dosCifras(Math.floor(minutos / 60))}:${dosCifras(minutos % 60)}`;
}
