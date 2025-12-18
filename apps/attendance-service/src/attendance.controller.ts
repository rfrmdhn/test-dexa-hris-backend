import {
    Controller,
    Post,
    Get,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Req,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import {
    CheckInDto,
    CheckOutDto,
    GetAllAttendanceDto,
    GetMyAttendanceDto,
    GetStatusDto,
    UserPayload,
    UserRole,
    JwtAuthGuard,
    RolesGuard,
    Roles,
    multerConfig,
} from '@app/shared';

import { AttendanceService } from './attendance.service';

interface AuthenticatedRequest extends Request {
    user: UserPayload;
}

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    async getCheckInStatus(@Req() req: AuthenticatedRequest) {
        const getStatusDto: GetStatusDto = {
            userId: req.user.sub,
        };
        return this.attendanceService.getCheckInStatus(getStatusDto);
    }

    @Post('check-in')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('photo', multerConfig))
    async checkIn(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: AuthenticatedRequest,
    ) {
        const checkInDto: CheckInDto = {
            userId: req.user.sub,
            photoUrl: file ? `uploads/${file.filename}` : '',
        };
        return this.attendanceService.checkIn(checkInDto);
    }

    @Post('check-out')
    @UseGuards(JwtAuthGuard)
    async checkOut(@Req() req: AuthenticatedRequest) {
        const checkOutDto: CheckOutDto = {
            userId: req.user.sub,
        };
        return this.attendanceService.checkOut(checkOutDto);
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
        return this.attendanceService.getMyAttendance(getMyDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getAll(@Query() query: GetAllAttendanceDto) {
        return this.attendanceService.getAll(query);
    }
}


