import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ORDEN_ESTADO } from '../enums/ORDEN_ESTADO.enum';

export class FindOrdenesDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value?.trim()))
  @IsEnum(ORDEN_ESTADO)
  estado?: ORDEN_ESTADO;
}
