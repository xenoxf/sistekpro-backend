import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateDepartamentoDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nombre_departamento: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  descripcion?: string;
}
