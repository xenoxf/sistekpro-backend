import {
  BadRequestException,
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
import { ROLE } from 'src/users/enums/ROLE.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { AgregarFichasDto } from './dto/agregar-fichas.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { ORDEN_ESTADO } from './enums/ORDEN_ESTADO.enum';

@Roles(ROLE.admin, ROLE.mantenimiento)
@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post()
  create(@Body() createOrdenDto: CreateOrdenDto) {
    return this.ordenesService.create(createOrdenDto);
  }

  @Get()
  findAll(@Query('estado') estado?: ORDEN_ESTADO) {
    if (estado && !Object.values(ORDEN_ESTADO).includes(estado)) {
      throw new BadRequestException(
        `estado inválido. Valores permitidos: ${Object.values(ORDEN_ESTADO).join(', ')}`,
      );
    }

    return this.ordenesService.findAll(estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrdenDto: UpdateOrdenDto,
  ) {
    return this.ordenesService.update(id, updateOrdenDto);
  }

  @Patch(':id/fichas')
  agregarFichas(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() agregarFichasDto: AgregarFichasDto,
  ) {
    return this.ordenesService.agregarFichas(id, agregarFichasDto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambiarEstadoDto: CambiarEstadoDto,
  ) {
    return this.ordenesService.cambiarEstado(id, cambiarEstadoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenesService.remove(id);
  }
}
