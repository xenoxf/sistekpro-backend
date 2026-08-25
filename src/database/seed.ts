import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { ROLE } from 'src/users/enums/ROLE.enum';
import { User } from 'src/users/entities/user.entity';

const BCRYPT_SALT_ROUNDS = 10;

const SEED_USERS: Array<{ name: string; password: string; role: ROLE }> = [
  {
    name: 'admin',
    password:
      process.env.SEED_ADMIN_PASSWORD ?? 'Admin-ZxMm4mbsvpIKTDdN5jPwZly',
    role: ROLE.admin,
  },
  {
    name: 'mantenimiento',
    password:
      process.env.SEED_MANTENIMIENTO_PASSWORD ?? 'Mant-91zbeKUvfgzRaOP81Fw6189',
    role: ROLE.mantenimiento,
  },
];

async function seed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  for (const seedUser of SEED_USERS) {
    const existing = await userRepository.findOneBy({ name: seedUser.name });

    if (existing) {
      console.log(
        `[seed] El usuario "${seedUser.name}" ya existe (id: ${existing.id}). Se omite.`,
      );
      continue;
    }

    const user = userRepository.create({
      name: seedUser.name,
      role: seedUser.role,
      password: await bcrypt.hash(seedUser.password, BCRYPT_SALT_ROUNDS),
    });

    await userRepository.save(user);

    console.log(`[seed] Usuario "${user.name}" creado (id: ${user.id}).`);
  }

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('[seed] Error al ejecutar el seed:', error);
  process.exit(1);
});
