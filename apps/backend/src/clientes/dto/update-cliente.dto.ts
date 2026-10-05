import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { trim } from '../../common/transformers';
import { CreateClienteDto } from './create-cliente.dto';

export class UpdateClienteDto extends PartialType(
  OmitType(CreateClienteDto, ['nombre'] as const),
) {
  // Opcional, pero si viene no puede ser null ni vacío (IsOptional dejaría pasar null).
  @Transform(trim)
  @ValidateIf((o: UpdateClienteDto) => o.nombre !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre?: string;

  // Permite desarchivar un cliente con { "archivado": false }.
  @IsOptional()
  @IsBoolean()
  archivado?: boolean;
}
