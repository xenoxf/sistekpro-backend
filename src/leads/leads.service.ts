import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { PaginationDto, PaginatedResult } from 'src/common/dto/pagination.dto';

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

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<Lead>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.leadRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadRepo.findOneBy({ id });
    if (!lead) throw new NotFoundException('Lead no encontrado');
    return lead;
  }

  async remove(id: string): Promise<{ message: string }> {
    const lead = await this.findOne(id);
    await this.leadRepo.remove(lead);
    return { message: 'Lead eliminado correctamente' };
  }
}
