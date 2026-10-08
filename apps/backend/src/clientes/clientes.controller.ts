import { Rol } from '@prisma/client';
import { Roles } from '../auth/decorators';
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
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import type { Cliente } from '@simep/tipos';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  // GET /clientes?archivados=true incluye también los archivados.
  @Get()
  findAll(
    @Query('archivados', new DefaultValuePipe(false), ParseBoolPipe)
    archivados: boolean,
  ): Promise<Cliente[]> {
    return this.clientesService.findAll(archivados);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Cliente> {
    return this.clientesService.findOne(id);
  }

  @Roles(Rol.ADMIN)
  @Post()
  create(@Body() dto: CreateClienteDto): Promise<Cliente> {
    return this.clientesService.create(dto);
  }

  @Roles(Rol.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClienteDto,
  ): Promise<Cliente> {
    return this.clientesService.update(id, dto);
  }

  // DELETE archiva el cliente (no lo borra de la base).
  @Roles(Rol.ADMIN)
  @Delete(':id')
  archivar(@Param('id', ParseIntPipe) id: number): Promise<Cliente> {
    return this.clientesService.archivar(id);
  }
}
