import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { ROLE } from '../enums/ROLE.enum';

export class CreateUserDto {
  @IsString()
  @Length(3, 50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(5, 50)
  @IsNotEmpty()
  password: string;

  @IsEnum(ROLE)
  @IsNotEmpty()
  role: ROLE;
}
