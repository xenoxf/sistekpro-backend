import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Departamento } from 'src/departamentos/entities/departamento.entity';
import { ROLE } from './enums/ROLE.enum';
import { PaginationDto, PaginatedResult } from 'src/common/dto/pagination.dto';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Departamento)
    private readonly departamentoRepo: Repository<Departamento>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    if (dto.role === ROLE.admin) {
      throw new ForbiddenException(
        'No se permite crear usuarios con rol admin. Solo puede existir un admin.',
      );
    }
    await this.assertNameAvailable(dto.name);

    let departamento: Departamento | null = null;
    if (dto.departamentoId) {
      departamento = await this.departamentoRepo.findOneBy({
        id_departamento: dto.departamentoId,
      });
      if (!departamento) {
        throw new NotFoundException('Departamento no encontrado');
      }
    }

    const user = this.userRepository.create({
      name: dto.name,
      password: await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS),
      role: dto.role ?? ROLE.mantenimiento,
      departamento: departamento,
    });

    await this.userRepository.save(user);
    return this.findById(user.id);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<User>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.departamento', 'departamento')
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const search = (pagination as any).search?.trim();
    if (search) {
      const term = `%${search}%`;
      qb.andWhere(
        `(
          user.id LIKE :term OR
          user.name LIKE :term OR
          user.role LIKE :term OR
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

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { departamento: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByName(name: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { name },
      relations: { departamento: true },
    });
  }

  async findByNameWithPassword(name: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.departamento', 'departamento')
      .addSelect('user.password')
      .where('user.name = :name', { name })
      .getOne();
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.name && dto.name !== user.name) {
      await this.assertNameAvailable(dto.name);
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    }

    if (dto.departamentoId !== undefined) {
      if (dto.departamentoId === null) {
        user.departamento = null;
      } else {
        const dep = await this.departamentoRepo.findOneBy({
          id_departamento: dto.departamentoId,
        });
        if (!dep) throw new NotFoundException('Departamento no encontrado');
        user.departamento = dep;
      }
    }

    if (dto.role) {
      if (dto.role === ROLE.admin) {
        throw new ForbiddenException(
          'No se permite asignar el rol admin.',
        );
      }
      user.role = dto.role;
    }
    if (dto.name) user.name = dto.name;
    if (dto.password) user.password = dto.password;

    await this.userRepository.save(user);

    return this.findById(user.id);
  }

  async asignarDepartamento(
    userId: string,
    departamentoId: string | null,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (departamentoId === null) {
      user.departamento = null;
    } else {
      const dep = await this.departamentoRepo.findOneBy({
        id_departamento: departamentoId,
      });
      if (!dep) throw new NotFoundException('Departamento no encontrado');
      user.departamento = dep;
    }
    await this.userRepository.save(user);
    return this.findById(user.id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findById(id);

    await this.userRepository.remove(user);

    return { message: 'Usuario eliminado correctamente' };
  }

  private async assertNameAvailable(name: string): Promise<void> {
    const existing = await this.findByName(name);

    if (existing) {
      throw new ConflictException('El nombre de usuario ya está registrado');
    }
  }
}
