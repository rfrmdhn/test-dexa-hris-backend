import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import {
  CheckInDto,
  CheckOutDto,
  GetAllAttendanceDto,
  GetMyAttendanceDto,
  GetMyAttendanceQueryDto,
  GetStatusDto,
  UserPayload,
  UserRole,
  JwtAuthGuard,
  RolesGuard,
  Roles,
  multerConfig,
  CurrentUser,
} from '@app/shared';

import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getCheckInStatus(@CurrentUser() user: UserPayload) {
    const getStatusDto: GetStatusDto = {
      userId: user.sub,
    };
    return this.attendanceService.getCheckInStatus(getStatusDto);
  }

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async checkIn(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserPayload,
  ) {
    if (!file) {
      throw new BadRequestException('Photo is required');
    }

    const checkInDto: CheckInDto = {
      userId: user.sub,
      photoUrl: `uploads/${file.filename}`,
    };
    return this.attendanceService.checkIn(checkInDto);
  }

  @Post('check-out')
  @UseGuards(JwtAuthGuard)
  async checkOut(@CurrentUser() user: UserPayload) {
    const checkOutDto: CheckOutDto = {
      userId: user.sub,
    };
    return this.attendanceService.checkOut(checkOutDto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyAttendance(
    @CurrentUser() user: UserPayload,
    @Query() query: GetMyAttendanceQueryDto,
  ) {
    const getMyDto: GetMyAttendanceDto = {
      userId: user.sub,
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
