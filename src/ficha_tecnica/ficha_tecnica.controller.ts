import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
  findOne(@Param('id') id: string) {
    return this.fichaTecnicaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFichaTecnicaDto: UpdateFichaTecnicaDto) {
    return this.fichaTecnicaService.update(+id, updateFichaTecnicaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fichaTecnicaService.remove(+id);
  }
}
