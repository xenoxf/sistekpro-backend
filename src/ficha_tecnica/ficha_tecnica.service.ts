import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { CreateFichaTecnicaDto } from './dto/create-ficha_tecnica.dto';
import { UpdateFichaTecnicaDto } from './dto/update-ficha_tecnica.dto';
import { FichaTecnica } from './entities/ficha_tecnica.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { TIPO_EQUIPO } from './enums/TIPO_EQUIPO.enum';
import { PaginationDto, PaginatedResult } from 'src/common/dto/pagination.dto';

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
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async create(dto: CreateFichaTecnicaDto): Promise<FichaTecnica> {
    if (dto.serialEquipo) {
      await this.assertSerialDisponible(dto.serialEquipo);
    }

    let cliente: Cliente | null = null;
    if (dto.id_cliente) {
      cliente = await this.clienteRepo.findOneBy({
        id_cliente: dto.id_cliente,
      });
      if (!cliente) throw new NotFoundException('Cliente no encontrado');
    }

    const { fechaAdquisicion, fechaRealizacion, ...datos } = dto;

    const ficha = this.fichaTecnicaRepo.create({
      ...datos,
      cliente: cliente ?? null,
      fechaAdquisicion: fechaAdquisicion
        ? new Date(fechaAdquisicion)
        : undefined,
      fechaRealizacion: fechaRealizacion
        ? new Date(fechaRealizacion)
        : undefined,
    });

    return this.fichaTecnicaRepo.save(ficha);
  }

  async findAll(
    pagination: PaginationDto,
    serial?: string,
    tipoEquipo?: TIPO_EQUIPO,
  ): Promise<PaginatedResult<FichaTecnica>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<FichaTecnica> = {};

    if (serial) {
      where.serialEquipo = Like(`%${serial}%`);
    }

    if (tipoEquipo) {
      where.tipoEquipo = tipoEquipo;
    }

    const [data, total] = await this.fichaTecnicaRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      relations: { cliente: true },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<FichaTecnica> {
    const ficha = await this.fichaTecnicaRepo.findOne({
      where: { id },
      relations: { cliente: true },
    });

    if (!ficha) {
      throw new NotFoundException('Ficha técnica no encontrada');
    }

    return ficha;
  }

  async findBySerial(serialEquipo: string): Promise<FichaTecnica | null> {
    return this.fichaTecnicaRepo.findOneBy({ serialEquipo });
  }

  async findByIds(ids: string[]): Promise<FichaTecnica[]> {
    const fichas = await this.fichaTecnicaRepo.findBy({ id: In(ids) });

    if (fichas.length !== ids.length) {
      const encontrados = new Set(fichas.map((f) => f.id));
      const faltantes = ids.filter((id) => !encontrados.has(id));
      throw new NotFoundException(
        `No se encontraron las fichas técnicas: ${faltantes.join(', ')}`,
      );
    }

    return fichas;
  }

  async update(id: string, dto: UpdateFichaTecnicaDto): Promise<FichaTecnica> {
    const ficha = await this.findOne(id);

    if (dto.serialEquipo && dto.serialEquipo !== ficha.serialEquipo) {
      await this.assertSerialDisponible(dto.serialEquipo);
    }

    const { fechaAdquisicion, fechaRealizacion, id_cliente, ...datos } = dto;

    if (id_cliente !== undefined) {
      if (id_cliente === null) {
        ficha.cliente = null;
      } else {
        const cliente = await this.clienteRepo.findOneBy({ id_cliente });
        if (!cliente) throw new NotFoundException('Cliente no encontrado');
        ficha.cliente = cliente;
      }
    }

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
