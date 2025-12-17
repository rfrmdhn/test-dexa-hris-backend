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

// Create uploads directory if it doesn't exist
const uploadPath = join(__dirname, '..', '..', '..', 'public', 'uploads');
if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
}

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MulterModule.register({
            storage: diskStorage({
                destination: uploadPath,
                filename: (req, file, cb) => {
                    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
            fileFilter: (req, file, cb) => {
                // Allow only images
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

