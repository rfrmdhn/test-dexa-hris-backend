import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MulterModule } from '@nestjs/platform-express';

import { PrismaModule, multerConfig } from '@app/shared';

import { AttendanceController } from './attendance.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        ConfigModule,
        AuthModule,
        PrismaModule,
        MulterModule.register(multerConfig),
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
