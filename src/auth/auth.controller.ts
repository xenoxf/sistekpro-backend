import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService, AuthResponse } from './auth.service';
import { CreateLoginDto } from './dto/create-login-dto.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { UsersService } from 'src/users/users.service';
import type { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import type { User } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  login(@Body() dto: CreateLoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('profile')
  profile(@GetUser() user: JwtPayload): Promise<User> {
    return this.usersService.findById(user.sub);
  }
}
