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
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { ProyectosService } from './proyectos.service';

@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  // GET /proyectos?clienteId=1&archivados=true (ambos filtros son opcionales).
  @Get()
  findAll(
    @Query('clienteId', new ParseIntPipe({ optional: true }))
    clienteId: number | undefined,
    @Query('archivados', new DefaultValuePipe(false), ParseBoolPipe)
    archivados: boolean,
  ) {
    return this.proyectosService.findAll({
      clienteId,
      incluirArchivados: archivados,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proyectosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProyectoDto) {
    return this.proyectosService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProyectoDto,
  ) {
    return this.proyectosService.update(id, dto);
  }

  // DELETE archiva el proyecto (no lo borra de la base).
  @Delete(':id')
  archivar(@Param('id', ParseIntPipe) id: number) {
    return this.proyectosService.archivar(id);
  }
}
