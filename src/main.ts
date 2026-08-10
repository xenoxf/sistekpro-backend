import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { parseIntEnv } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  const port = parseIntEnv(process.env.PORT, 3000);

  await app.listen(port);

  Logger.log(
    `API de Sistek corriendo en http://localhost:${port}`,
    'Bootstrap',
  );
}

void bootstrap();
