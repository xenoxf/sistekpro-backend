import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PaginationDto, PaginatedResult } from 'src/common/dto/pagination.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async create(dto: CreateClienteDto): Promise<Cliente> {
    if (dto.correo_cliente) {
      await this.assertCorreoDisponible(dto.correo_cliente);
    }
    const cliente = this.clienteRepo.create({
      nombre_cliente: dto.nombre_cliente.trim(),
      apellido_cliente: dto.apellido_cliente.trim(),
      correo_cliente: dto.correo_cliente?.trim() ?? null,
      telefono: dto.telefono?.trim() ?? null,
      dir: dto.dir?.trim() ?? null,
      tipo_cliente: dto.tipo_cliente?.trim() ?? null,
    });
    return this.clienteRepo.save(cliente);
  }

  async findAll(
    pagination: PaginationDto,
    search?: string,
  ): Promise<PaginatedResult<Cliente>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.clienteRepo
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.fichasTecnicas', 'ficha')
      .orderBy('cliente.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        '(cliente.nombre_cliente LIKE :term OR cliente.apellido_cliente LIKE :term OR cliente.correo_cliente LIKE :term OR cliente.telefono LIKE :term)',
        { term },
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepo.findOne({
      where: { id_cliente: id },
      relations: { fichasTecnicas: true },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async findByIdSimple(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepo.findOneBy({ id_cliente: id });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async findByCorreo(correo: string): Promise<Cliente | null> {
    return this.clienteRepo.findOneBy({ correo_cliente: correo });
  }

  async update(id: string, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findByIdSimple(id);
    if (
      dto.correo_cliente &&
      dto.correo_cliente.trim() !== cliente.correo_cliente
    ) {
      await this.assertCorreoDisponible(dto.correo_cliente);
    }
    Object.assign(cliente, {
      nombre_cliente: dto.nombre_cliente?.trim() ?? cliente.nombre_cliente,
      apellido_cliente:
        dto.apellido_cliente?.trim() ?? cliente.apellido_cliente,
      correo_cliente:
        dto.correo_cliente !== undefined
          ? (dto.correo_cliente?.trim() ?? null)
          : cliente.correo_cliente,
      telefono:
        dto.telefono !== undefined
          ? (dto.telefono?.trim() ?? null)
          : cliente.telefono,
      dir: dto.dir !== undefined ? (dto.dir?.trim() ?? null) : cliente.dir,
      tipo_cliente:
        dto.tipo_cliente !== undefined
          ? (dto.tipo_cliente?.trim() ?? null)
          : cliente.tipo_cliente,
    });
    return this.clienteRepo.save(cliente);
  }

  async remove(id: string): Promise<{ message: string }> {
    const cliente = await this.findByIdSimple(id);
    await this.clienteRepo.remove(cliente);
    return { message: 'Cliente eliminado correctamente' };
  }

  private async assertCorreoDisponible(correo: string): Promise<void> {
    if (!correo) return;
    const existente = await this.clienteRepo.findOneBy({
      correo_cliente: correo.trim(),
    });
    if (existente) {
      throw new ConflictException(
        `Ya existe un cliente con el correo '${correo.trim()}'`,
      );
    }
  }
}
