import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy, PrismaModule, UsersRepository } from '@app/shared';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { EmployeeController } from './employee.controller';
import { AuthService } from './auth.service';
import { EmployeeService } from './employee.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    PrismaModule,
    PassportModule,
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
  controllers: [AuthController, EmployeeController],
  providers: [AuthService, EmployeeService, JwtStrategy, UsersRepository],
})
export class AuthModule {}
