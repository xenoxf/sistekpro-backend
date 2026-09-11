import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateFichaTecnicaDto } from './dto/create-ficha_tecnica.dto';
import { UpdateFichaTecnicaDto } from './dto/update-ficha_tecnica.dto';
import { FindFichaTecnicaDto } from './dto/find-ficha-tecnica.dto';
import { FichaTecnica } from './entities/ficha_tecnica.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
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
    query: FindFichaTecnicaDto | PaginationDto,
    serial?: string,
    tipoEquipo?: any,
  ): Promise<PaginatedResult<FichaTecnica>> {
    // Soporta tanto firma antigua (pagination, serial, tipoEquipo) como nueva (FindFichaTecnicaDto)
    let q: FindFichaTecnicaDto;
    if (query && typeof query === 'object' && ('search' in query || 'serial' in query || 'tipoEquipo' in query || 'page' in query)) {
      // Si el primer arg ya es un DTO con search/serial/tipoEquipo, úsalo
      if (serial === undefined && tipoEquipo === undefined) {
        q = query as FindFichaTecnicaDto;
      } else {
        // Firma antigua: (pagination, serial, tipoEquipo)
        q = {
          ...(query as PaginationDto),
          serial: serial as string | undefined,
          tipoEquipo: tipoEquipo as any,
        } as FindFichaTecnicaDto;
      }
    } else {
      q = query as FindFichaTecnicaDto;
    }

    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.fichaTecnicaRepo
      .createQueryBuilder('ficha')
      .leftJoinAndSelect('ficha.cliente', 'cliente')
      .orderBy('ficha.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (q.tipoEquipo) {
      qb.andWhere('ficha.tipoEquipo = :tipoEquipo', { tipoEquipo: q.tipoEquipo });
    }

    if (q.serial) {
      const s = `%${q.serial.trim()}%`;
      qb.andWhere('(ficha.serialEquipo LIKE :serial)', { serial: s });
    }

    if (q.search?.trim()) {
      const term = `%${q.search.trim()}%`;
      qb.andWhere(
        `(
          ficha.id LIKE :term OR
          ficha.nombreCliente LIKE :term OR
          ficha.serialEquipo LIKE :term OR
          ficha.marcaEquipo LIKE :term OR
          ficha.modeloEquipo LIKE :term OR
          ficha.referencia LIKE :term OR
          ficha.correoCliente LIKE :term OR
          ficha.telefonoCliente LIKE :term OR
          ficha.direccionCliente LIKE :term OR
          ficha.nombreResponsable LIKE :term OR
          ficha.observaciones LIKE :term OR
          ficha.tipoEquipo LIKE :term OR
          cliente.nombre_cliente LIKE :term OR
          cliente.apellido_cliente LIKE :term OR
          cliente.correo_cliente LIKE :term OR
          cliente.telefono LIKE :term OR
          cliente.id_cliente LIKE :term
        )`,
        { term },
      );
    }

    const [data, total] = await qb.getManyAndCount();

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
