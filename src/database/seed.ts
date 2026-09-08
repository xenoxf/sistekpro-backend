import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { ROLE } from 'src/users/enums/ROLE.enum';
import { User } from 'src/users/entities/user.entity';
import { Departamento } from 'src/departamentos/entities/departamento.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { FichaTecnica } from 'src/ficha_tecnica/entities/ficha_tecnica.entity';
import { OrdenServicio } from 'src/ordenes/entities/orden-servicio.entity';
import { SeguimientoEvento } from 'src/ordenes/entities/seguimiento-evento.entity';

const BCRYPT_SALT_ROUNDS = 10;

const SEED_DEPARTAMENTOS: Array<{
  nombre_departamento: string;
  descripcion: string;
}> = [
  {
    nombre_departamento: 'administracion',
    descripcion: 'Administración y gerencia del sistema',
  },
  {
    nombre_departamento: 'mantenimiento',
    descripcion:
      'Departamento de mantenimiento técnico y reparación de equipos',
  },
  {
    nombre_departamento: 'ventas',
    descripcion: 'Departamento comercial y atención al cliente',
  },
  {
    nombre_departamento: 'soporte',
    descripcion: 'Soporte técnico y atención postventa',
  },
];

const SEED_USERS: Array<{
  name: string;
  password: string;
  role: ROLE;
  departamentoNombre?: string;
}> = [
  {
    name: 'admin',
    password: process.env.SEED_ADMIN_PASSWORD!,
    role: ROLE.admin,
    departamentoNombre: 'administracion',
  },
  {
    name: 'mantenimiento',
    password: process.env.SEED_MANTENIMIENTO_PASSWORD!,
    role: ROLE.mantenimiento,
    departamentoNombre: 'mantenimiento',
  },
  {
    name: 'gerente',
    password: process.env.SEED_GERENTE_PASSWORD!,
    role: ROLE.gerente,
    departamentoNombre: 'administracion',
  },
];

async function seed(): Promise<void> {
  if (
    !process.env.SEED_ADMIN_PASSWORD ||
    !process.env.SEED_MANTENIMIENTO_PASSWORD ||
    !process.env.SEED_GERENTE_PASSWORD
  ) {
    console.error(
      '[seed] ERROR: SEED_ADMIN_PASSWORD, SEED_MANTENIMIENTO_PASSWORD y SEED_GERENTE_PASSWORD deben estar definidas en .env',
    );
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [
      User,
      Departamento,
      Cliente,
      Empleado,
      FichaTecnica,
      OrdenServicio,
      SeguimientoEvento,
    ],
    synchronize: true,
  });

  await dataSource.initialize();

  const departamentoRepo = dataSource.getRepository(Departamento);
  const userRepository = dataSource.getRepository(User);

  // Seed departamentos
  const departamentoMap = new Map<string, Departamento>();
  for (const depData of SEED_DEPARTAMENTOS) {
    let dep = await departamentoRepo.findOneBy({
      nombre_departamento: depData.nombre_departamento,
    });
    if (dep) {
      console.log(
        `[seed] Departamento "${dep.nombre_departamento}" ya existe (id: ${dep.id_departamento}).`,
      );
      departamentoMap.set(dep.nombre_departamento, dep);
      continue;
    }
    dep = departamentoRepo.create(depData);
    await departamentoRepo.save(dep);
    departamentoMap.set(dep.nombre_departamento, dep);
    console.log(
      `[seed] Departamento "${dep.nombre_departamento}" creado (id: ${dep.id_departamento}).`,
    );
  }

  for (const seedUser of SEED_USERS) {
    const existing = await userRepository.findOneBy({ name: seedUser.name });

    if (existing) {
      console.log(
        `[seed] El usuario "${seedUser.name}" ya existe (id: ${existing.id}). Se omite.`,
      );
      continue;
    }

    let departamento: Departamento | null = null;
    if (seedUser.departamentoNombre) {
      departamento = departamentoMap.get(seedUser.departamentoNombre) ?? null;
    }

    const user = userRepository.create({
      name: seedUser.name,
      role: seedUser.role,
      password: await bcrypt.hash(seedUser.password, BCRYPT_SALT_ROUNDS),
      departamento: departamento,
      departamentoId: departamento?.id_departamento ?? null,
    });

    await userRepository.save(user);

    console.log(
      `[seed] Usuario "${user.name}" creado (id: ${user.id}) rol=${user.role} dep=${departamento?.nombre_departamento ?? 'sin-departamento'}.`,
    );
  }

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('[seed] Error al ejecutar el seed:', error);
  process.exit(1);
});
