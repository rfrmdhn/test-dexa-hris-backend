import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AttendanceModule } from './attendance.module';

async function bootstrap() {
    const app = await NestFactory.create(AttendanceModule);

    // Global Pipes
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    // Enable CORS
    app.enableCors();

    // Start HTTP Server
    const port = parseInt(process.env.ATTENDANCE_SERVICE_PORT || '3002');
    await app.listen(port);
    console.log(`Attendance Service is running on: ${await app.getUrl()}`);
}
bootstrap();
