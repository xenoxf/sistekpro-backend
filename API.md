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

## 5. Órdenes de servicio `/ordenes` y seguimiento público

Gestión del proceso de reparación de equipos. Cada orden genera un **código único** (ej: `STK-A7X9K2QFRT4M`) que se imprime como QR en el ticket/factura del cliente; al escanearlo, el cliente ve el progreso de su equipo en tiempo real.

### 5.1. Flujo del QR

```
1. Staff crea la orden → POST /ordenes → responde { codigo, trackingUrl }
2. El frontend imprime en el ticket un QR que codifica trackingUrl
3. El cliente escanea → abre la página pública del frontend
4. La página llama a GET /seguimiento/:codigo (solo header x-api-key)
5. El cliente ve estado actual + línea de tiempo del progreso
```

La variable `TRACKING_URL_BASE` del `.env` define la URL base (ej: `https://sistek.com/seguimiento`). El código es aleatorio y no secuencial, por lo que no puede adivinarse.

### 5.2. Estados de una orden

| Estado | Significado |
|---|---|
| `recibido` | Equipo recibido en el taller (estado inicial) |
| `diagnostico` | En revisión/diagnóstico |
| `reparacion` | En proceso de reparación |
| `esperando_repuestos` | Detenida a la espera de repuestos |
| `terminado` | Reparación finalizada, listo para entrega |
| `entregado` | Entregado al cliente (cierra la orden) |
| `cancelado` | Orden cancelada |

Cada cambio de estado registra automáticamente un evento en la línea de tiempo.

### 5.3. Crear orden de servicio

Requiere JWT con rol `admin` o `mantenimiento`.

```http
POST /ordenes
```

Body:

```json
{
  "fichaTecnicaId": "uuid-de-la-ficha-tecnica-del-equipo",
  "fallaReportada": "El equipo no enciende tras un corte de luz",
  "fechaEntregaEstimada": "2026-09-01"
}
```

- `fichaTecnicaId` es **obligatorio**: la orden siempre está vinculada a una ficha técnica registrada (`404` si no existe).
- `fechaEntregaEstimada` es opcional.

Respuesta `201`:

```json
{
  "id": "uuid",
  "codigo": "STK-A7X9K2QFRT4M",
  "trackingUrl": "https://sistek.com/seguimiento/STK-A7X9K2QFRT4M",
  "fichaTecnicaId": "uuid",
  "fallaReportada": "El equipo no enciende tras un corte de luz",
  "estado": "recibido",
  "fechaIngreso": "2026-08-25T20:00:00.000Z",
  "fechaEntregaEstimada": "2026-09-01T00:00:00.000Z",
  "fechaEntregaReal": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

> `trackingUrl` es la cadena exacta para codificar en el QR del ticket.

### 5.4. Listar órdenes

```http
GET /ordenes?estado=reparacion
```

Filtro opcional `estado` (ver tabla 5.2). Respuesta `200`: array con la ficha técnica incluida, de más recientes a más antiguas.

### 5.5. Detalle, edición y eliminación

```http
GET /ordenes/:id
PATCH /ordenes/:id
DELETE /ordenes/:id
```

`PATCH` acepta campos opcionales: `fallaReportada`, `fechaEntregaEstimada`.

### 5.6. Cambiar estado de una orden

```http
PATCH /ordenes/:id/estado
```

Body:

```json
{
  "estado": "reparacion",
  "comentario": "Se cambió la fuente de poder"
}
```

`comentario` es opcional y queda registrado en el timeline. Al pasar a `entregado`, el backend registra `fechaEntregaReal` automáticamente. Respuesta `200`: orden actualizada.

### 5.7. Seguimiento público (lo que consulta el QR)

**No requiere JWT**, solo el header `x-api-key`. Pensado para ser consumido desde la página pública del frontend.

```http
GET /seguimiento/:codigo
```

Ejemplo: `GET /seguimiento/STK-A7X9K2QFRT4M`

Respuesta `200`:

```json
{
  "codigo": "STK-A7X9K2QFRT4M",
  "estado": "reparacion",
  "fechaIngreso": "2026-08-25T20:00:00.000Z",
  "fechaEntregaEstimada": "2026-09-01T00:00:00.000Z",
  "fechaEntregaReal": null,
  "trackingUrl": "https://sistek.com/seguimiento/STK-A7X9K2QFRT4M",
  "cliente": { "nombre": "Carlos Gómez" },
  "equipo": {
    "tipo": "portatil",
    "marca": "Lenovo",
    "modelo": "IdeaPad 3",
    "serial": "SN-LEN-2026-0001"
  },
  "eventos": [
    { "titulo": "Equipo recibido", "descripcion": "Orden creada...", "fecha": "..." },
    { "titulo": "Estado actualizado: diagnostico", "descripcion": null, "fecha": "..." },
    { "titulo": "Estado actualizado: reparacion", "descripcion": "Se cambió la fuente de poder", "fecha": "..." }
  ]
}
```

Errores: `404` si el código no existe. Los eventos vienen en orden cronológico ascendente para renderizar la línea de tiempo.

---

## 6. Resumen rápido de endpoints

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
| GET | `/ordenes?estado=` | API Key + JWT | admin/mantenimiento | Listar órdenes |
| GET | `/ordenes/:id` | API Key + JWT | admin/mantenimiento | Ver orden |
| POST | `/ordenes` | API Key + JWT | admin/mantenimiento | Crear orden (devuelve código + trackingUrl) |
| PATCH | `/ordenes/:id` | API Key + JWT | admin/mantenimiento | Editar datos de la orden |
| PATCH | `/ordenes/:id/estado` | API Key + JWT | admin/mantenimiento | Cambiar estado (+evento en timeline) |
| DELETE | `/ordenes/:id` | API Key + JWT | admin/mantenimiento | Eliminar orden |
| GET | `/seguimiento/:codigo` | **Solo API Key** | — (público) | Progreso para el QR del cliente |

## 7. Notas para la integración

1. **Flujo recomendado**: health check → login → guardar token → llamar rutas protegidas con ambos headers.
2. Manejar `401` centralmente: si el JWT expiró (error `UnauthorizedException`), redirigir al login.
3. Los errores de validación (`400`) traen `message` como array; iterarlo para mostrar cada mensaje.
4. Todas las fechas se envían en formato ISO (`YYYY-MM-DD` o completo) y se reciben como ISO 8601 UTC.
5. IDs son UUID v4: validar en cliente antes de navegar a rutas `/recurso/:id`.
6. CORS habilitado solo para los orígenes configurados en `CORS_ORIGIN` del `.env`.
