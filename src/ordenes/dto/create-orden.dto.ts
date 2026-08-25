import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateOrdenDto {
  @IsUUID()
  @IsNotEmpty()
  fichaTecnicaId: string;

  @IsString()
  @Length(10, 1000)
  @IsNotEmpty()
  fallaReportada: string;

  @IsDateString()
  @IsOptional()
  fechaEntregaEstimada?: string;
}
