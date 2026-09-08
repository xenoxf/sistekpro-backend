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
import { Departamento } from 'src/departamentos/entities/departamento.entity';

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn('uuid')
  id_empleado: string;

  get id(): string {
    return this.id_empleado;
  }
  set id(value: string) {
    this.id_empleado = value;
  }

  @Column({ length: 80 })
  nombre_empleado: string;

  @Column({ length: 80 })
  apellido_empleado: string;

  @Column({ length: 120, unique: true })
  correo_empleado: string;

  @Column({ length: 80 })
  cargo: string;

  @ManyToOne(() => Departamento, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: true,
  })
  @JoinColumn({ name: 'id_departamento' })
  departamento: Departamento;

  @RelationId((empleado: Empleado) => empleado.departamento)
  id_departamento: string;

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
