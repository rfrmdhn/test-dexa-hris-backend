import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);

    // Global Pipes
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    // Enable CORS if needed (good practice for direct HTTP access)
    app.enableCors();

    // Start HTTP Server
    const port = parseInt(process.env.AUTH_SERVICE_PORT || '3001');
    await app.listen(port);
    console.log(`Auth Service is running on: ${await app.getUrl()}`);
}
bootstrap();
