import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

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
  @IsEmail()
  @Length(0, 120)
  correo_cliente?: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  telefono?: string;

  @IsOptional()
  @IsString()
  @Length(0, 150)
  dir?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  tipo_cliente?: string;
}
