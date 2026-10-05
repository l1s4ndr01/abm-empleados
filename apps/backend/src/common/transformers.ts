// Para usar con @Transform de class-transformer en los DTOs.
export const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
