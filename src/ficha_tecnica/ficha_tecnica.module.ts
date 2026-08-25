import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FichaTecnicaService } from './ficha_tecnica.service';
import { FichaTecnicaController } from './ficha_tecnica.controller';
import { FichaTecnica } from './entities/ficha_tecnica.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FichaTecnica])],
  controllers: [FichaTecnicaController],
  providers: [FichaTecnicaService],
})
export class FichaTecnicaModule {}
