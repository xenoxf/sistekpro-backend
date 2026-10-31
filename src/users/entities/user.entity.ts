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
import { ROLE } from '../enums/ROLE.enum';
import { Departamento } from 'src/departamentos/entities/departamento.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ select: false })
  password: string;

  /**
   * Clave del rol: 'admin', 'gerente' o la clave de un departamento
   * ('informatica', 'marketing', ...). Se guarda como texto para que un
   * departamento nuevo sirva de rol sin alterar el esquema.
   */
  @Column({ type: 'varchar', length: 64 })
  role: string;

  @ManyToOne(() => Departamento, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'departamentoId' })
  departamento: Departamento | null;

  @RelationId((user: User) => user.departamento)
  departamentoId: string | null;

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
