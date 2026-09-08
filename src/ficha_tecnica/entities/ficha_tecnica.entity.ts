import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { TIPO_EQUIPO } from '../enums/TIPO_EQUIPO.enum';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Entity('ficha_tecnica')
export class FichaTecnica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombreCliente: string;

  @Column({ length: 30, nullable: true })
  telefonoCliente?: string;

  @Column({ type: 'varchar', nullable: true })
  direccionCliente?: string;

  @Column({ type: 'varchar', nullable: true })
  correoCliente?: string;

  @Column({ type: 'varchar', nullable: true })
  servicio?: string;

  @Column({ type: 'enum', enum: TIPO_EQUIPO, nullable: true })
  tipoEquipo?: TIPO_EQUIPO;

  @Column({ type: 'varchar', nullable: true })
  nombreResponsable?: string;

  @Column({ type: 'varchar', nullable: true })
  marcaEquipo?: string;

  @Column({ type: 'varchar', nullable: true })
  modeloEquipo?: string;

  @Column({ type: 'varchar', nullable: true })
  referencia?: string;

  @Column({ type: 'int', nullable: true })
  tiempoGarantiaMeses: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.fichasTecnicas, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente | null;

  @RelationId((ficha: FichaTecnica) => ficha.cliente)
  id_cliente: string | null;

  @Column({ type: 'datetime', nullable: true })
  fechaAdquisicion: Date;

  @Column({ type: 'varchar', nullable: true })
  tipoMonitor: string;

  @Column({ unique: true, nullable: true })
  serialEquipo?: string;

  @Column({ type: 'float', nullable: true })
  tamanoPantallaPulgadas: number;

  @Column({ type: 'varchar', nullable: true })
  procesadorMarca: string;

  @Column({ type: 'varchar', nullable: true })
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

  @Column({ type: 'varchar', nullable: true })
  marcaMouse: string;

  @Column({ type: 'varchar', nullable: true })
  serialMouse: string;

  @Column({ length: 30, nullable: true })
  tipoConectorMouse: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'datetime', nullable: true })
  fechaRealizacion: Date;

  @CreateDateColumn({
    type: 'datetime',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
