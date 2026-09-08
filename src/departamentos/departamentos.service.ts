import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from './entities/departamento.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { PaginationDto, PaginatedResult } from 'src/common/dto/pagination.dto';

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepo: Repository<Departamento>,
  ) {}

  async create(dto: CreateDepartamentoDto): Promise<Departamento> {
    await this.assertNombreDisponible(dto.nombre_departamento);
    const dep = this.departamentoRepo.create({
      nombre_departamento: dto.nombre_departamento.trim(),
      descripcion: dto.descripcion?.trim() ?? null,
    });
    return this.departamentoRepo.save(dep);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Departamento>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.departamentoRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Departamento> {
    const dep = await this.departamentoRepo.findOneBy({
      id_departamento: id,
    });
    if (!dep) throw new NotFoundException('Departamento no encontrado');
    return dep;
  }

  async findByNombre(nombre: string): Promise<Departamento | null> {
    return this.departamentoRepo.findOneBy({
      nombre_departamento: nombre,
    });
  }

  async update(id: string, dto: UpdateDepartamentoDto): Promise<Departamento> {
    const dep = await this.findOne(id);
    if (
      dto.nombre_departamento &&
      dto.nombre_departamento.trim() !== dep.nombre_departamento
    ) {
      await this.assertNombreDisponible(dto.nombre_departamento);
      dep.nombre_departamento = dto.nombre_departamento.trim();
    }
    if (dto.descripcion !== undefined) {
      dep.descripcion = dto.descripcion?.trim() ?? null;
    }
    return this.departamentoRepo.save(dep);
  }

  async remove(id: string): Promise<{ message: string }> {
    const dep = await this.findOne(id);
    await this.departamentoRepo.remove(dep);
    return { message: 'Departamento eliminado correctamente' };
  }

  private async assertNombreDisponible(nombre: string): Promise<void> {
    const existente = await this.departamentoRepo.findOneBy({
      nombre_departamento: nombre.trim(),
    });
    if (existente) {
      throw new ConflictException(
        `Ya existe un departamento con el nombre '${nombre.trim()}'`,
      );
    }
  }
}
