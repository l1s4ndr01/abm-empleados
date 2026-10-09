// Para usar con @Transform de class-transformer en los DTOs.
export const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Los emails se guardan en minúsculas para que coincidan con el de Google al loguearse.
export const normalizarEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

// Textos opcionales: se recortan, y si quedan vacíos se guardan como null.
export const trimONull = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;

// Los parámetros de la URL llegan como texto: "true"/"false" pasan a booleano.
export const textoABooleano = ({ value }: { value: unknown }) =>
  value === 'true' ? true : value === 'false' ? false : value;
