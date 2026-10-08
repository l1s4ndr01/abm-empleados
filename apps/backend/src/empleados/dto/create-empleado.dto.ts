import { Rol } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { normalizarEmail, trim } from '../../common/transformers';
import type { NuevoEmpleado } from '@simep/tipos';

// Alta de un empleado por parte del admin. googleId y fotoUrl no se cargan
// acá: los completa el login con Google la primera vez que el empleado entra.
export class CreateEmpleadoDto implements NuevoEmpleado {
  @Transform(normalizarEmail)
  @IsEmail()
  email: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  // Opcional: si no viene, la base usa EMPLEADO.
  @ValidateIf((o: CreateEmpleadoDto) => o.rol !== undefined)
  @IsEnum(Rol)
  rol?: Rol;
}
