import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { trimONull } from '../../common/transformers';
import { IsFechaConZona } from '../../common/validadores';

// El empleado del registro no se puede cambiar.
// proyectoId, inicio y fin son opcionales, pero si vienen no pueden ser null.
// tareaId y descripcion sí aceptan null, para quitarlas.
export class UpdateRegistroDto {
  @ValidateIf((o: UpdateRegistroDto) => o.proyectoId !== undefined)
  @IsInt()
  @IsPositive()
  proyectoId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  tareaId?: number | null;

  @Transform(trimONull)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string | null;

  @ValidateIf((o: UpdateRegistroDto) => o.inicio !== undefined)
  @IsFechaConZona()
  inicio?: string;

  @ValidateIf((o: UpdateRegistroDto) => o.fin !== undefined)
  @IsFechaConZona()
  fin?: string;
}
