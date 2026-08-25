import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class UpdateOrdenDto {
  @IsString()
  @Length(10, 1000)
  @IsOptional()
  fallaReportada?: string;

  @IsDateString()
  @IsOptional()
  fechaEntregaEstimada?: string;
}
