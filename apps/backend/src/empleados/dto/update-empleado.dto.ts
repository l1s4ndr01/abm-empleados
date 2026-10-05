import { Rol } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { normalizarEmail, trim } from '../../common/transformers';

// Los campos son opcionales, pero si vienen no pueden ser null.
export class UpdateEmpleadoDto {
  // Solo se puede cambiar si el empleado todavía no entró con Google.
  @Transform(normalizarEmail)
  @ValidateIf((o: UpdateEmpleadoDto) => o.email !== undefined)
  @IsEmail()
  email?: string;

  @Transform(trim)
  @ValidateIf((o: UpdateEmpleadoDto) => o.nombre !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre?: string;

  @Transform(trim)
  @ValidateIf((o: UpdateEmpleadoDto) => o.apellido !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido?: string;

  @ValidateIf((o: UpdateEmpleadoDto) => o.rol !== undefined)
  @IsEnum(Rol)
  rol?: Rol;

  // Permite reactivar un empleado con { "activo": true }.
  @ValidateIf((o: UpdateEmpleadoDto) => o.activo !== undefined)
  @IsBoolean()
  activo?: boolean;
}
