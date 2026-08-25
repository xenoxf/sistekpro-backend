import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
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
