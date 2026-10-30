/**
 * Servicios que se pueden pedir desde el formulario de contacto público y el
 * departamento que los atiende.
 *
 * La clave del departamento es la misma que se usa como rol de usuario
 * (`common/utils/normalize-key.util`), así un usuario con rol "informatica"
 * solo consulta los formularios cuyo servicio pertenece a Informática.
 *
 * `null` significa "sin departamento asignado": esos formularios solo los ve
 * administración y gerencia.
 */
export const SERVICIO_DEPARTAMENTO: Record<string, string | null> = {
  mantenimiento: 'mantenimiento',
  redes: 'redes',
  cableado: 'redes',
  configuracion: 'redes',
  wifi: 'redes',
  'redes-datos': 'redes',
  soporte: 'mantenimiento',
  remoto: 'mantenimiento',
  web: 'informatica',
  capacitacion: 'capacitacion',
  marketing: 'marketing',
  otro: null,
};

/** Servicios aceptados por POST /leads. */
export const SERVICIOS_LEAD: string[] = Object.keys(SERVICIO_DEPARTAMENTO);

/** Departamento (clave) responsable de un servicio del formulario. */
export function departamentoDelServicio(servicio: string): string | null {
  return SERVICIO_DEPARTAMENTO[servicio] ?? null;
}
