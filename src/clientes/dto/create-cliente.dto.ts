import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 80)
  nombre_cliente: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 80)
  apellido_cliente: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEmail()
  @Length(0, 120)
  correo_cliente?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @Length(0, 30)
  telefono?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @Length(0, 150)
  dir?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @Length(0, 50)
  tipo_cliente?: string;
}
