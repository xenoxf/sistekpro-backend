/**
 * Normaliza un nombre a una clave estable para compararlo sin depender de
 * tildes, mayúsculas ni espacios:
 *
 *   'Informática'  -> 'informatica'
 *   'Redes de datos' -> 'redes-de-datos'
 *   '  Mantenimiento ' -> 'mantenimiento'
 *
 * Se usa para igualar departamentos con roles de usuario y con los servicios
 * del formulario de contacto (ver `leads/servicio-departamento.ts`).
 */
export function normalizeKey(value?: string | null): string {
  if (!value) return '';

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
