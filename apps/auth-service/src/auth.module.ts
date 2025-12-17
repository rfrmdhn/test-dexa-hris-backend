import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '@app/shared';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmployeeService } from './employee.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        PrismaModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService): JwtModuleOptions => {
                const secret = configService.get<string>('JWT_SECRET');
                if (!secret) {
                    throw new Error('JWT_SECRET environment variable is required');
                }
                return {
                    secret,
                    signOptions: {
                        expiresIn: configService.get<number>('JWT_EXPIRES_IN') || 86400,
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, EmployeeService],
})
export class AuthModule { }

