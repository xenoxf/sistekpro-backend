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
import { FichaTecnicaService } from './ficha_tecnica.service';
import { CreateFichaTecnicaDto } from './dto/create-ficha_tecnica.dto';
import { UpdateFichaTecnicaDto } from './dto/update-ficha_tecnica.dto';
import { TIPO_EQUIPO } from './enums/TIPO_EQUIPO.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ROLE } from 'src/users/enums/ROLE.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@Roles(ROLE.admin, ROLE.gerente, ROLE.mantenimiento)
@Controller('ficha-tecnica')
export class FichaTecnicaController {
  constructor(private readonly fichaTecnicaService: FichaTecnicaService) {}

  @Roles(ROLE.admin, ROLE.gerente, ROLE.mantenimiento)
  @Post()
  create(@Body() createFichaTecnicaDto: CreateFichaTecnicaDto) {
    return this.fichaTecnicaService.create(createFichaTecnicaDto);
  }

  @Roles(ROLE.admin, ROLE.gerente, ROLE.mantenimiento)
  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('serial') serial?: string,
    @Query('tipoEquipo') tipoEquipo?: TIPO_EQUIPO,
  ) {
    if (tipoEquipo && !Object.values(TIPO_EQUIPO).includes(tipoEquipo)) {
      throw new BadRequestException(
        `tipoEquipo inválido. Valores permitidos: ${Object.values(TIPO_EQUIPO).join(', ')}`,
      );
    }

    return this.fichaTecnicaService.findAll(
      pagination,
      serial?.trim() || undefined,
      tipoEquipo,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fichaTecnicaService.findOne(id);
  }

  @Get(':id/garantia')
  getEstadoGarantia(@Param('id', ParseUUIDPipe) id: string) {
    return this.fichaTecnicaService.getEstadoGarantia(id);
  }

  // Gerente: ver + crear + editar. Solo admin elimina.
  @Roles(ROLE.admin, ROLE.gerente, ROLE.mantenimiento)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFichaTecnicaDto: UpdateFichaTecnicaDto,
  ) {
    return this.fichaTecnicaService.update(id, updateFichaTecnicaDto);
  }

  @Roles(ROLE.admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fichaTecnicaService.remove(id);
  }
}
