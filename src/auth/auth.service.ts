import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ROLE } from 'src/users/enums/ROLE.enum';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateLoginDto } from './dto/create-login-dto.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: ROLE;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: CreateLoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByNameWithPassword(dto.name);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.buildAuthResponse(user);
  }

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private buildAuthResponse(user: User): AuthResponse {
    return {
      token: this.generateAccessToken(user),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  }
}
