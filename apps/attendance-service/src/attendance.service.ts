import { Injectable, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

import {
    PrismaService,
    CheckInDto,
    CheckOutDto,
    GetAllAttendanceDto,
    GetMyAttendanceDto,
    AttendanceResponseDto,
    PaginatedAttendanceResponseDto,
    USER_SELECT,
    getStartOfDay,
    buildDateRangeFilter,
    buildPaginatedResponse,
    calculateSkip,
} from '@app/shared';

@Injectable()
export class AttendanceService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly userInclude = { users: { select: USER_SELECT } };

    async checkIn(checkInDto: CheckInDto): Promise<AttendanceResponseDto> {
        const user = await this.prisma.users.findUnique({
            where: { id: checkInDto.userId },
        });

        if (!user) {
            throw new RpcException({ message: 'User not found', statusCode: HttpStatus.NOT_FOUND });
        }

        const existingCheckIn = await this.findTodayOpenCheckIn(checkInDto.userId);

        if (existingCheckIn) {
            throw new RpcException({
                message: 'You have already checked in today and have not checked out',
                statusCode: HttpStatus.BAD_REQUEST
            });
        }

        const attendance = await this.prisma.attendances.create({
            data: {
                id: uuidv4(),
                userId: checkInDto.userId,
                photoUrl: checkInDto.photoUrl,
                checkInTime: new Date(),
            },
            include: this.userInclude,
        });

        return this.mapToResponseDto(attendance);
    }

    async checkOut(checkOutDto: CheckOutDto): Promise<AttendanceResponseDto> {
        const openCheckIn = await this.findTodayOpenCheckIn(checkOutDto.userId);

        if (!openCheckIn) {
            throw new RpcException({
                message: 'No active check-in found for today',
                statusCode: HttpStatus.BAD_REQUEST
            });
        }

        const attendance = await this.prisma.attendances.update({
            where: { id: openCheckIn.id },
            data: { checkOutTime: new Date() },
            include: this.userInclude,
        });

        return this.mapToResponseDto(attendance);
    }

    async getMyAttendance(query: GetMyAttendanceDto): Promise<PaginatedAttendanceResponseDto> {
        const { userId, page = 1, limit = 10, startDate, endDate } = query;

        const where = this.buildAttendanceWhere({ userId, startDate, endDate });
        const [attendances, total] = await this.findAttendancesWithCount(where, page, limit);

        return buildPaginatedResponse(
            attendances.map((a: Awaited<ReturnType<typeof this.findAttendancesWithCount>>[0][number]) => this.mapToResponseDto(a)),
            total,
            page,
            limit
        );
    }

    async getAll(query: GetAllAttendanceDto): Promise<PaginatedAttendanceResponseDto> {
        const { userId, page = 1, limit = 10, startDate, endDate } = query;

        const where = this.buildAttendanceWhere({ userId, startDate, endDate });
        const [attendances, total] = await this.findAttendancesWithCount(where, page, limit);

        return buildPaginatedResponse(
            attendances.map((a: Awaited<ReturnType<typeof this.findAttendancesWithCount>>[0][number]) => this.mapToResponseDto(a)),
            total,
            page,
            limit
        );
    }


    private async findTodayOpenCheckIn(userId: string) {
        return this.prisma.attendances.findFirst({
            where: {
                userId,
                checkInTime: { gte: getStartOfDay() },
                checkOutTime: null,
            },
        });
    }

    private buildAttendanceWhere(params: {
        userId?: string;
        startDate?: string;
        endDate?: string;
    }): Record<string, unknown> {
        const where: Record<string, unknown> = {};

        if (params.userId) {
            where.userId = params.userId;
        }

        const dateFilter = buildDateRangeFilter(params.startDate, params.endDate);
        if (dateFilter) {
            where.checkInTime = dateFilter;
        }

        return where;
    }

    private async findAttendancesWithCount(
        where: Record<string, unknown>,
        page: number,
        limit: number
    ) {
        return Promise.all([
            this.prisma.attendances.findMany({
                where,
                include: this.userInclude,
                orderBy: { checkInTime: 'desc' },
                skip: calculateSkip(page, limit),
                take: limit,
            }),
            this.prisma.attendances.count({ where }),
        ]);
    }

    private mapToResponseDto(attendance: {
        id: string;
        userId: string;
        checkInTime: Date;
        photoUrl: string;
        checkOutTime: Date | null;
        users?: { id: string; email: string; name: string; role: string } | null;
    }): AttendanceResponseDto {
        return {
            id: attendance.id,
            userId: attendance.userId,
            checkInTime: attendance.checkInTime,
            photoUrl: attendance.photoUrl,
            checkOutTime: attendance.checkOutTime,
            user: attendance.users ?? undefined,
        };
    }
}


