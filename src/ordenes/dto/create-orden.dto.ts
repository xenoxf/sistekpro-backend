import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrdenDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  fichaTecnicaIds: string[];

  @IsString()
  @Length(10, 1000)
  @IsNotEmpty()
  fallaReportada: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString()
  @IsOptional()
  fechaEntregaEstimada?: string;
}
