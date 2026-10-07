import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { trimONull } from '../../common/transformers';
import { IsFechaConZona } from '../../common/validadores';

export class CreateRegistroDto {
  @IsInt()
  @IsPositive()
  proyectoId: number;

  // Opcional. Si viene, tiene que ser una tarea del proyecto.
  @IsOptional()
  @IsInt()
  @IsPositive()
  tareaId?: number | null;

  // "¿En qué has trabajado?"
  @Transform(trimONull)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string | null;

  @IsFechaConZona()
  inicio: string;

  @IsFechaConZona()
  fin: string;

  // Solo el ADMIN puede cargar horas a nombre de otro empleado.
  // Si no viene, el registro es del empleado logueado.
  @IsOptional()
  @IsInt()
  @IsPositive()
  empleadoId?: number;
}
