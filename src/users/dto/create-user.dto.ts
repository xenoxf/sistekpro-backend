import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @Length(3, 50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(5, 50)
  @IsNotEmpty()
  password: string;

  /**
   * Clave de un departamento existente ('informatica', 'redes', ...) o de un
   * rol fijo ('gerente'). La validación contra los departamentos creados se
   * hace en el servicio, ya que son datos y no una enumeración de esquema.
   * Si se omite, se toma la clave del departamento elegido.
   */
  @IsString()
  @Length(1, 64)
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  role?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  departamentoId?: string;
}
