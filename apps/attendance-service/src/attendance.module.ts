import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule, JwtStrategy } from '@app/shared';

import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        PrismaModule,
        PassportModule,
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService, JwtStrategy],
})
export class AttendanceModule { }
