import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { TransformInterceptor } from '@app/shared';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS
    app.enableCors();

    // Global Validation Pipe (Enabled for Monolith)
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    // Global Response Interceptor
    app.useGlobalInterceptors(new TransformInterceptor());

    // Serve static files (uploads)
    app.useStaticAssets(join(__dirname, '..', '..', '..', 'public'), {
        prefix: '/public/',
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`API Gateway is running on: http://localhost:${port}`);
}
bootstrap();
