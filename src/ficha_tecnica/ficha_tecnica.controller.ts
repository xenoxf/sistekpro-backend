import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { FichaTecnicaService } from './ficha_tecnica.service';
import { CreateFichaTecnicaDto } from './dto/create-ficha_tecnica.dto';
import { UpdateFichaTecnicaDto } from './dto/update-ficha_tecnica.dto';

@Controller('ficha-tecnica')
export class FichaTecnicaController {
  constructor(private readonly fichaTecnicaService: FichaTecnicaService) {}

  @Post()
  create(@Body() createFichaTecnicaDto: CreateFichaTecnicaDto) {
    return this.fichaTecnicaService.create(createFichaTecnicaDto);
  }

  @Get()
  findAll() {
    return this.fichaTecnicaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fichaTecnicaService.findOne(id);
  }

  @Get(':id/garantia')
  getEstadoGarantia(@Param('id', ParseUUIDPipe) id: string) {
    return this.fichaTecnicaService.getEstadoGarantia(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFichaTecnicaDto: UpdateFichaTecnicaDto,
  ) {
    return this.fichaTecnicaService.update(id, updateFichaTecnicaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fichaTecnicaService.remove(id);
  }
}
