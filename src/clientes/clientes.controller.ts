import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ROLE } from 'src/users/enums/ROLE.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@Roles(ROLE.admin, ROLE.gerente, ROLE.mantenimiento)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.clientesService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, dto);
  }

  // Solo admin elimina. Gerente/mantenimiento: ver + crear + editar.
  @Roles(ROLE.admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.remove(id);
  }
}
