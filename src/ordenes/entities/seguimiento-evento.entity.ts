import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrdenServicio } from './orden-servicio.entity';

@Entity('seguimiento_eventos')
@Index(['orden', 'createdAt'])
export class SeguimientoEvento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrdenServicio, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordenId' })
  orden: OrdenServicio;

  @Column({ length: 150 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
