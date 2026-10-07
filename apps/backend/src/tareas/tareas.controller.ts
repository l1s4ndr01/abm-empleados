import { Rol } from '@prisma/client';
import { Roles } from '../auth/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { TareasService } from './tareas.service';

@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  // GET /tareas?proyectoId=1&completada=false (ambos filtros son opcionales).
  @Get()
  findAll(
    @Query('proyectoId', new ParseIntPipe({ optional: true }))
    proyectoId: number | undefined,
    @Query('completada', new ParseBoolPipe({ optional: true }))
    completada: boolean | undefined,
  ) {
    return this.tareasService.findAll({ proyectoId, completada });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tareasService.findOne(id);
  }

  @Roles(Rol.ADMIN)
  @Post()
  create(@Body() dto: CreateTareaDto) {
    return this.tareasService.create(dto);
  }

  @Roles(Rol.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTareaDto) {
    return this.tareasService.update(id, dto);
  }

  // Borra la tarea de verdad (solo si no tiene horas cargadas).
  @Roles(Rol.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tareasService.remove(id);
  }
}
