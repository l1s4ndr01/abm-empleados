import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';
import { textoABooleano } from '../../common/transformers';
import { IsFechaConZona } from '../../common/validadores';

// GET /registros?desde=...&hasta=...&solapados=true&proyectoId=1&empleadoId=2
// (todos opcionales).
export class FiltrosRegistrosDto {
  // Registros que empiezan desde esta fecha (inclusive)...
  @IsOptional()
  @IsFechaConZona()
  desde?: string;

  // ...y antes de esta (exclusive).
  @IsOptional()
  @IsFechaConZona()
  hasta?: string;

  // Con true, desde/hasta traen los registros que tienen alguna parte
  // dentro del período, aunque hayan empezado antes (para los reportes).
  @IsOptional()
  @Transform(textoABooleano)
  @IsBoolean()
  solapados?: boolean;

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
