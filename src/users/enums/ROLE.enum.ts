/**
 * Roles fijos del sistema y roles canónicos de los departamentos.
 *
 * El rol de un usuario no se limita a esta lista: también puede ser la clave
 * de cualquier departamento creado en la base de datos (p. ej. "ventas" o
 * "desarrollo-web"). El listado que se ofrece al crear un usuario se arma en
 * tiempo de ejecución a partir de los departamentos existentes.
 */
export enum ROLE {
  admin = 'admin',
  gerente = 'gerente',
  administracion = 'administracion',
  marketing = 'marketing',
  mantenimiento = 'mantenimiento',
  redes = 'redes',
  informatica = 'informatica',
  capacitacion = 'capacitacion',
}

/** Rol raíz: acceso total al sistema y no se crea ni se asigna desde la API. */
export const ROL_ADMIN: string = ROLE.admin;

/** Roles que no dependen de un departamento y siempre están disponibles. */
export const ROLES_FIJOS: string[] = [ROLE.gerente];

/** Roles reservados: no se crean ni se asignan desde la API. */
export const ROLES_RESERVADOS: string[] = [ROL_ADMIN];

/** Roles con visibilidad sobre todos los departamentos. */
export const ROLES_GLOBALES: string[] = [ROL_ADMIN, ROLE.gerente];
