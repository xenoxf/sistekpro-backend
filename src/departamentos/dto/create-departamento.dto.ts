import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDepartamentoDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nombre_departamento: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @Length(0, 1000)
  descripcion?: string;
}
