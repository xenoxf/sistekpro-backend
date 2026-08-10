import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ROLE } from './enums/ROLE.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to the service', async () => {
      const dto = {
        name: 'admin',
        password: 'plain-password',
        role: ROLE.admin,
      };

      usersService.create.mockResolvedValue({ id: '1' });

      await controller.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should delegate to the service', async () => {
      await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delegate to the service with the id', async () => {
      await controller.remove('8f8bd4c0-2b21-4d47-9b3e-9b3f3e3e3e3e');

      expect(usersService.remove).toHaveBeenCalledWith(
        '8f8bd4c0-2b21-4d47-9b3e-9b3f3e3e3e3e',
      );
    });
  });
});
