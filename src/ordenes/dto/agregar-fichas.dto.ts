import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AgregarFichasDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  fichaTecnicaIds: string[];
}
