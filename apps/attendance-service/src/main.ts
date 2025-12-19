import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AttendanceModule } from './attendance.module';
import { HttpExceptionFilter } from '@app/shared';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(AttendanceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors();

  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public/',
  });

  const port = parseInt(process.env.ATTENDANCE_SERVICE_PORT || '3002');
  await app.listen(port);
  console.log(`Attendance Service is running on: ${await app.getUrl()}`);
}
bootstrap();
