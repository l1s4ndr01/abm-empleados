import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { IsFechaConZona } from '../../common/validadores';

// GET /registros?desde=...&hasta=...&proyectoId=1&empleadoId=2 (todos opcionales).
export class FiltrosRegistrosDto {
  // Registros que empiezan desde esta fecha (inclusive)...
  @IsOptional()
  @IsFechaConZona()
  desde?: string;

  // ...y antes de esta (exclusive).
  @IsOptional()
  @IsFechaConZona()
  hasta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  proyectoId?: number;

  // Solo para el ADMIN. Un EMPLEADO siempre ve únicamente los suyos.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  empleadoId?: number;
}
