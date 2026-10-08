// Para buscar sin importar mayúsculas ni acentos ("Ríos" coincide con "rios").
export const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export const coincide = (texto: string | null | undefined, busqueda: string) =>
  normalizar(texto ?? "").includes(normalizar(busqueda));
