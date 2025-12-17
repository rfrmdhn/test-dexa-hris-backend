import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '@app/shared';

import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        PrismaModule,
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService],
})
export class AttendanceModule { }
