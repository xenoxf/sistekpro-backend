import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FichaTecnicaService } from './ficha_tecnica.service';
import { FichaTecnicaController } from './ficha_tecnica.controller';
import { FichaTecnica } from './entities/ficha_tecnica.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FichaTecnica, Cliente])],
  controllers: [FichaTecnicaController],
  providers: [FichaTecnicaService],
  exports: [FichaTecnicaService],
})
export class FichaTecnicaModule {}
