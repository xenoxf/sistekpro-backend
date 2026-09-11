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
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { FindEmpleadosDto } from './dto/find-empleados.dto';
import { ROLE } from 'src/users/enums/ROLE.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@Roles(ROLE.admin, ROLE.gerente)
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  create(@Body() dto: CreateEmpleadoDto) {
    return this.empleadosService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindEmpleadosDto) {
    return this.empleadosService.findAll(query, query.departamentoId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.empleadosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmpleadoDto,
  ) {
    return this.empleadosService.update(id, dto);
  }

  // Solo admin elimina. Gerente: ver + crear + editar.
  @Roles(ROLE.admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.empleadosService.remove(id);
  }
}
