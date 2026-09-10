import { IsEmail, IsIn, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 80)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Length(5, 120)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(7, 30)
  numero: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'mantenimiento',
    'redes',
    'cableado',
    'configuracion',
    'soporte',
    'wifi',
    'otro',
  ])
  servicio: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 2000)
  message: string;
}
