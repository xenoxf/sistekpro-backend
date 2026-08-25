# API Sistek — Documentación para Frontend

Documentación de referencia para conectar el frontend con el backend (NestJS + PostgreSQL).
 (Cuando se hable de datos importantes simplemnete escribe sus variables .env en el .env ya que yo escribire sus valores yo mismo)
---

## 1. Información general

| Concepto | Valor |
|---|---|
| Base URL (dev) | `https://sistekpro-backend.onrender.com` |
| Formato de datos | JSON (`Content-Type: application/json`) |
| Autenticación | API Key global + JWT Bearer |
| Rate limiting | 100 peticiones / 60s por IP (global) |

### 1.1. Headers requeridos

**Todas** las rutas (públicas y protegidas) requieren la API Key:

```
x-api-key: <API_KEY>
```

Las rutas **protegidas** requieren además el token JWT emitido por `/auth/login`:

```
Authorization: Bearer <token>
```

Ejemplo de request completo:

```http
GET /users HTTP/1.1
Host: localhost:3000
x-api-key: sistekpro-dev-api-key-2026-x7Kp9mQ2vL
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

> El valor de `x-api-key` corresponde a la variable `API_KEY` del `.env` del backend.

### 1.2. Roles de usuario

| Rol | Acceso |
|---|---|
| `admin` | Todo, incluida gestión de usuarios (`/users`) |
| `mantenimiento` | Rutas generales (fichas técnicas) |

El rol viaja dentro del JWT (`role`) y es verificado automáticamente por el backend.

### 1.3. Formato de errores

Todos los errores devuelven el mismo cuerpo:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "mensaje legible o array de mensajes de validación",
  "path": "/ruta/llamada",
  "method": "POST",
  "timestamp": "2026-08-25T18:00:00.000Z"
}
```

Códigos más comunes:

| Código | Causa típica |
|---|---|
| `400` | Body inválido: falta campo, tipo incorrecto o propiedad no permitida (`message` es un **array**) |
| `401` | Falta `x-api-key`, API key incorrecta, JWT ausente/expirado o credenciales inválidas |
| `403` | El rol del usuario no tiene permisos sobre la ruta |
| `404` | Recurso no encontrado |
| `409` | Conflicto: nombre de usuario, serial de equipo u otro campo único ya existe |
| `429` | Límite de peticiones excedido (rate limit) |
| `500` | Error interno del servidor |

---

## 2. Endpoints públicos (no requieren JWT)

Solo requieren el header `x-api-key`.

### 2.1. Health check

```http
GET /
```

Respuesta `200`:

```json
"Hola Mundo!"
```

### 2.2. Login

Rate limit propio: **10 peticiones / minuto**.

```http
POST /auth/login
```

Body:

```json
{
  "name": "jperez",
  "password": "Clave*123"
}
```

Respuesta `200`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "jperez",
    "role": "admin"
  }
}
```

Errores: `401` si las credenciales son inválidas.

> Guardar `token` y `user.role` en el frontend para decidir a qué vistas puede acceder el usuario. El token expira en **10 horas**.

---

## 3. Usuarios `/users`

Requieren JWT con rol **`admin`**. Todos los endpoints de esta sección fallan con `403` para roles `mantenimiento`.

### 3.1. Listar usuarios

```http
GET /users
```

Respuesta `200`:

```json
[
  {
    "id": "uuid",
    "name": "jperez",
    "role": "mantenimiento",
    "createdAt": "2026-08-25T18:00:00.000Z",
    "updatedAt": "2026-08-25T18:00:00.000Z"
  }
]
```

> La contraseña nunca se devuelve en ninguna respuesta.

### 3.2. Obtener un usuario

```http
GET /users/:id
```

`:id` debe ser un UUID válido (si no, responde `400`).

> **Nota:** no existe endpoint para crear usuarios. Los usuarios se crean únicamente mediante el seed interno (`src/database/seed.ts`).

### 3.3. Actualizar usuario

```http
PATCH /users/:id
```

Body (todos los campos opcionales):

```json
{
  "name": "nombreEditado",
  "password": "Nueva*456",
  "role": "mantenimiento"
}
```

Si se envía `password` se re-hashea automáticamente. Respuesta `200` con el usuario actualizado.

### 3.4. Eliminar usuario

```http
DELETE /users/:id
```

Respuesta `200`:

```json
{ "message": "Usuario eliminado correctamente" }
```

### 3.5. Perfil del usuario autenticado

Requiere cualquier JWT válido (sin importar el rol):

```http
GET /auth/profile
```

Respuesta `200`: mismo formato que un objeto de usuario individual.

---

## 4. Fichas técnicas `/ficha-tecnica`

CRUD de hojas de vida de equipos de cómputo. Requieren `x-api-key` + JWT (cualquier rol).

### 4.1. Crear ficha técnica

```http
POST /ficha-tecnica
```

Body mínimo requerido:

```json
{
  "nombreCliente": "Carlos Gómez",
  "telefonoCliente": "3001234567",
  "direccionCliente": "Calle 10 #5-25",
  "correoCliente": "carlos@example.com",
  "servicio": "Mantenimiento preventivo",
  "tipoEquipo": "portatil",
  "nombreResponsable": "Juan Pérez",
  "marcaEquipo": "Lenovo",
  "modeloEquipo": "IdeaPad 3",
  "serialEquipo": "SN-LEN-2026-0001"
}
```

Campos opcionales (hardware y extras) que completan la hoja de vida:

```json
{
  "referencia": "15ITL05",
  "tiempoGarantiaMeses": 12,
  "fechaAdquisicion": "2025-06-15",
  "tipoMonitor": "LED integrado",
  "tamanoPantallaPulgadas": 15,
  "procesadorMarca": "Intel",
  "procesadorModelo": "Core i5-1135G7",
  "procesadorBits": "64",
  "nucleosCpu": 4,
  "velocidadProcesador": "2.4 GHz",
  "memoriaRamGb": 16,
  "cantidadDiscosDuros": 2,
  "tecnologiaDisco1": "SSD NVMe",
  "capacidadDisco1Gb": 512,
  "tecnologiaDisco2": "HDD",
  "capacidadDisco2Gb": 1024,
  "lectorDvdCd": false,
  "tarjetaVideoIntegrada": true,
  "tarjetaVideoIndependiente": false,
  "conectoresVga": 0,
  "puertosHdmi": 1,
  "puertosUsb": 4,
  "puertosPci": 0,
  "puertosPciExpress": 0,
  "tarjetaEthernet": true,
  "tarjetaRedInalambrica": true,
  "marcaMouse": "Logitech",
  "serialMouse": "MS-99887",
  "tipoConectorMouse": "USB inalámbrico",
  "observaciones": "Equipo en buen estado",
  "fechaRealizacion": "2026-08-25"
}
```

Valores válidos de `tipoEquipo`:

| Valor | Descripción |
|---|---|
| `cpu` | CPU / torre |
| `portatil` | Portátil |
| `escritorio` | Equipo de escritorio |
| `server` | Servidor |
| `todo_en_uno` | Todo en uno (All-in-One) |

Respuesta `201`: objeto completo de la ficha creada (incluye `id` UUID, `createdAt`, `updatedAt`). Errores: `409` si el `serialEquipo` ya existe.

### 4.2. Listar fichas técnicas

```http
GET /ficha-tecnica
```

Acepta filtros opcionales por query string (se pueden combinar):

| Parámetro | Tipo | Descripción |
|---|---|---|
| `serial` | string | Búsqueda parcial e insensible a mayúsculas por serial del equipo |
| `tipoEquipo` | enum | Filtra por tipo (`cpu`, `portatil`, `escritorio`, `server`, `todo_en_uno`) |

Ejemplos:

```http
GET /ficha-tecnica?serial=LEN
GET /ficha-tecnica?tipoEquipo=portatil
GET /ficha-tecnica?serial=ideapad&tipoEquipo=portatil
```

Errores: `400` si `tipoEquipo` no es un valor válido.

Respuesta `200`: array ordenado de más recientes a más antiguas.

### 4.3. Obtener ficha por id

```http
GET /ficha-tecnica/:id
```

`:id` debe ser UUID.

### 4.4. Consultar estado de garantía

```http
GET /ficha-tecnica/:id/garantia
```

Calcula si el equipo está vigente según `fechaAdquisicion + tiempoGarantiaMeses`. Respuesta `200`:

```json
{
  "tieneGarantia": true,
  "enGarantia": true,
  "venceEl": "2026-06-15T00:00:00.000Z",
  "diasRestantes": 295
}
```

- `tieneGarantia: false` cuando la ficha no tiene fecha de adquisición o meses de garantía.
- `diasRestantes` negativo significa garantía vencida (`enGarantia: false`).

### 4.5. Actualizar ficha técnica

```http
PATCH /ficha-tecnica/:id
```

Body: cualquier combinación de los campos anteriores (todos opcionales). Respuesta `200` con la ficha actualizada. Errores: `409` si se cambia el serial a uno existente.

### 4.6. Eliminar ficha técnica

```http
DELETE /ficha-tecnica/:id
```

Respuesta `200`:

```json
{ "message": "Ficha técnica eliminada correctamente" }
```

---

## 5. Resumen rápido de endpoints

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/` | API Key | — | Health check |
| POST | `/auth/login` | API Key | — | Login (devuelve token) |
| GET | `/auth/profile` | API Key + JWT | cualquiera | Perfil del token |
| GET | `/users` | API Key + JWT | admin | Listar usuarios |
| GET | `/users/:id` | API Key + JWT | admin | Ver usuario |
| PATCH | `/users/:id` | API Key + JWT | admin | Editar usuario |
| DELETE | `/users/:id` | API Key + JWT | admin | Eliminar usuario |
| GET | `/ficha-tecnica` | API Key + JWT | cualquiera | Listar fichas (filtros: `serial`, `tipoEquipo`) |
| GET | `/ficha-tecnica/:id` | API Key + JWT | cualquiera | Ver ficha |
| GET | `/ficha-tecnica/:id/garantia` | API Key + JWT | cualquiera | Estado de garantía |
| POST | `/ficha-tecnica` | API Key + JWT | cualquiera | Crear ficha |
| PATCH | `/ficha-tecnica/:id` | API Key + JWT | cualquiera | Editar ficha |
| DELETE | `/ficha-tecnica/:id` | API Key + JWT | cualquiera | Eliminar ficha |

## 6. Notas para la integración

1. **Flujo recomendado**: health check → login → guardar token → llamar rutas protegidas con ambos headers.
2. Manejar `401` centralmente: si el JWT expiró (error `UnauthorizedException`), redirigir al login.
3. Los errores de validación (`400`) traen `message` como array; iterarlo para mostrar cada mensaje.
4. Todas las fechas se envían en formato ISO (`YYYY-MM-DD` o completo) y se reciben como ISO 8601 UTC.
5. IDs son UUID v4: validar en cliente antes de navegar a rutas `/recurso/:id`.
6. CORS habilitado solo para los orígenes configurados en `CORS_ORIGIN` del `.env`.
