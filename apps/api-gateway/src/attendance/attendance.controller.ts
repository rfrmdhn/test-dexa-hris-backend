import {
    Controller,
    Post,
    Get,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Req,
    Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

import {
    CheckInDto,
    UserPayload,
    UserRole,
} from '@app/shared';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
    user: UserPayload;
}

@Controller('attendance')
export class AttendanceController {
    constructor(
        @Inject('ATTENDANCE_SERVICE') private readonly client: ClientProxy,
    ) { }

    @Post('check-in')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('photo'))
    async checkIn(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: AuthenticatedRequest,
    ) {
        // Validation removed from Gateway - logic moved to Service
        // Note: file might be undefined here if upload failed, but we pass generic DTO

        const checkInDto: CheckInDto = {
            userId: req.user.sub,
            photoUrl: file ? `uploads/${file.filename}` : '', // Pass empty string if no file, Service will validate
        };

        return firstValueFrom(this.client.send('attendance.check-in', checkInDto));
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getAll() {
        return firstValueFrom(this.client.send('attendance.get-all', {}));
    }
}
