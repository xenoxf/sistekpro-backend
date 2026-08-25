# Prompt para agente IA — Actualización de frontend (roles y auth)

> Este documento es para un **agente IA** (u otro desarrollador) que trabaja en el
> frontend de SistekPro. Describe lo que cambió en el backend recientemente y que
> NO estaba cubierto por la versión anterior de `API.md`. Al final está el prompt
> listo para copiar y pegar.

---

## Contexto: qué cambió en el backend

1. **Ya no existe registro público.**
   - Se eliminó `POST /auth/register`.
   - La única forma de autenticarse es `POST /auth/login`.
   - Los usuarios ya NO se crean desde la API: tampoco existe `POST /users`.
     Los usuarios los crea el backend internamente con un script de seed.

2. **Existen exactamente dos roles:**
   - `admin`: acceso total. Único rol que puede usar `/users`
     (listar, ver, editar, eliminar usuarios).
   - `mantenimiento`: solo puede usar todo lo de `/ficha-tecnica`
     (CRUD completo + garantía). Cualquier ruta de `/users` le responde `403`.

3. **El login devuelve el rol** en la respuesta y también viaja dentro del JWT:

   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": { "id": "uuid", "name": "admin", "role": "admin" }
   }
   ```

4. **Reglas de headers (sin cambios, pero crítico):**
   - TODAS las rutas requieren `x-api-key: <API_KEY>` (variable del `.env` del backend).
   - Las rutas protegidas requieren además `Authorization: Bearer <token>`.
   - El token expira en **10 horas** → manejar `401` centralmente.

5. **Gestión de usuarios ahora es read/edit/delete (nunca create):**
   - `GET /users`, `GET /users/:id` → solo `admin`.
   - `PATCH /users/:id` (name, password, role opcionales) → solo `admin`.
   - `DELETE /users/:id` → solo `admin`.
   - No hay endpoint de creación ni lo habrá: no diseñar UI para crear usuarios.

---

## PROMPT (copiar y pegar al agente)

Actúa como desarrollador frontend senior. Actualiza la aplicación frontend de
SistekPro para soportar el nuevo modelo de autenticación y roles del backend.
No inventes endpoints; usa EXACTAMENTE los descritos aquí.

### Requisitos

1. **Autenticación solo con login**
   - Elimina cualquier pantalla/lógica de registro (`register`). Ya no existe.
   - Pantalla de login que haga `POST /auth/login` con `{ "name", "password" }`
     y el header `x-api-key`.
   - Guarda en memoria/localStorage: `token`, `user.id`, `user.name`,
     `user.role` (`"admin"` | `"mantenimiento"`).
   - Si las credenciales son inválidas el backend responde `401`; muestra
     "Credenciales inválidas".

2. **Control de acceso por rol (lo más importante)**
   - Rol `admin`: acceso a todo (fichas técnicas + gestión de usuarios).
   - Rol `mantenimiento`: SOLO módulo de fichas técnicas. Oculta/bloquea
     rutas, menús y botones de usuarios para este rol.
   - Implementa route guards: si `user.role !== "admin"`, redirige a fichas
     técnicas (no a un error) cuando intente entrar a `/users`.
   - El backend igual responde `403` a `mantenimiento` en `/users`; captura ese
     código globalmente y muestra "No tienes permisos para acceder a este recurso".

3. **Módulo de gestión de usuarios (solo visible para `admin`)**
   - Lista de usuarios: `GET /users` (campos: `id`, `name`, `role`,
     `createdAt`, `updatedAt`; la contraseña NUNCA viene en la respuesta).
   - Detalle: `GET /users/:id` (valida UUID en cliente antes de navegar).
   - Edición: `PATCH /users/:id` con body parcial
     `{ name?, password?, role? }` — todos opcionales.
   - Eliminar: `DELETE /users/:id` con confirmación previa
     (mensaje de éxito: "Usuario eliminado correctamente").
   - IMPORTANTE: NO implementes creación de usuarios. El backend no lo permite;
     los usuarios se crean por seed interno del backend.

4. **Manejo global de errores y sesión**
   - Interceptor/fetch wrapper que agregue siempre `x-api-key` y, si hay sesión,
     `Authorization: Bearer <token>`.
   - `401` → sesión expirada/inválida: limpiar storage y redirigir a login.
     (El token expira en 10 horas.)
   - `400` → el campo `message` llega como ARRAY de mensajes de validación;
     iterarlo y mostrarlos todos.
   - `403` → falta de permisos por rol.
   - `409` → conflicto de nombre duplicado (al editar usuario).

5. **Fichas técnicas (sin cambios de permisos)**
   - Ambos roles tienen CRUD completo en `/ficha-tecnica` (+ `GET :id/garantia`).
   - Filtros de lista: query params `serial` y `tipoEquipo`.

6. **Calidad**
   - Tipa las respuestas según los ejemplos de `API.md`.
   - Centraliza la llamada al rol: un solo lugar decide qué puede ver cada rol,
     idealmente leyendo `user.role` del estado de sesión.
   - No dejes ninguna referencia muerta a `auth/register` ni a `POST /users`.

### Definición de listo

- Un usuario `mantenimiento` nunca ve rutas de usuarios y si las fuerza por URL
  es redirigido, sin ver errores crudos.
- Un usuario `admin` gestiona usuarios sin opción de crearlos.
- La sesión expira limpiamente tras 10h con redirección a login.
- No queda ningún flujo de registro en el código.
