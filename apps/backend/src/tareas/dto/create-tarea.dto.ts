import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { trim } from '../../common/transformers';
import type { NuevaTarea } from '@simep/tipos';

export class CreateTareaDto implements NuevaTarea {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsInt()
  @IsPositive()
  proyectoId: number;
}
