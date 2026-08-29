# sistekpro-backend

API REST del sistema **Sistek**: gestión de usuarios, autenticación (API Key + JWT), fichas técnicas (hojas de vida) de equipos de cómputo y órdenes de servicio con seguimiento público por QR.

Construido con [NestJS](https://docs.nestjs.com) 11, TypeORM y PostgreSQL.

---

## Tabla de contenidos

1. [Arquitectura general](#1-arquitectura-general)
2. [Requisitos](#2-requisitos)
3. [Configuración (variables de entorno)](#3-configuración-variables-de-entorno)
4. [Instalación y ejecución desde cero](#4-instalación-y-ejecución-desde-cero)
5. [Punto de entrada de la aplicación](#5-punto-de-entrada-de-la-aplicación)
6. [Comunicación entre capas](#6-comunicación-entre-capas)
7. [Flujo de datos (ciclo de vida de una petición)](#7-flujo-de-datos-ciclo-de-vida-de-una-petición)
8. [Autenticación](#8-autenticación)
9. [Conexión a la base de datos](#9-conexión-a-la-base-de-datos)
10. [Archivos más importantes](#10-archivos-más-importantes)
11. [Patrones de diseño utilizados](#11-patrones-de-diseño-utilizados)
12. [Documentación de la API](#12-documentación-de-la-api)
13. [Estructura del proyecto](#13-estructura-del-proyecto)
14. [Seguridad](#14-seguridad)
15. [Pruebas](#15-pruebas)
16. [Orden de estudio recomendado](#16-orden-de-estudio-recomendado)

---

## 1. Arquitectura general

Es una **API REST** en **TypeScript** sobre **NestJS 11** (framework inspirado en Angular que aplica inyección de dependencias y módulos), con persistencia mediante **TypeORM** sobre **PostgreSQL**. El dominio gira en torno a:

- **Usuarios** con roles (`admin`, `mantenimiento`).
- **Fichas técnicas** (hojas de vida de equipos de cómputo).
- **Órdenes de servicio** con estados y un *timeline* de eventos.
- **Seguimiento público** de una orden a través de un código (consultado por QR).

**Stack principal** (`package.json`):

| Propósito | Dependencia |
|---|---|
| Framework / HTTP | `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` |
| Configuración | `@nestjs/config` |
| Autenticación | `@nestjs/jwt` + `bcrypt` |
| ORM / DB | `@nestjs/typeorm` + `typeorm` + `pg` (PostgreSQL) |
| Rate limiting | `@nestjs/throttler` |
| Seguridad de cabeceras | `helmet` |
| Validación de DTOs | `class-validator` / `class-transformer` |

Gestor de paquetes: **pnpm** (ver `pnpm-lock.yaml`). TypeScript con target `ES2023`.

Cada feature (`auth`, `users`, `ficha_tecnica`, `ordenes`) sigue el mismo esquema de carpetas propio de un módulo NestJS: `*.controller.ts`, `*.service.ts`, `*.module.ts`, `dto/`, `entities/`, `enums/`. La lógica transversal (seguridad, errores, metadata) vive en `src/common/`.

---

## 2. Requisitos

- **Node.js 20+**
- **pnpm** (se recomienda la última versión estable)
- **PostgreSQL 14+** (instancia local o remota accesible)

---

## 3. Configuración (variables de entorno)

La aplicación **valida el `.env` al arrancar** mediante `src/config/env.validation.ts` (usando `class-validator`). Si falta o es inválida alguna variable obligatoria, el proceso falla con un mensaje descriptivo.

Crea un archivo `.env` en la raíz del proyecto. Las variables marcadas como **obligatorias** deben estar presentes; el resto tiene valores por defecto.

```env
# --- Servidor ---
PORT=3000
CORS_ORIGIN=http://localhost:5173

# --- Base de datos (OBLIGATORIAS) ---
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=sistekpro_db
DB_SSL=false            # "true" o "false"

# --- JWT (OBLIGATORIA) ---
JWT_SECRET=<genera-un-secreto-seguro>
JWT_EXPIRATION=10h

# --- API Key global (OBLIGATORIA) ---
API_KEY=<genera-una-api-key-segura>

# --- Rate limiting ---
THROTTLE_TTL=60         # ventana en segundos
THROTTLE_LIMIT=100      # máximo de peticiones por IP en la ventana

# --- Seguimiento público ---
TRACKING_URL_BASE=http://localhost:5173/seguimiento

# --- Seed de usuarios (opcional) ---
SEED_ADMIN_PASSWORD=<contraseña-del-usuario-admin>
SEED_MANTENIMIENTO_PASSWORD=<contraseña-del-usuario-mantenimiento>
```

**Resumen de variables:**

| Variable | Obligatoria | Default | Descripción |
|---|---|---|---|
| `PORT` | no | `3000` | Puerto HTTP del servidor |
| `CORS_ORIGIN` | no | — | Orígenes CORS permitidos (separados por coma) |
| `DB_HOST` | **sí** | — | Host de PostgreSQL |
| `DB_PORT` | **sí** | — | Puerto de PostgreSQL (numérico) |
| `DB_USER` | **sí** | — | Usuario de la base de datos |
| `DB_PASS` | **sí** | — | Contraseña de la base de datos |
| `DB_NAME` | **sí** | — | Nombre de la base de datos |
| `DB_SSL` | no | `false` | `"true"`/`"false"` — SSL en la conexión |
| `JWT_SECRET` | **sí** | — | Secreto para firmar/verificar JWT |
| `JWT_EXPIRATION` | no | `10h` | Tiempo de expiración del token |
| `API_KEY` | **sí** | — | API Key global enviada en el header `x-api-key` |
| `THROTTLE_TTL` | no | `60` | Ventana de rate limiting (segundos) |
| `THROTTLE_LIMIT` | no | `100` | Límite de peticiones por IP en la ventana |
| `TRACKING_URL_BASE` | no | — | URL base para el seguimiento público por QR |
| `SEED_ADMIN_PASSWORD` | no | valor por defecto | Contraseña del usuario `admin` creado por seed |
| `SEED_MANTENIMIENTO_PASSWORD` | no | valor por defecto | Contraseña del usuario `mantenimiento` creado por seed |

> ⚠️ **Nunca commitees secretos reales.** Genera `JWT_SECRET` y `API_KEY` con valores aleatorios seguros (por ejemplo `openssl rand -hex 32`). El `.env` no debe subirse al repositorio.

---

## 4. Instalación y ejecución desde cero

Sigue estos pasos para levantar el backend en una máquina nueva:

### 4.1. Prerrequisitos

1. Instala **Node.js 20+** y **pnpm**:
   ```bash
   # pnpm (ejemplo con corepack)
   corepack enable
   corepack prepare pnpm@latest --activate
   ```
2. Instala y arranca **PostgreSQL 14+** y crea una base de datos vacía:
   ```bash
   # ejemplo con psql
   createdb sistekpro_db
   ```
   (o bien deja que TypeORM la use si el usuario/BD ya existen).

### 4.2. Clonar e instalar

```bash
git clone <repo-url> sistekpro-backend
cd sistekpro-backend
pnpm install
```

### 4.3. Configurar el entorno

Crea el `.env` siguiendo la [sección 3](#3-configuración-variables-de-entorno) con los datos de tu instancia de PostgreSQL y tus propios secretos.

### 4.4. Crear los usuarios iniciales (seed)

La API **no expone endpoints de registro**. Los usuarios solo se crean por el script de seed interno (`src/database/seed.ts`). Ejecuta:

```bash
pnpm run seed
```

Esto crea los usuarios `admin` y `mantenimiento` (con las contraseñas definidas en `SEED_ADMIN_PASSWORD` / `SEED_MANTENIMIENTO_PASSWORD` o valores por defecto).

### 4.5. Ejecutar

```bash
# desarrollo (watch mode)
pnpm run start:dev

# producción
pnpm run build && pnpm run start:prod
```

> **Nota sobre la base de datos:** al arrancar, TypeORM crea/sincroniza las tablas automáticamente (`synchronize: true`). Esto es conveniente para desarrollo, pero **no se recomienda en producción** (ver [sección 9](#9-conexión-a-la-base-de-datos)).

### 4.6. Scripts disponibles (`package.json`)

| Script | Descripción |
|---|---|
| `pnpm run build` | Compila con `nest build` a `dist/` |
| `pnpm run start` | Arranca en modo normal |
| `pnpm run start:dev` | Arranca con watch (desarrollo) |
| `pnpm run start:prod` | Ejecuta `node dist/main` (producción) |
| `pnpm run seed` | Crea usuarios iniciales admin/mantenimiento |
| `pnpm run lint` | Lint con ESLint (`--fix`) |
| `pnpm run test` | Tests unitarios (Jest) |
| `pnpm run test:watch` | Tests unitarios en modo watch |
| `pnpm run test:cov` | Tests con cobertura |
| `pnpm run test:e2e` | Tests end-to-end |

---

## 5. Punto de entrada de la aplicación

El archivo principal es **`src/main.ts`**. La función `bootstrap()` (`main.ts:7-29`) realiza:

1. `NestFactory.create(AppModule, { bufferLogs: true })` — instancia la app a partir del módulo raíz (`main.ts:8`).
2. `app.use(helmet())` — middleware de seguridad de cabeceras (`main.ts:10`).
3. Habilita **CORS** leyendo `ConfigService` y usando `CORS_ORIGIN` (separado por comas) (`main.ts:12-19`).
4. `app.listen(port)` — arranca el servidor en `PORT` (default 3000) (`main.ts:21-23`).
5. Log de arranque con `Logger` (`main.ts:25-28`).

No se usa `setGlobalPrefix`, por lo que cada controlador define su propio prefijo con `@Controller('...')`.

---

## 6. Comunicación entre capas

NestJS organiza el código por **módulos**, y dentro de cada módulo por **Controlador → Servicio → Repositorio (TypeORM) → Entidad**.

- **Controllers** (`*.controller.ts`): reciben la petición HTTP, aplican decoradores de ruta/validación y delegan en el servicio.
- **Services / Providers** (`*.service.ts`): contienen la lógica de negocio y acceden a los datos. Se marcan con `@Injectable()` y reciben el repositorio vía `@InjectRepository(Entidad)` (inyección de dependencias).
- **Entities** (`entities/*.entity.ts`): clases decoradas con `@Entity()` que mapean tablas de PostgreSQL.
- **DTOs** (`dto/*.dto.ts`): objetos de transferencia validados con `class-validator`.
- **Module** (`*.module.ts`): declara `imports`, `controllers`, `providers`, `exports`.

No hay una carpeta `repositories/` explícita; se usa la inyección del `Repository<T>` de TypeORM directamente en los servicios (patrón Repository provisto por el ORM).

**Inyección entre módulos:**
- `UsersModule` exporta `UsersService` para que `AuthModule` lo consuma (`users.module.ts`).
- `OrdenesModule` importa `FichaTecnicaModule` porque usa `FichaTecnicaService.findByIds(...)` (`ordenes.module.ts`, usado en `ordenes.service.ts`).

---

## 7. Flujo de datos (ciclo de vida de una petición)

Para una ruta **protegida** (ej. `POST /ficha-tecnica`):

1. **Middleware:** `helmet` (seguridad de cabeceras) — `main.ts:10`.
2. **Global pipes:** `ValidationPipe` global con `whitelist` + `forbidNonWhitelisted` + `transform` (`app.module.ts`) valida/serializa el body contra el DTO.
3. **Guards globales** (en orden de registro en `app.module.ts`):
   - `ThrottlerGuard` — rate limit global (100 req / 60s por IP).
   - `ApiKeyGuard` — exige el header `x-api-key` (`common/guards/api-key.guard.ts`). Si la ruta es `@Public()`, se salta.
   - `JwtAuthGuard` — extrae `Authorization: Bearer <token>`, lo verifica con `JWT_SECRET` y coloca el payload en `request.user` (`common/guards/jwt-auth.guard.ts`). También respeta `@Public()`.
   - `RolesGuard` — lee los roles requeridos del decorador `@Roles(...)` vía `Reflector` y los compara con `request.user.role` (`common/guards/roles.guard.ts`). Lanza `ForbiddenException` si no coinciden.
4. **Controller:** recibe el DTO ya validado y llama al servicio.
5. **Service:** aplica la lógica de negocio, construye la entidad y la persiste con `Repository.save()`.
6. **Repositorio / ORM:** TypeORM traduce a SQL sobre PostgreSQL (`pg`).
7. **Respuesta:** el objeto/entidad se serializa a JSON y se envía.
8. **Manejo de errores:** si algo falla, `AllExceptionsFilter` (`common/filters/all-exceptions.filter.ts`) captura la excepción y devuelve un cuerpo uniforme `{ statusCode, error, message, path, method, timestamp }`, con manejo especial del código de violación de unicidad de Postgres `23505`.

**Rutas públicas** (decoradas con `@Public()`): `GET /` (raíz), `POST /auth/login` y `GET /seguimiento/:codigo`. En ellas, `ApiKeyGuard` y `JwtAuthGuard` devuelven `true` inmediatamente.

---

## 8. Autenticación

Mecanismo **híbrido**: **API Key global + JWT Bearer**, con **roles/permisos** y rate limiting.

- **API Key global (header `x-api-key`):** `ApiKeyGuard` (`common/guards/api-key.guard.ts`) compara el header con `API_KEY` del `.env`; si falta o es erróneo → `UnauthorizedException`.
- **JWT (login):** `POST /auth/login` (con throttle más estricto, 10 req / 60s). `AuthService.login()` busca al usuario por nombre (incluyendo el password con `addSelect`), compara con `bcrypt.compare()` y, si es válido, firma un token.
  - **Payload del JWT** (`common/interfaces/jwt-payload.interface.ts`): `{ sub, name, role, iat, exp }`.
  - El token se genera con `JwtModule` configurado globalmente (`secret = JWT_SECRET`, `expiresIn = JWT_EXPIRATION`, default `10h`).
- **Verificación por petición:** `JwtAuthGuard` verifica el token en cada ruta protegida y lo decodifica con `JWT_SECRET`, adjuntando `request.user`.
- **Roles/permisos:** enum `ROLE = admin | mantenimiento` (`users/enums/ROLE.enum.ts`). Decorador `@Roles(...)` + `RolesGuard`. Ejemplos:
  - `/users` → solo `@Roles(ROLE.admin)`.
  - `/ordenes` → `@Roles(ROLE.admin, ROLE.mantenimiento)`.
  - `/auth/profile` y `/ficha-tecnica` → cualquier usuario autenticado (sin restricción de rol).
- **Decorador `@GetUser()`:** extrae el usuario del request en los handlers.
- **Rate limiting:** `ThrottlerModule` global (100 req / 60s por IP); login limitado a 10 req / 60s.

Las contraseñas se hashean con **bcrypt** (rondas = 10).

---

## 9. Conexión a la base de datos

- **ORM:** TypeORM (`typeorm`, `@nestjs/typeorm`). Driver: `pg` (PostgreSQL).
- **Configuración de conexión:** `TypeOrmModule.forRootAsync` en `app.module.ts`. Parámetros desde `ConfigService`: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_SSL`. Opciones clave:
  - `type: 'postgres'`
  - `ssl: { rejectUnauthorized: false }` solo si `DB_SSL === 'true'`.
  - `autoLoadEntities: true` — registra automáticamente las entidades de los `forFeature`.
  - `synchronize: true` — **crea/actualiza tablas automáticamente desde las entidades**. ⚠️ Solo apto para desarrollo.
- **Migraciones:** **NO existen** en el proyecto. El esquema se mantiene por `synchronize: true`, no por migraciones versionadas. Para producción se recomienda migrar a migraciones explícitas de TypeORM.
- **Esquema (entidades → tablas):**
  - `users` ← `User` (`users/entities/user.entity.ts`): `id` (uuid PK), `name` (único), `password` (`select: false`), `role` (enum), `createdAt`, `updatedAt`.
  - `ficha_tecnica` ← `FichaTecnica` (`ficha_tecnica/entities/ficha_tecnica.entity.ts`): campos técnicos del equipo; `serialEquipo` único + indexado; `tiempoGarantiaMeses`, `fechaAdquisicion` (base del cálculo de garantía).
  - `ordenes_servicio` ← `OrdenServicio` (`ordenes/entities/orden-servicio.entity.ts`): `codigo` único+indexado (ej. `STK-XXXX`), `fichaTecnicaId` vía `@ManyToMany(() => FichaTecnica) @JoinTable()`, `fallaReportada`, `estado` (enum), fechas de ingreso/entrega.
  - `seguimiento_eventos` ← `SeguimientoEvento` (`ordenes/entities/seguimiento-evento.entity.ts`): `@ManyToOne(() => OrdenServicio, { onDelete: 'CASCADE' })`, `titulo`, `descripcion`, `createdAt`.
- **Seed de datos:** `src/database/seed.ts` crea los usuarios iniciales `admin` y `mantenimiento` (contraseñas desde `SEED_ADMIN_PASSWORD` / `SEED_MANTENIMIENTO_PASSWORD` del `.env`, o valores por defecto). Se ejecuta con `pnpm run seed`. No hay endpoint de registro de usuarios.

---

## 10. Archivos más importantes

| Archivo | Descripción |
|---|---|
| `src/main.ts` | Arranque de la app: helmet, CORS, listen. |
| `src/app.module.ts` | Módulo raíz: configura DB (TypeORM), Throttler, JWT, guards globales, ValidationPipe y filtro de excepciones. |
| `src/config/env.validation.ts` | Valida todas las variables de entorno al iniciar. |
| `src/common/guards/api-key.guard.ts` | Guard global que exige el header `x-api-key`. |
| `src/common/guards/jwt-auth.guard.ts` | Guard que verifica el JWT Bearer y puebla `request.user`. |
| `src/common/guards/roles.guard.ts` | Guard que aplica la autorización por roles (`@Roles`). |
| `src/common/decorators/{public,roles,get-user}.decorator.ts` | Metadata para rutas públicas, roles requeridos y extracción del usuario. |
| `src/common/filters/all-exceptions.filter.ts` | Filtro global de excepciones: respuesta de error uniforme + manejo de violación de unicidad Postgres. |
| `src/auth/auth.controller.ts` / `auth.service.ts` | Login (emite JWT) y perfil. |
| `src/users/users.service.ts` | Lógica de usuarios: find, update (re-hashea password), remove; `findByNameWithPassword` expone el hash solo para login. |
| `src/users/entities/user.entity.ts` | Entidad `User` (base de auth/roles). |
| `src/ficha_tecnica/ficha_tecnica.service.ts` | CRUD de fichas + cálculo de estado de garantía. |
| `src/ficha_tecnica/entities/ficha_tecnica.entity.ts` | Esquema de la "hoja de vida" del equipo. |
| `src/ordenes/ordenes.service.ts` | Lógica de órdenes: crear con código único (`STK-`), agregar fichas, cambiar estado (genera eventos de timeline) y `getSeguimiento` público. |
| `src/ordenes/ordenes.controller.ts` / `seguimiento.controller.ts` | Endpoints de órdenes (protegidos) y seguimiento por código (público). |
| `src/ordenes/entities/orden-servicio.entity.ts` | Orden de servicio (relación ManyToMany con FichaTecnica). |
| `src/ordenes/entities/seguimiento-evento.entity.ts` | Eventos/historial de la orden (cascade). |
| `src/database/seed.ts` | Carga inicial de usuarios admin/mantenimiento. |
| `API.md` | Documentación de endpoints (headers, payloads, ejemplos) para el frontend. |

---

## 11. Patrones de diseño utilizados

- **Modular (NestJS):** cada dominio es un `@Module` con `imports/controllers/providers/exports`.
- **Inyección de dependencias (IoC):** constructor injection en servicios (`@Injectable()`, `@InjectRepository`, inyección de `JwtService`, `ConfigService`, `UsersService`, etc.).
- **Repository pattern (vía TypeORM):** los servicios usan `Repository<T>` en lugar de escribir SQL.
- **MVC / arquitectura por capas:** Controller (HTTP) → Service (lógica) → Repository/Entity (datos).
- **Guard / Middleware (cadena de responsabilidad):** `ThrottlerGuard → ApiKeyGuard → JwtAuthGuard → RolesGuard`, más el middleware `helmet`.
- **Decorator pattern:** `@Public()`, `@Roles(...)`, `@GetUser()`, `@Controller()`, `@Column()`, etc.
- **Interceptor / Filter (manejo transversal):** `AllExceptionsFilter` global y `ValidationPipe` global.
- **DTO + Validation:** `class-validator`/`class-transformer` para validar y sanear entradas; `PartialType` para DTOs de update.
- **Factory (config async):** `forRootAsync` / `registerAsync` con `useFactory` + `inject` para construir DB/JWT/Throttler a partir de `ConfigService`.
- **Value Object / Enum:** `ROLE`, `TIPO_EQUIPO`, `ORDEN_ESTADO` como enums tipados.
- **Relaciones ORM:** `ManyToMany` + `@JoinTable` (Orden↔Ficha) y `ManyToOne` con `onDelete: CASCADE` (Evento→Orden).

---

## 12. Documentación de la API

Toda la información para consumir la API (endpoints, headers de autenticación, payloads y ejemplos) está en [`API.md`](./API.md). Ese documento está pensado para conectar el frontend con el backend.

Resumen rápido:

| Recurso | Descripción |
|---|---|
| `POST /auth/login` | Login con JWT (público) |
| `/users` | Gestión de usuarios (solo rol admin; sin creación: los usuarios se crean por seed interno) |
| `/ficha-tecnica` | CRUD de hojas de vida de equipos + consulta de garantía |
| `/ordenes` | Órdenes de servicio con estados y timeline (admin/mantenimiento) |
| `/seguimiento/:codigo` | Progreso público que consulta el QR del ticket del cliente |

Todas las rutas requieren el header `x-api-key`; las protegidas además `Authorization: Bearer <token>`.

---

## 13. Estructura del proyecto

```
sistekpro-backend/
├── .env                      # variables de entorno (no versionado con secretos reales)
├── README.md                 # este documento
├── API.md                    # documentación de endpoints para el frontend
├── nest-cli.json             # config del CLI de Nest
├── tsconfig.json / tsconfig.build.json
├── eslint.config.mjs / .prettierrc
├── docs/                     # prompts de ayuda y PDF de ejemplo
├── test/                     # pruebas e2e
└── src/
    ├── main.ts               # arranque de la app (bootstrap)
    ├── app.module.ts         # módulo raíz (ensambla todo)
    ├── app.controller.ts/.service.ts  # endpoint raíz "/"
    ├── config/               # validación de entorno (env.validation.ts)
    ├── common/               # guards, decoradores, filtros e interfaces (transversal)
    │   ├── guards/           # api-key, jwt-auth, roles
    │   ├── decorators/       # public, roles, get-user
    │   ├── filters/          # all-exceptions.filter.ts
    │   └── interfaces/       # jwt-payload, authenticated-request
    ├── auth/                 # login + profile
    ├── users/                # gestión de usuarios (solo admin)
    ├── ficha_tecnica/        # hojas de vida de equipos
    ├── ordenes/              # órdenes de servicio + seguimiento público
    └── database/             # seed.ts (carga de usuarios iniciales)
```

Los usuarios se crean únicamente mediante el script de seed interno (`src/database/seed.ts`); la API no expone endpoints de registro ni creación de usuarios.

---

## 14. Seguridad

- **API Key global**: header `x-api-key` en todas las rutas.
- **JWT**: firmado con `JWT_SECRET`, expira según `JWT_EXPIRATION`.
- **Roles**: `admin` y `mantenimiento`; `/users` es exclusivo de `admin`.
- **Rate limiting**: 100 req/min por IP (global); límites más estrictos en login.
- **bcrypt** para contraseñas y validación global de DTOs con `class-validator`.
- **helmet** para cabeceras HTTP seguras.

---

## 15. Pruebas

```bash
pnpm run test         # unit tests
pnpm run test:watch   # unit tests en watch
pnpm run test:cov     # cobertura
pnpm run test:e2e     # e2e
```

---

## 16. Orden de estudio recomendado

Para entender el proyecto de forma progresiva:

1. **`README.md` y `API.md`** — visión general, variables de entorno y mapa de endpoints.
2. **`package.json` + `tsconfig.json` + `nest-cli.json`** — stack, scripts y configuración de build.
3. **`src/main.ts`** — cómo arranca la app (helmet, CORS, listen).
4. **`src/config/env.validation.ts`** — qué variables son obligatorias y cómo se validan.
5. **`src/app.module.ts`** — el "plano" del sistema: qué módulos se importan y qué guards/pipes/filtros son globales (clave para entender la seguridad).
6. **`src/common/`** (en este orden): `interfaces/jwt-payload` → `decorators/*` → `guards/*` → `filters/all-exceptions.filter.ts` — la capa transversal de seguridad y errores.
7. **`src/users/`** — la entidad `User`, el `UsersService` (incluido `findByNameWithPassword`) y el controlador restringido por rol. Es la base de la autenticación.
8. **`src/auth/`** — `auth.service.ts` (login, bcrypt, firma JWT) y `auth.controller.ts` (login/profile). Cierra el ciclo de auth.
9. **`src/ficha_tecnica/`** — un CRUD completo y sencillo, con cálculo de garantía; buen ejemplo del patrón Service+Repository.
10. **`src/ordenes/`** — el módulo más complejo: relación `ManyToMany` con `FichaTecnica`, generación de código único (`STK-`), timeline de eventos (`SeguimientoEvento`) y el controlador **público** `seguimiento.controller.ts` que expone el seguimiento por QR.
11. **`src/database/seed.ts`** — cómo se crean los usuarios iniciales.
12. **Pruebas** (`test/app.e2e-spec.ts`, `src/users/*.spec.ts`, `src/ordenes/ordenes.service.spec.ts`) — comportamientos esperados y casos límite.
13. **`docs/`** — contexto de integración con el frontend y detalles de bugs resueltos.

> Consejo: como la base de datos usa `synchronize: true` (sin migraciones), cualquier cambio en una entidad se refleja automáticamente en las tablas al reiniciar — ideal para aprender, pero mantente consciente de ello antes de pasar a producción (donde se recomienda migraciones explícitas).
