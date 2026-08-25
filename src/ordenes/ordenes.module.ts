import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FichaTecnicaModule } from '../ficha_tecnica/ficha_tecnica.module';
import { OrdenServicio } from './entities/orden-servicio.entity';
import { SeguimientoEvento } from './entities/seguimiento-evento.entity';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';
import { SeguimientoController } from './seguimiento.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdenServicio, SeguimientoEvento]),
    FichaTecnicaModule,
  ],
  controllers: [OrdenesController, SeguimientoController],
  providers: [OrdenesService],
})
export class OrdenesModule {}
