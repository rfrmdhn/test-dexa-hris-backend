import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
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
        AuthModule,
        AttendanceModule,
        EmployeeModule,
    ],
})
export class AppModule { }
