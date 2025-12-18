import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { PrismaModule } from '@app/shared';

import { AttendanceController } from './attendance.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        ConfigModule,
        AuthModule,
        PrismaModule,
        MulterModule.register({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = join(process.cwd(), 'public', 'uploads');
                    // Create folder if it doesn't exist
                    if (!existsSync(uploadPath)) {
                        mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                    cb(null, true);
                } else {
                    cb(new Error('Only image files are allowed!'), false);
                }
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB max
            },
        }),
        ClientsModule.registerAsync([
            {
                name: 'ATTENDANCE_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>('ATTENDANCE_SERVICE_HOST') || '0.0.0.0',
                        port: configService.get<number>('ATTENDANCE_SERVICE_PORT') || 3002,
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [AttendanceController],
})
export class AttendanceModule { }
