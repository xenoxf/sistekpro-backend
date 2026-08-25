import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByName(name: string): Promise<User | null> {
    return this.userRepository.findOneBy({ name });
  }

  async findByNameWithPassword(name: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
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

    Object.assign(user, dto);

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
