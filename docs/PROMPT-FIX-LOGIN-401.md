# Prompt para agente IA — Fix error 401 en `POST /auth/login`

> Contexto para copiar y pegar al agente que depure el frontend.

---

## PROMPT

Estoy integrando el frontend de SistekPro con el backend desplegado en
`https://sistekpro-backend.onrender.com`. Al hacer login me responde:

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Credenciales inválidas",
  "path": "/auth/login",
  "method": "POST",
  "timestamp": "2026-08-25T20:35:26.933Z"
}
```

Datos de la petición fallida:

```
Request URL:  https://sistekpro-backend.onrender.com/auth/login
Method:       POST
Origin:       https://sistekpro.vercel.app
x-api-key:    <API_KEY enviada por el frontend>
Body:         { "name": "admin", "password": "Admin-ZxMm4mbsvp|KDdN5jPwZLy" }
```

### 1. Qué significa el error (diagnóstico correcto)

- El mensaje **"Credenciales inválidas"** lo lanza ÚNICAMENTE el backend en
  `AuthService.login` cuando el usuario no existe en la BD o el password no
  coincide con el hash bcrypt.
- NO es un problema del `x-api-key`: si la API key estuviera mal, el guard
  respondería otro mensaje distinto ("API key inválida o faltante...").
- Por lo tanto: **la petición llega bien al backend; el problema son las
  credenciales enviadas**.

### 2. Causa raíz encontrada

La contraseña que envió el frontend está **mal transcrita**. Compárenla:

```
Enviada (frontend): Admin-ZxMm4mbsvp|KDdN5jPwZLy   (28 chars)
Correcta (backend): Admin-ZxMm4mbsvpIKTDdN5jPwZly  (29 chars)
                          ↑ posición 17        ↑ final
```

Tres errores de copiado/OCR/teclado:
1. `|` (pipe) donde va `I` mayúscula (posición 17).
2. Falta la letra `T` después de esa `I`.
3. `L` mayúscula donde va `l` minúscula al final.

Esto pasa típico al copiar desde fuentes con tipografía confusa
(`I` / `l` / `1` / `|`). La solución NO es tocar el backend ni resetear el
usuario: es corregir el valor que se envía.

### 3. Cómo solucionarlo (en orden)

1. **Corregir la credencial en el frontend:** actualizar el password usado en
   el login (variable de entorno, constante o formulario) por el valor exacto:
   `Admin-ZxMm4mbsvpIKTDdN5jPwZly`.
   - Si el password viene de un `.env` del frontend (p. ej. Vercel), editar la
     variable allí y redesplegar.
   - Verifica longitud: debe tener exactamente **29 caracteres**.
2. **Validar antes de asumir:** probar el login directo contra el backend sin
   pasar por la UI, para aislar si el problema es del valor enviado:

   ```bash
   curl -X POST https://sistekpro-backend.onrender.com/auth/login \
     -H "Content-Type: application/json" \
     -H "x-api-key: $API_KEY" \
     -d '{"name":"admin","password":"Admin-ZxMm4mbsvpIKTDdN5jPwZly"}'
   ```

   Respuesta esperada: `200` con `{ token, user: { id, name, role } }`.
3. **Si el curl también diera 401** (no debería), entonces revisar el backend:
   confirmar que las variables `DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME` del
   servicio en Render apunten a la MISMA base de datos donde se ejecutó el
   seed (`src/database/seed.ts`) y que los usuarios `admin` y `mantenimiento`
   existan ahí. Si no existen, ejecutar el seed contra esa BD.
4. **Prevención en UI:** en el formulario de login usar `type="password"` con
   opción "mostrar contraseña", y pegar credenciales con un solo paste (nunca
   tipearlas a mano); los caracteres `I l 1 | O 0` se confunden fácilmente.

### Restricciones

- No modificar el backend ni sus endpoints.
- No hashear/re-hashear passwords en el frontend.
- No guardar la contraseña en localStorage; solo el token y el usuario.
