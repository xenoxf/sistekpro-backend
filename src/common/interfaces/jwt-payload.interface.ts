export interface JwtPayload {
  sub: string;
  name: string;
  /** Clave del rol: 'admin', 'gerente' o la clave de un departamento. */
  role: string;
  departamentoId?: string | null;
  departamentoNombre?: string | null;
  iat?: number;
  exp?: number;
}
