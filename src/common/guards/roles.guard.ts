import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE } from 'src/users/enums/ROLE.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Admin (root) tiene acceso total
    if (request.user.role === ROLE.admin) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => {
      // Coincidencia directa por role
      if (request.user!.role === role) return true;
      // Coincidencia por departamento: si el usuario pertenece a un departamento
      // cuyo nombre coincide con el rol requerido (ej: departamento "mantenimiento" => role "mantenimiento")
      const depNombre = request.user!.departamentoNombre?.toLowerCase().trim();
      if (depNombre && depNombre === String(role).toLowerCase().trim())
        return true;
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
