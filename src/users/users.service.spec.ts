import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ROLE } from './enums/ROLE.enum';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
    createQueryBuilder: jest.Mock;
    remove: jest.Mock;
  };

  const mockUser: User = {
    id: '8f8bd4c0-2b21-4d47-9b3e-9b3f3e3e3e3e',
    name: 'testuser',
    password: 'hashed-password',
    role: ROLE.mantenimiento,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    userRepository = {
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
      find: jest.fn().mockResolvedValue([mockUser]),
      findOneBy: jest.fn().mockResolvedValue(null),
      createQueryBuilder: jest.fn().mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }),
      remove: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return the user when found', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      await expect(service.findById('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByName', () => {
    it('should return the user by name', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findByName('testuser');

      expect(result).toEqual(mockUser);
    });
  });

  describe('findByNameWithPassword', () => {
    it('should add the password select and return the user', async () => {
      userRepository.createQueryBuilder.mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByNameWithPassword('testuser');

      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should remove the user when found', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.remove(mockUser.id);

      expect(userRepository.remove).toHaveBeenCalled();
      expect(result.message).toBe('Usuario eliminado correctamente');
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      await expect(service.remove('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
