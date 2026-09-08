import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
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
  codigo: string;

  @ManyToMany(() => FichaTecnica)
  @JoinTable()
  fichasTecnicas: FichaTecnica[];

  @Column({ type: 'text' })
  fallaReportada: string;

  @Column({ type: 'enum', enum: ORDEN_ESTADO, default: ORDEN_ESTADO.RECIBIDO })
  @Index()
  estado: ORDEN_ESTADO;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaIngreso: Date;

  @Column({ type: 'datetime', nullable: true })
  fechaEntregaEstimada: Date;

  @Column({ type: 'datetime', nullable: true })
  fechaEntregaReal: Date;

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
