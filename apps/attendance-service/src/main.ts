import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AttendanceModule } from './attendance.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AttendanceModule,
        {
            transport: Transport.TCP,
            options: {
                host: process.env.ATTENDANCE_SERVICE_HOST || '0.0.0.0',
                port: parseInt(process.env.ATTENDANCE_SERVICE_PORT || '3002'),
            },
        },
    );

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    await app.listen();
}
bootstrap();
