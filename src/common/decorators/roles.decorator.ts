import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Declara los roles que pueden ejecutar el handler: se comparan con el rol del
 * JWT y con la clave del departamento del usuario (ver RolesGuard).
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
