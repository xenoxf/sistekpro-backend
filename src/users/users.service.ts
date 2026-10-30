import {
  BadRequestException,
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
import { ROLE, ROL_ADMIN, ROLES_FIJOS, ROLES_RESERVADOS } from './enums/ROLE.enum';
import { normalizeKey } from 'src/common/utils/normalize-key.util';
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
      role: await this.resolveRole(dto.role, departamento),
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

    const search = pagination.search?.trim();
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

    if (dto.role !== undefined && normalizeKey(dto.role) !== normalizeKey(user.role)) {
      if (normalizeKey(user.role) === ROL_ADMIN) {
        throw new ForbiddenException(
          'El usuario admin no puede cambiar de rol. Solo debe existir un admin.',
        );
      }
      user.role = await this.resolveRole(dto.role, user.departamento);
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

  /**
   * Valida y normaliza el rol a guardar.
   *
   * Un rol puede ser la clave de cualquier departamento creado ('informatica',
   * 'capacitacion', ...) o de los roles fijos ('gerente'). Si no llega rol, se
   * deriva del departamento elegido, de modo que crear un usuario quede ligado
   * al departamento al que entra.
   */
  private async resolveRole(
    role: string | undefined,
    departamento: Departamento | null,
  ): Promise<string> {
    const clave = normalizeKey(role);

    if (!clave) {
      return (
        normalizeKey(departamento?.nombre_departamento) || ROLE.mantenimiento
      );
    }

    if (ROLES_RESERVADOS.includes(clave)) {
      throw new ForbiddenException(
        'No se permite asignar el rol admin. Solo puede existir un admin.',
      );
    }

    const disponibles = await this.rolesDisponibles();
    if (!disponibles.includes(clave)) {
      throw new BadRequestException(
        `El rol "${role}" no corresponde a ningún departamento. ` +
          `Roles disponibles: ${disponibles.join(', ')}.`,
      );
    }

    return clave;
  }

  /** Roles fijos + la clave de cada departamento creado. */
  private async rolesDisponibles(): Promise<string[]> {
    const departamentos = await this.departamentoRepo.find({
      select: { nombre_departamento: true },
    });

    const claves = departamentos
      .map((dep) => normalizeKey(dep.nombre_departamento))
      .filter(Boolean);

    return [
      ...new Set([...ROLES_FIJOS, ...Object.values(ROLE), ...claves]),
    ].filter((rol) => !ROLES_RESERVADOS.includes(rol));
  }
}
