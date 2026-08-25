import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { OrdenesService } from './ordenes.service';

@Controller('seguimiento')
export class SeguimientoController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Public()
  @Get(':codigo')
  getSeguimiento(@Param('codigo') codigo: string) {
    if (!codigo || codigo.trim().length < 8) {
      throw new NotFoundException('Código de seguimiento inválido');
    }

    return this.ordenesService.getSeguimiento(codigo);
  }
}
