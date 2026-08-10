import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_PASS: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsIn(['true', 'false'])
  @IsOptional()
  DB_SSL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION: string;

  @IsString()
  @IsNotEmpty()
  API_KEY: string;

  @IsNumber()
  @IsOptional()
  PORT: number;

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL: number;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT: number;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => {
        const constraints = Object.values(error.constraints ?? {}).join(', ');

        return `- ${error.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(
      `Configuración de entorno inválida. Revisa tu archivo .env:\n${messages}`,
    );
  }

  return validatedConfig;
}

export function parseIntEnv(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}
