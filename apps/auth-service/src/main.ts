import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { Transport } from '@nestjs/microservices';
import { HttpExceptionFilter } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors();

  const port = parseInt(process.env.AUTH_SERVICE_PORT || '3001');
  await app.listen(port);
  console.log(`Auth Service is running on: ${await app.getUrl()}`);
}
bootstrap();
