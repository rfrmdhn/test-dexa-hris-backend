import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '@app/shared';

import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        PrismaModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
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
        ClientsModule.registerAsync([
            {
                name: 'AUTH_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>('AUTH_SERVICE_HOST') || '0.0.0.0',
                        port: configService.get<number>('AUTH_SERVICE_PORT') || 3001,
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [AuthController],
    providers: [JwtStrategy],
    exports: [JwtModule, PassportModule],
})
export class AuthModule { }
