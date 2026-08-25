import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ORDEN_ESTADO } from '../enums/ORDEN_ESTADO.enum';

export class CambiarEstadoDto {
  @IsEnum(ORDEN_ESTADO)
  @IsNotEmpty()
  estado: ORDEN_ESTADO;

  @IsString()
  @Length(3, 500)
  @IsOptional()
  comentario?: string;
}
