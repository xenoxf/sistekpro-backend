import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ROLE } from '../enums/ROLE.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @Length(5, 50)
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsEnum(ROLE)
  role?: ROLE;
}
