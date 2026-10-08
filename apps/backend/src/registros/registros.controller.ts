import { Empleado } from '@prisma/client';
import { EmpleadoActual } from '../auth/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateRegistroDto } from './dto/create-registro.dto';
import { FiltrosRegistrosDto } from './dto/filtros-registros.dto';
import { UpdateRegistroDto } from './dto/update-registro.dto';
import { RegistrosService } from './registros.service';
import type { Registro } from '@simep/tipos';

// Todos los roles usan estas rutas: el servicio limita a un EMPLEADO
// a sus propios registros.
@Controller('registros')
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Get()
  findAll(
    @EmpleadoActual() actual: Empleado,
    @Query() filtros: FiltrosRegistrosDto,
  ): Promise<Registro<Date>[]> {
    return this.registrosService.findAll(actual, filtros);
  }

  @Get(':id')
  findOne(
    @EmpleadoActual() actual: Empleado,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Registro<Date>> {
    return this.registrosService.findOne(actual, id);
  }

  @Post()
  create(
    @EmpleadoActual() actual: Empleado,
    @Body() dto: CreateRegistroDto,
  ): Promise<Registro<Date>> {
    return this.registrosService.create(actual, dto);
  }

  @Patch(':id')
  update(
    @EmpleadoActual() actual: Empleado,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegistroDto,
  ): Promise<Registro<Date>> {
    return this.registrosService.update(actual, id, dto);
  }

  // Los registros sí se borran de verdad: nada depende de ellos.
  @Delete(':id')
  remove(
    @EmpleadoActual() actual: Empleado,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Registro<Date>> {
    return this.registrosService.remove(actual, id);
  }
}
