import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { Departamento } from 'src/departamentos/entities/departamento.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { PaginationDto, PaginatedResult } from 'src/common/dto/pagination.dto';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepo: Repository<Empleado>,
    @InjectRepository(Departamento)
    private readonly departamentoRepo: Repository<Departamento>,
  ) {}

  async create(dto: CreateEmpleadoDto): Promise<Empleado> {
    await this.assertCorreoDisponible(dto.correo_empleado);
    const departamento = await this.departamentoRepo.findOneBy({
      id_departamento: dto.id_departamento,
    });
    if (!departamento) {
      throw new NotFoundException('Departamento no encontrado');
    }
    const empleado = this.empleadoRepo.create({
      nombre_empleado: dto.nombre_empleado.trim(),
      apellido_empleado: dto.apellido_empleado.trim(),
      correo_empleado: dto.correo_empleado.trim().toLowerCase(),
      cargo: dto.cargo.trim(),
      departamento,
    });
    return this.empleadoRepo.save(empleado);
  }

  async findAll(
    pagination: PaginationDto,
    departamentoId?: string,
  ): Promise<PaginatedResult<Empleado>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.empleadoRepo
      .createQueryBuilder('empleado')
      .leftJoinAndSelect('empleado.departamento', 'departamento')
      .orderBy('empleado.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const search = (pagination as any).search?.trim();
    const depId = departamentoId ?? (pagination as any).departamentoId;

    if (depId) {
      qb.andWhere('departamento.id_departamento = :depId', { depId });
    }

    if (search) {
      const term = `%${search}%`;
      qb.andWhere(
        `(
          empleado.id_empleado LIKE :term OR
          empleado.nombre_empleado LIKE :term OR
          empleado.apellido_empleado LIKE :term OR
          empleado.correo_empleado LIKE :term OR
          empleado.cargo LIKE :term OR
          departamento.nombre_departamento LIKE :term
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

  async findOne(id: string): Promise<Empleado> {
    const emp = await this.empleadoRepo.findOne({
      where: { id_empleado: id },
      relations: { departamento: true },
    });
    if (!emp) throw new NotFoundException('Empleado no encontrado');
    return emp;
  }

  async update(id: string, dto: UpdateEmpleadoDto): Promise<Empleado> {
    const emp = await this.findOne(id);
    if (
      dto.correo_empleado &&
      dto.correo_empleado.trim().toLowerCase() !== emp.correo_empleado
    ) {
      await this.assertCorreoDisponible(dto.correo_empleado);
      emp.correo_empleado = dto.correo_empleado.trim().toLowerCase();
    }
    if (dto.nombre_empleado) emp.nombre_empleado = dto.nombre_empleado.trim();
    if (dto.apellido_empleado)
      emp.apellido_empleado = dto.apellido_empleado.trim();
    if (dto.cargo) emp.cargo = dto.cargo.trim();
    if (
      dto.id_departamento &&
      dto.id_departamento !== emp.departamento?.id_departamento
    ) {
      const dep = await this.departamentoRepo.findOneBy({
        id_departamento: dto.id_departamento,
      });
      if (!dep) throw new NotFoundException('Departamento no encontrado');
      emp.departamento = dep;
    }
    return this.empleadoRepo.save(emp);
  }

  async remove(id: string): Promise<{ message: string }> {
    const emp = await this.findOne(id);
    await this.empleadoRepo.remove(emp);
    return { message: 'Empleado eliminado correctamente' };
  }

  private async assertCorreoDisponible(correo: string): Promise<void> {
    const existente = await this.empleadoRepo.findOneBy({
      correo_empleado: correo.trim().toLowerCase(),
    });
    if (existente) {
      throw new ConflictException(
        `Ya existe un empleado con el correo '${correo.trim()}'`,
      );
    }
  }
}
