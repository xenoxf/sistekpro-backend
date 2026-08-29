import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { FichaTecnicaService } from '../ficha_tecnica/ficha_tecnica.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { AgregarFichasDto } from './dto/agregar-fichas.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { OrdenServicio } from './entities/orden-servicio.entity';
import { SeguimientoEvento } from './entities/seguimiento-evento.entity';
import { ORDEN_ESTADO } from './enums/ORDEN_ESTADO.enum';

const CODIGO_PREFIJO = 'STK-';
const CODIGO_LONGITUD = 12;
const CODIGO_ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_INTENTOS_CODIGO = 5;

export interface SeguimientoPublico {
  codigo: string;
  estado: ORDEN_ESTADO;
  fechaIngreso: Date;
  fechaEntregaEstimada: Date | null;
  fechaEntregaReal: Date | null;
  trackingUrl: string | null;
  clientes: string[];
  equipos: {
    tipo: string;
    marca: string;
    modelo: string;
    serial: string;
  }[];
  eventos: {
    titulo: string;
    descripcion: string | null;
    fecha: Date;
  }[];
}

@Injectable()
export class OrdenesService {
  constructor(
    @InjectRepository(OrdenServicio)
    private readonly ordenesRepo: Repository<OrdenServicio>,
    @InjectRepository(SeguimientoEvento)
    private readonly eventosRepo: Repository<SeguimientoEvento>,
    private readonly fichaTecnicaService: FichaTecnicaService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    dto: CreateOrdenDto,
  ): Promise<OrdenServicio & { trackingUrl: string | null }> {
    const fichas = await this.fichaTecnicaService.findByIds(dto.fichaTecnicaIds);

    const orden = this.ordenesRepo.create({
      fichasTecnicas: fichas,
      fallaReportada: dto.fallaReportada,
      estado: ORDEN_ESTADO.RECIBIDO,
      fechaIngreso: new Date(),
      fechaEntregaEstimada: dto.fechaEntregaEstimada
        ? new Date(dto.fechaEntregaEstimada)
        : undefined,
    });

    await this.asignarCodigoUnico(orden);

    await this.ordenesRepo.save(orden);

    await this.crearEvento(
      orden,
      'Equipo recibido',
      `Orden creada con ${fichas.length} equipo(s). Falla reportada: ${dto.fallaReportada}`,
    );

    return Object.assign(orden, {
      trackingUrl: this.buildTrackingUrl(orden.codigo),
    });
  }

  async agregarFichas(
    id: string,
    dto: AgregarFichasDto,
  ): Promise<OrdenServicio> {
    const orden = await this.findOne(id);
    const nuevas = await this.fichaTecnicaService.findByIds(dto.fichaTecnicaIds);

    const existentes = new Set(orden.fichasTecnicas.map((f) => f.id));
    for (const ficha of nuevas) {
      if (!existentes.has(ficha.id)) orden.fichasTecnicas.push(ficha);
    }

    return this.ordenesRepo.save(orden);
  }

  async findAll(estado?: ORDEN_ESTADO): Promise<OrdenServicio[]> {
    const where = estado ? { estado } : {};

    return this.ordenesRepo.find({
      where,
      relations: { fichasTecnicas: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<OrdenServicio> {
    const orden = await this.ordenesRepo.findOne({
      where: { id },
      relations: { fichasTecnicas: true },
    });

    if (!orden) {
      throw new NotFoundException('Orden de servicio no encontrada');
    }

    return orden;
  }

  async update(id: string, dto: UpdateOrdenDto): Promise<OrdenServicio> {
    const orden = await this.findOne(id);

    Object.assign(orden, {
      ...dto,
      fechaEntregaEstimada: dto.fechaEntregaEstimada
        ? new Date(dto.fechaEntregaEstimada)
        : orden.fechaEntregaEstimada,
    });

    return this.ordenesRepo.save(orden);
  }

  async cambiarEstado(
    id: string,
    dto: CambiarEstadoDto,
  ): Promise<OrdenServicio> {
    const orden = await this.findOne(id);

    orden.estado = dto.estado;

    if (dto.estado === ORDEN_ESTADO.ENTREGADO && !orden.fechaEntregaReal) {
      orden.fechaEntregaReal = new Date();
    }

    await this.ordenesRepo.save(orden);

    await this.crearEvento(
      orden,
      `Estado actualizado: ${dto.estado}`,
      dto.comentario ?? null,
    );

    return orden;
  }

  async remove(id: string): Promise<{ message: string }> {
    const orden = await this.findOne(id);

    await this.ordenesRepo.remove(orden);

    return { message: 'Orden de servicio eliminada correctamente' };
  }

  async getSeguimiento(codigo: string): Promise<SeguimientoPublico> {
    const normalizado = codigo.trim().toUpperCase();

    const orden = await this.ordenesRepo.findOne({
      where: { codigo: normalizado },
      relations: { fichasTecnicas: true },
    });

    if (!orden) {
      throw new NotFoundException('No existe una orden con ese código');
    }

    const eventos = await this.eventosRepo.find({
      where: { orden: { id: orden.id } },
      order: { createdAt: 'ASC' },
    });

    const clientes = Array.from(
      new Set(orden.fichasTecnicas.map((f) => f.nombreCliente).filter(Boolean)),
    );

    return {
      codigo: orden.codigo,
      estado: orden.estado,
      fechaIngreso: orden.fechaIngreso,
      fechaEntregaEstimada: orden.fechaEntregaEstimada,
      fechaEntregaReal: orden.fechaEntregaReal,
      trackingUrl: this.buildTrackingUrl(orden.codigo),
      clientes,
      equipos: orden.fichasTecnicas.map((f) => ({
        tipo: f.tipoEquipo ?? "",
        marca: f.marcaEquipo ?? "",
        modelo: f.modeloEquipo ?? "",
        serial: f.serialEquipo ?? "",
      })),
      eventos: eventos.map((e) => ({
        titulo: e.titulo,
        descripcion: e.descripcion,
        fecha: e.createdAt,
      })),
    };
  }

  private async asignarCodigoUnico(orden: OrdenServicio): Promise<void> {
    for (let intento = 0; intento < MAX_INTENTOS_CODIGO; intento++) {
      const candidato =
        CODIGO_PREFIJO + this.generarCadenaAleatoria(CODIGO_LONGITUD);

      const existente = await this.ordenesRepo.findOneBy({
        codigo: candidato,
      });

      if (!existente) {
        orden.codigo = candidato;
        return;
      }
    }

    throw new Error('No se pudo generar un código único para la orden');
  }

  private generarCadenaAleatoria(longitud: number): string {
    const bytes = randomBytes(longitud);
    let resultado = '';

    for (let i = 0; i < longitud; i++) {
      resultado += CODIGO_ALFABETO[bytes[i] % CODIGO_ALFABETO.length];
    }

    return resultado;
  }

  private buildTrackingUrl(codigo: string): string | null {
    const base = this.configService.get<string>('TRACKING_URL_BASE');

    return base ? `${base.replace(/\/+$/, '')}?c=${codigo}` : null;
  }

  private async crearEvento(
    orden: OrdenServicio,
    titulo: string,
    descripcion: string | null,
  ): Promise<void> {
    const evento = this.eventosRepo.create({
      orden: { id: orden.id },
      titulo,
      descripcion: descripcion ?? undefined,
    });

    await this.eventosRepo.save(evento);
  }
}
