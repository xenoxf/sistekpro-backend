import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TIPO_EQUIPO } from '../enums/TIPO_EQUIPO.enum';

@Entity('ficha_tecnica')
export class FichaTecnica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombreCliente: string;

  @Column({ length: 30 })
  telefonoCliente: string;

  @Column()
  direccionCliente: string;

  @Column()
  correoCliente: string;

  @Column()
  servicio: string;

  @Column({ type: 'enum', enum: TIPO_EQUIPO })
  tipoEquipo: TIPO_EQUIPO;

  @Column()
  nombreResponsable: string;

  @Column()
  marcaEquipo: string;

  @Column()
  modeloEquipo: string;

  @Column({ nullable: true })
  referencia: string;

  @Column({ type: 'int', nullable: true })
  tiempoGarantiaMeses: number;

  @Column({ type: 'timestamptz', nullable: true })
  fechaAdquisicion: Date;

  @Column({ nullable: true })
  tipoMonitor: string;

  @Column({ unique: true })
  @Index()
  serialEquipo: string;

  @Column({ type: 'float', nullable: true })
  tamanoPantallaPulgadas: number;

  @Column({ nullable: true })
  procesadorMarca: string;

  @Column({ nullable: true })
  procesadorModelo: string;

  @Column({ length: 10, nullable: true })
  procesadorBits: string;

  @Column({ type: 'int', nullable: true })
  nucleosCpu: number;

  @Column({ length: 50, nullable: true })
  velocidadProcesador: string;

  @Column({ type: 'int', nullable: true })
  memoriaRamGb: number;

  @Column({ type: 'int', nullable: true, default: 1 })
  cantidadDiscosDuros: number;

  @Column({ length: 30, nullable: true })
  tecnologiaDisco1: string;

  @Column({ type: 'int', nullable: true })
  capacidadDisco1Gb: number;

  @Column({ length: 30, nullable: true })
  tecnologiaDisco2: string;

  @Column({ type: 'int', nullable: true })
  capacidadDisco2Gb: number;

  @Column({ default: false })
  lectorDvdCd: boolean;

  @Column({ default: false })
  tarjetaVideoIntegrada: boolean;

  @Column({ default: false })
  tarjetaVideoIndependiente: boolean;

  @Column({ type: 'int', nullable: true })
  conectoresVga: number;

  @Column({ type: 'int', nullable: true })
  puertosHdmi: number;

  @Column({ type: 'int', nullable: true })
  puertosUsb: number;

  @Column({ type: 'int', nullable: true })
  puertosPci: number;

  @Column({ type: 'int', nullable: true })
  puertosPciExpress: number;

  @Column({ default: false })
  tarjetaEthernet: boolean;

  @Column({ default: false })
  tarjetaRedInalambrica: boolean;

  @Column({ nullable: true })
  marcaMouse: string;

  @Column({ nullable: true })
  serialMouse: string;

  @Column({ length: 30, nullable: true })
  tipoConectorMouse: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'timestamptz', nullable: true })
  fechaRealizacion: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
