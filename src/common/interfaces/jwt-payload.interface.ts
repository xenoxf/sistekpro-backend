import { ROLE } from 'src/users/enums/ROLE.enum';

export interface JwtPayload {
  sub: string;
  name: string;
  role: ROLE;
  iat?: number;
  exp?: number;
}
