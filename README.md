# sistekpro-backend

API REST del sistema Sistek: gestión de usuarios, autenticación JWT y fichas técnicas (hojas de vida) de equipos de cómputo.

Construido con [NestJS](https://docs.nestjs.com), TypeORM y PostgreSQL.

## Requisitos

- Node.js 20+
- pnpm
- PostgreSQL 14+

## Configuración

Crea un archivo `.env` en la raíz con las siguientes variables:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=sistekpro_db
DB_SSL=false

JWT_SECRET=<secreto-seguro>
JWT_EXPIRATION=10h

API_KEY=<api-key-del-proyecto>

THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

Las variables `DB_*`, `JWT_SECRET` y `API_KEY` son obligatorias; el resto tiene valores por defecto. La app valida el `.env` al arrancar y falla con un mensaje descriptivo si falta algo.

## Instalación y ejecución

```bash
pnpm install

# desarrollo (watch mode)
pnpm run start:dev

# producción
pnpm run build && pnpm run start:prod
```

Al arrancar, TypeORM crea/sincroniza las tablas automáticamente (`synchronize: true`, solo para desarrollo).

## Pruebas

```bash
# unit tests
pnpm run test

# e2e
pnpm run test:e2e

# cobertura
pnpm run test:cov
```

## Documentación de la API

Toda la información para consumir la API (endpoints, headers de autenticación, payloads y ejemplos) está en [`API.md`](./API.md). Ese documento está pensado para conectar el frontend con el backend.

Resumen rápido:

| Recurso | Descripción |
|---|---|
| `POST /auth/login` | Login con JWT (público) |
| `/users` | Gestión de usuarios (solo rol admin; sin creación: los usuarios se crean por seed interno) |
| `/ficha-tecnica` | CRUD de hojas de vida de equipos + consulta de garantía |

Todas las rutas requieren el header `x-api-key`; las protegidas además `Authorization: Bearer <token>`.

## Estructura del proyecto

```
src/
├── auth/            # login y perfil
├── users/           # CRUD de usuarios (rol admin)
├── ficha_tecnica/   # hojas de vida de equipos
├── common/          # guards, decoradores, filtros e interfaces
└── config/          # validación de variables de entorno

Los usuarios se crean únicamente mediante el script de seed interno (`src/database/seed.ts`); la API no expone endpoints de registro ni creación de usuarios.
```

## Seguridad

- **API Key global**: header `x-api-key` en todas las rutas.
- **JWT**: firmado con `JWT_SECRET`, expira según `JWT_EXPIRATION`.
- **Roles**: `admin` y `mantenimiento`; `/users` es exclusivo de `admin`.
- **Rate limiting**: 100 req/min por IP (global); límites más estrictos en login y registro.
- **bcrypt** para contraseñas y validación global de DTOs con `class-validator`.
