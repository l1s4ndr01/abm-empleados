import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { trim } from '../../common/transformers';

// El proyecto no se puede cambiar: las horas cargadas en la tarea
// quedarían apuntando a un proyecto distinto del de la tarea.
// Los campos son opcionales, pero si vienen no pueden ser null.
export class UpdateTareaDto {
  @Transform(trim)
  @ValidateIf((o: UpdateTareaDto) => o.nombre !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre?: string;

  @ValidateIf((o: UpdateTareaDto) => o.completada !== undefined)
  @IsBoolean()
  completada?: boolean;
}
