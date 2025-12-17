import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmployeeController } from './employee.controller';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'AUTH_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: 'localhost',
                        port: configService.get<number>('AUTH_SERVICE_PORT') || 3001,
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [EmployeeController],
})
export class EmployeeModule { }
