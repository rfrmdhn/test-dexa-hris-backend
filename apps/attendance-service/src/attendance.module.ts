import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport'; // Added

import { PrismaModule, JwtStrategy } from '@app/shared'; // Added JwtStrategy

import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        PrismaModule,
        PassportModule, // Added
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService, JwtStrategy], // Added JwtStrategy
})
export class AttendanceModule { }
