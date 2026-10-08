import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { trim } from '../../common/transformers';
import type { NuevoProyecto } from '@simep/tipos';

export class CreateProyectoDto implements NuevoProyecto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsInt()
  @IsPositive()
  clienteId: number;

  // Opcional: si no viene, la base usa el color por defecto.
  @ValidateIf((o: CreateProyectoDto) => o.color !== undefined)
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color debe ser un hexadecimal como #7986CB',
  })
  color?: string;
}
