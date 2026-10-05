// Para usar con @Transform de class-transformer en los DTOs.
export const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Los emails se guardan en minúsculas para que coincidan con el de Google al loguearse.
export const normalizarEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;
