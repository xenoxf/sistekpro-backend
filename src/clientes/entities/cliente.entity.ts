import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FichaTecnica } from 'src/ficha_tecnica/entities/ficha_tecnica.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id_cliente: string;

  get id(): string {
    return this.id_cliente;
  }
  set id(value: string) {
    this.id_cliente = value;
  }

  @Column({ length: 80 })
  @Index()
  nombre_cliente: string;

  @Column({ length: 80 })
  apellido_cliente: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  @Index()
  correo_cliente: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  dir: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipo_cliente: string | null;

  @OneToMany(() => FichaTecnica, (ficha) => ficha.cliente)
  fichasTecnicas: FichaTecnica[];

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
