import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { FichaTecnicaService } from '../ficha_tecnica/ficha_tecnica.service';
import { OrdenServicio } from './entities/orden-servicio.entity';
import { SeguimientoEvento } from './entities/seguimiento-evento.entity';
import { ORDEN_ESTADO } from './enums/ORDEN_ESTADO.enum';

describe('OrdenesService', () => {
  let service: OrdenesService;
  let ordenesRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    remove: jest.Mock;
  };
  let eventosRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
  };
  let fichaTecnicaService: { findOne: jest.Mock };

  const mockFicha = {
    id: 'ficha-uuid',
    nombreCliente: 'Carlos Gómez',
    tipoEquipo: 'portatil',
    marcaEquipo: 'Lenovo',
    modeloEquipo: 'IdeaPad 3',
    serialEquipo: 'SN-LEN-2026-0001',
  };

  const mockOrden: OrdenServicio = {
    id: 'orden-uuid',
    codigo: 'STK-A7X9K2QFRT4M',
    fichaTecnica: mockFicha as never,
    fichaTecnicaId: mockFicha.id,
    fallaReportada: 'No enciende',
    estado: ORDEN_ESTADO.RECIBIDO,
    fechaIngreso: new Date(),
    fechaEntregaEstimada: null,
    fechaEntregaReal: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    ordenesRepo = {
      create: jest.fn((v) => v as OrdenServicio),
      save: jest.fn((v) => Promise.resolve(v as OrdenServicio)),
      find: jest.fn().mockResolvedValue([mockOrden]),
      findOne: jest.fn().mockResolvedValue(mockOrden),
      findOneBy: jest.fn().mockResolvedValue(null),
      remove: jest.fn().mockResolvedValue(mockOrden),
    };

    eventosRepo = {
      create: jest.fn((v) => v as SeguimientoEvento),
      save: jest.fn((v) => Promise.resolve(v as SeguimientoEvento)),
      find: jest.fn().mockResolvedValue([
        {
          titulo: 'Equipo recibido',
          descripcion: null,
          createdAt: new Date(),
        },
      ]),
    };

    fichaTecnicaService = { findOne: jest.fn().mockResolvedValue(mockFicha) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenesService,
        {
          provide: getRepositoryToken(OrdenServicio),
          useValue: ordenesRepo,
        },
        {
          provide: getRepositoryToken(SeguimientoEvento),
          useValue: eventosRepo,
        },
        {
          provide: FichaTecnicaService,
          useValue: fichaTecnicaService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:5173/seguimiento'),
          },
        },
      ],
    }).compile();

    service = module.get<OrdenesService>(OrdenesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order with a unique code and initial event', async () => {
      const result = await service.create({
        fichaTecnicaId: mockFicha.id,
        fallaReportada: 'No enciende',
      });

      expect(fichaTecnicaService.findOne).toHaveBeenCalledWith(mockFicha.id);
      expect(result.codigo).toMatch(/^STK-[A-HJ-NP-Z2-9]{12}$/);
      expect(result.estado).toBe(ORDEN_ESTADO.RECIBIDO);
      expect(result.trackingUrl).toBe(
        `http://localhost:5173/seguimiento/${result.codigo}`,
      );
      expect(eventosRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when the ficha tecnica does not exist', async () => {
      fichaTecnicaService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.create({ fichaTecnicaId: 'missing', fallaReportada: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSeguimiento', () => {
    it('should return the public tracking view with events', async () => {
      const result = await service.getSeguimiento('stk-a7x9k2qfrt4m');

      expect(result.codigo).toBe(mockOrden.codigo);
      expect(result.cliente.nombre).toBe('Carlos Gómez');
      expect(result.equipo.serial).toBe('SN-LEN-2026-0001');
      expect(result.eventos).toHaveLength(1);
    });

    it('should throw NotFoundException when the code does not exist', async () => {
      ordenesRepo.findOne.mockResolvedValue(null);

      await expect(service.getSeguimiento('STK-NOEXISTE123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cambiarEstado', () => {
    it('should update the state and log an event', async () => {
      const result = await service.cambiarEstado(mockOrden.id, {
        estado: ORDEN_ESTADO.DIAGNOSTICO,
        comentario: 'Revisando fuente de poder',
      });

      expect(result.estado).toBe(ORDEN_ESTADO.DIAGNOSTICO);
      expect(eventosRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: `Estado actualizado: ${ORDEN_ESTADO.DIAGNOSTICO}`,
        }),
      );
    });

    it('should set the real delivery date when delivered', async () => {
      const result = await service.cambiarEstado(mockOrden.id, {
        estado: ORDEN_ESTADO.ENTREGADO,
      });

      expect(result.fechaEntregaReal).toBeInstanceOf(Date);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when the order does not exist', async () => {
      ordenesRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
