import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFichaTecnicaDto } from './dto/create-ficha_tecnica.dto';
import { UpdateFichaTecnicaDto } from './dto/update-ficha_tecnica.dto';
import { FichaTecnica } from './entities/ficha_tecnica.entity';

const MS_POR_DIA = 1000 * 60 * 60 * 24;

export interface EstadoGarantia {
  tieneGarantia: boolean;
  enGarantia: boolean;
  venceEl: Date | null;
  diasRestantes: number | null;
}

@Injectable()
export class FichaTecnicaService {
  constructor(
    @InjectRepository(FichaTecnica)
    private readonly fichaTecnicaRepo: Repository<FichaTecnica>,
  ) {}

  async create(dto: CreateFichaTecnicaDto): Promise<FichaTecnica> {
    await this.assertSerialDisponible(dto.serialEquipo);

    const { fechaAdquisicion, fechaRealizacion, ...datos } = dto;

    const ficha = this.fichaTecnicaRepo.create({
      ...datos,
      fechaAdquisicion: fechaAdquisicion
        ? new Date(fechaAdquisicion)
        : undefined,
      fechaRealizacion: fechaRealizacion
        ? new Date(fechaRealizacion)
        : undefined,
    });

    return this.fichaTecnicaRepo.save(ficha);
  }

  async findAll(): Promise<FichaTecnica[]> {
    return this.fichaTecnicaRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<FichaTecnica> {
    const ficha = await this.fichaTecnicaRepo.findOneBy({ id });

    if (!ficha) {
      throw new NotFoundException('Ficha técnica no encontrada');
    }

    return ficha;
  }

  async findBySerial(serialEquipo: string): Promise<FichaTecnica | null> {
    return this.fichaTecnicaRepo.findOneBy({ serialEquipo });
  }

  async update(id: string, dto: UpdateFichaTecnicaDto): Promise<FichaTecnica> {
    const ficha = await this.findOne(id);

    if (dto.serialEquipo && dto.serialEquipo !== ficha.serialEquipo) {
      await this.assertSerialDisponible(dto.serialEquipo);
    }

    const { fechaAdquisicion, fechaRealizacion, ...datos } = dto;

    Object.assign(ficha, {
      ...datos,
      fechaAdquisicion: fechaAdquisicion
        ? new Date(fechaAdquisicion)
        : ficha.fechaAdquisicion,
      fechaRealizacion: fechaRealizacion
        ? new Date(fechaRealizacion)
        : ficha.fechaRealizacion,
    });

    return this.fichaTecnicaRepo.save(ficha);
  }

  async remove(id: string): Promise<{ message: string }> {
    const ficha = await this.findOne(id);

    await this.fichaTecnicaRepo.remove(ficha);

    return { message: 'Ficha técnica eliminada correctamente' };
  }

  async getEstadoGarantia(id: string): Promise<EstadoGarantia> {
    const ficha = await this.findOne(id);
    return this.calcularGarantia(ficha);
  }

  private calcularGarantia(ficha: FichaTecnica): EstadoGarantia {
    const sinGarantia: EstadoGarantia = {
      tieneGarantia: false,
      enGarantia: false,
      venceEl: null,
      diasRestantes: null,
    };

    if (!ficha.fechaAdquisicion || !ficha.tiempoGarantiaMeses) {
      return sinGarantia;
    }

    const venceEl = new Date(ficha.fechaAdquisicion);
    venceEl.setMonth(venceEl.getMonth() + ficha.tiempoGarantiaMeses);

    const diasRestantes = Math.ceil(
      (venceEl.getTime() - Date.now()) / MS_POR_DIA,
    );

    return {
      tieneGarantia: true,
      enGarantia: diasRestantes >= 0,
      venceEl,
      diasRestantes,
    };
  }

  private async assertSerialDisponible(serialEquipo: string): Promise<void> {
    const existente = await this.findBySerial(serialEquipo);

    if (existente) {
      throw new ConflictException(
        `Ya existe una ficha técnica con el serial '${serialEquipo}'`,
      );
    }
  }
}
