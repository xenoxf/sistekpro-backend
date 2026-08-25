import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FichaTecnica } from '../../ficha_tecnica/entities/ficha_tecnica.entity';
import { ORDEN_ESTADO } from '../enums/ORDEN_ESTADO.enum';

@Entity('ordenes_servicio')
export class OrdenServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  @Index()
  codigo: string;

  @ManyToOne(() => FichaTecnica, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'fichaTecnicaId' })
  fichaTecnica: FichaTecnica;

  @Column({ type: 'uuid' })
  fichaTecnicaId: string;

  @Column({ type: 'text' })
  fallaReportada: string;

  @Column({ type: 'enum', enum: ORDEN_ESTADO, default: ORDEN_ESTADO.RECIBIDO })
  estado: ORDEN_ESTADO;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  fechaIngreso: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fechaEntregaEstimada: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fechaEntregaReal: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
