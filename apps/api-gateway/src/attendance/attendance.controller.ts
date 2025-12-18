import {
    Controller,
    Post,
    Get,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Req,
    Inject,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';

import {
    CheckInDto,
    CheckOutDto,
    GetAllAttendanceDto,
    GetMyAttendanceDto,
    GetStatusDto,
    UserPayload,
    UserRole,
    AttendanceResponseDto,
    PaginatedAttendanceResponseDto,
    CheckInStatusResponseDto,
    sendToService,
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

    @Get('status')
    @UseGuards(JwtAuthGuard)
    async getCheckInStatus(@Req() req: AuthenticatedRequest) {
        const getStatusDto: GetStatusDto = {
            userId: req.user.sub,
        };

        return sendToService<CheckInStatusResponseDto>(
            this.client, 'attendance.get-status', getStatusDto
        );
    }

    @Post('check-in')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('photo'))
    async checkIn(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: AuthenticatedRequest,
    ) {
        const checkInDto: CheckInDto = {
            userId: req.user.sub,
            photoUrl: file ? `uploads/${file.filename}` : '',
        };

        return sendToService<AttendanceResponseDto>(
            this.client, 'attendance.check-in', checkInDto
        );
    }

    @Post('check-out')
    @UseGuards(JwtAuthGuard)
    async checkOut(@Req() req: AuthenticatedRequest) {
        const checkOutDto: CheckOutDto = {
            userId: req.user.sub,
        };

        return sendToService<AttendanceResponseDto>(
            this.client, 'attendance.check-out', checkOutDto
        );
    }

    @Get('my')
    @UseGuards(JwtAuthGuard)
    async getMyAttendance(
        @Req() req: AuthenticatedRequest,
        @Query() query: Omit<GetMyAttendanceDto, 'userId'>,
    ) {
        const getMyDto: GetMyAttendanceDto = {
            userId: req.user.sub,
            ...query,
        };

        return sendToService<PaginatedAttendanceResponseDto>(
            this.client, 'attendance.get-my', getMyDto
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getAll(@Query() query: GetAllAttendanceDto) {
        return sendToService<PaginatedAttendanceResponseDto>(
            this.client, 'attendance.get-all', query
        );
    }
}



