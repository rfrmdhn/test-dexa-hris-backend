import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AuthModule,
        {
            transport: Transport.TCP,
            options: {
                host: process.env.AUTH_SERVICE_HOST || '0.0.0.0',
                port: parseInt(process.env.AUTH_SERVICE_PORT || '3001'),
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
