import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EmpleadosService } from './empleados.service';

@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  // GET /empleados?inactivos=true incluye también los inactivos.
  @Get()
  findAll(
    @Query('inactivos', new DefaultValuePipe(false), ParseBoolPipe)
    inactivos: boolean,
  ) {
    return this.empleadosService.findAll(inactivos);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEmpleadoDto) {
    return this.empleadosService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpleadoDto,
  ) {
    return this.empleadosService.update(id, dto);
  }

  // DELETE desactiva el empleado (no lo borra de la base).
  @Delete(':id')
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.desactivar(id);
  }
}
