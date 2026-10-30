import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { PaginationDto, PaginatedResult } from 'src/common/dto/pagination.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { ROLES_GLOBALES } from 'src/users/enums/ROLE.enum';
import { normalizeKey } from 'src/common/utils/normalize-key.util';
import {
  SERVICIOS_LEAD,
  departamentoDelServicio,
} from './servicio-departamento';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
  ) {}

  async create(dto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadRepo.create({
      nombre: dto.nombre.trim(),
      email: dto.email.trim().toLowerCase(),
      numero: dto.numero.trim(),
      servicio: dto.servicio.trim(),
      message: dto.message.trim(),
    });
    return this.leadRepo.save(lead);
  }

  async findAll(
    pagination: PaginationDto,
    user?: JwtPayload,
  ): Promise<PaginatedResult<Lead>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const visibles = this.serviciosVisibles(user);

    const qb = this.leadRepo
      .createQueryBuilder('lead')
      .orderBy('lead.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    // Cada departamento solo recibe los formularios de sus servicios;
    // administración y gerencia ven los de todos.
    if (visibles !== null) {
      if (visibles.length === 0) {
        return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      }
      qb.andWhere('lead.servicio IN (:...servicios)', { servicios: visibles });
    }

    const search = pagination.search?.trim();
    if (search) {
      const term = `%${search}%`;
      qb.andWhere(
        `(
          lead.id LIKE :term OR
          lead.nombre LIKE :term OR
          lead.email LIKE :term OR
          lead.numero LIKE :term OR
          lead.servicio LIKE :term OR
          lead.message LIKE :term
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

  async findOne(id: string, user?: JwtPayload): Promise<Lead> {
    const lead = await this.findEntity(id);

    const visibles = this.serviciosVisibles(user);
    if (visibles !== null && !visibles.includes(lead.servicio)) {
      // No se revela que el formulario exista en otro departamento.
      throw new NotFoundException('Formulario no encontrado');
    }

    return lead;
  }

  async remove(id: string): Promise<{ message: string }> {
    const lead = await this.findEntity(id);
    await this.leadRepo.remove(lead);
    return { message: 'Lead eliminado correctamente' };
  }

  private async findEntity(id: string): Promise<Lead> {
    const lead = await this.leadRepo.findOneBy({ id });
    if (!lead) throw new NotFoundException('Lead no encontrado');
    return lead;
  }

  /**
   * Servicios que el usuario tiene permitido consultar.
   *
   * `null` -> todos los servicios (administración y gerencia).
   * `[]`   -> ninguno (su rol/departamento no atiende servicios).
   *
   * Se considera tanto el rol como el departamento del usuario, de forma que
   * un usuario de Informática ve los formularios de servicios de Informática.
   */
  private serviciosVisibles(user?: JwtPayload): string[] | null {
    if (!user) return [];

    const rol = normalizeKey(user.role);
    if (ROLES_GLOBALES.includes(rol)) return null;

    const claves = new Set(
      [rol, normalizeKey(user.departamentoNombre)].filter(Boolean),
    );
    if (claves.size === 0) return [];

    return SERVICIOS_LEAD.filter((servicio) => {
      const departamento = departamentoDelServicio(servicio);
      // Le pertenece a su departamento, o su departamento se llama como el servicio.
      return (
        (departamento !== null && claves.has(departamento)) ||
        claves.has(servicio)
      );
    });
  }
}
