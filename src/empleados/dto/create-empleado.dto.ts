import { IsEmail, IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class CreateEmpleadoDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 80)
  nombre_empleado: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 80)
  apellido_empleado: string;

  @IsEmail()
  @Length(0, 120)
  correo_empleado: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 80)
  cargo: string;

  @IsUUID()
  @IsNotEmpty()
  id_departamento: string;
}
