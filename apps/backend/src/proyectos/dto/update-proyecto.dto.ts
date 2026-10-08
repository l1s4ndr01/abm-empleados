import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { trim } from '../../common/transformers';
import type { CambiosProyecto } from '@simep/tipos';

// Todos los campos son opcionales, pero si vienen no pueden ser null:
// en la base son obligatorios (IsOptional dejaría pasar null).
export class UpdateProyectoDto implements CambiosProyecto {
  @Transform(trim)
  @ValidateIf((o: UpdateProyectoDto) => o.nombre !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre?: string;

  @ValidateIf((o: UpdateProyectoDto) => o.clienteId !== undefined)
  @IsInt()
  @IsPositive()
  clienteId?: number;

  @ValidateIf((o: UpdateProyectoDto) => o.color !== undefined)
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color debe ser un hexadecimal como #7986CB',
  })
  color?: string;

  // Permite desarchivar un proyecto con { "archivado": false }.
  @ValidateIf((o: UpdateProyectoDto) => o.archivado !== undefined)
  @IsBoolean()
  archivado?: boolean;
}
