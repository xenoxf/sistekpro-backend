import { Module } from '@nestjs/common';
import { FichaTecnicaService } from './ficha_tecnica.service';
import { FichaTecnicaController } from './ficha_tecnica.controller';

@Module({
  controllers: [FichaTecnicaController],
  providers: [FichaTecnicaService],
})
export class FichaTecnicaModule {}
