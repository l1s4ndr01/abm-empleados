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

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  // GET /clientes?archivados=true incluye también los archivados.
  @Get()
  findAll(
    @Query('archivados', new DefaultValuePipe(false), ParseBoolPipe)
    archivados: boolean,
  ) {
    return this.clientesService.findAll(archivados);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClienteDto) {
    return this.clientesService.update(id, dto);
  }

  // DELETE archiva el cliente (no lo borra de la base).
  @Delete(':id')
  archivar(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.archivar(id);
  }
}
