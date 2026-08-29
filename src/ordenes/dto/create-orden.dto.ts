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

export class CreateOrdenDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  fichaTecnicaIds: string[];

  @IsString()
  @Length(10, 1000)
  @IsNotEmpty()
  fallaReportada: string;

  @IsDateString()
  @IsOptional()
  fechaEntregaEstimada?: string;
}
