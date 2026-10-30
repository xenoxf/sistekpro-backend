import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROL_ADMIN } from 'src/users/enums/ROLE.enum';
import { normalizeKey } from 'src/common/utils/normalize-key.util';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Admin (root) tiene acceso total
    if (normalizeKey(request.user.role) === ROL_ADMIN) {
      return true;
    }

    const rolUsuario = normalizeKey(request.user.role);
    const departamentoUsuario = normalizeKey(request.user.departamentoNombre);

    const hasRole = requiredRoles.some((role) => {
      const requerido = normalizeKey(role);
      // Coincidencia directa por rol
      if (rolUsuario && rolUsuario === requerido) return true;
      // Coincidencia por departamento: si el usuario pertenece a un
      // departamento cuyo nombre equivale al rol requerido
      // (ej: departamento "Informática" => rol requerido "informatica")
      if (departamentoUsuario && departamentoUsuario === requerido) return true;
      return false;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso',
      );
    }

    return true;
  }
}
