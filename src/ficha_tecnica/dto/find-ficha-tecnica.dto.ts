import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TIPO_EQUIPO } from '../enums/TIPO_EQUIPO.enum';

export class FindFichaTecnicaDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value?.trim()))
  @IsString()
  @Length(1, 50)
  serial?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value?.trim()))
  @IsEnum(TIPO_EQUIPO)
  tipoEquipo?: TIPO_EQUIPO;
}
