import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
    CheckInDto,
    CheckOutDto,
    GetAllAttendanceDto,
    GetMyAttendanceDto,
} from '@app/shared';

import { AttendanceService } from './attendance.service';

@Controller()
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @MessagePattern('attendance.check-in')
    async checkIn(@Payload() checkInDto: CheckInDto) {
        return this.attendanceService.checkIn(checkInDto);
    }

    @MessagePattern('attendance.check-out')
    async checkOut(@Payload() checkOutDto: CheckOutDto) {
        return this.attendanceService.checkOut(checkOutDto);
    }

    @MessagePattern('attendance.get-my')
    async getMyAttendance(@Payload() query: GetMyAttendanceDto) {
        return this.attendanceService.getMyAttendance(query);
    }

    @MessagePattern('attendance.get-all')
    async getAll(@Payload() query: GetAllAttendanceDto) {
        return this.attendanceService.getAll(query);
    }
}

