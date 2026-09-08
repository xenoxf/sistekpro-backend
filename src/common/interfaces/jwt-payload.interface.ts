import { ROLE } from 'src/users/enums/ROLE.enum';

export interface JwtPayload {
  sub: string;
  name: string;
  role: ROLE;
  departamentoId?: string | null;
  departamentoNombre?: string | null;
  iat?: number;
  exp?: number;
}
