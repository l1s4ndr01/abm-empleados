import { applyDecorators } from '@nestjs/common';
import { IsISO8601, Matches } from 'class-validator';

// Fecha y hora en ISO 8601 con zona horaria explícita, como
// "2026-10-07T09:00:00-03:00" o "2026-10-07T12:00:00Z".
// Sin zona, cada servidor la interpretaría con su propia hora local.
export const IsFechaConZona = () =>
  applyDecorators(
    IsISO8601(
      { strict: true },
      { message: '$property debe ser una fecha y hora ISO 8601' },
    ),
    Matches(/T.*(Z|[+-]\d{2}:\d{2})$/, {
      message:
        '$property tiene que incluir la hora y la zona horaria (por ejemplo 2026-10-07T09:00:00-03:00)',
    }),
  );
