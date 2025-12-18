import { Injectable, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
    PrismaService,
    CheckInDto,
    CheckOutDto,
    GetAllAttendanceDto,
    GetMyAttendanceDto,
    GetStatusDto,
    AttendanceResponseDto,
    PaginatedAttendanceResponseDto,
    CheckInStatusResponseDto,
    AttendanceStatus,
    USER_SELECT,
    getStartOfDay,
    buildDateRangeFilter,
    buildPaginatedResponse,
    calculateSkip,
    AttendanceMapper,
} from '@app/shared';

@Injectable()
export class AttendanceService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly userInclude = { users: { select: USER_SELECT } };

    async checkIn(checkInDto: CheckInDto): Promise<AttendanceResponseDto> {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.users.findUnique({
                where: { id: checkInDto.userId },
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Lock or check within transaction
            const existingCheckIn = await tx.attendances.findFirst({
                where: {
                    userId: checkInDto.userId,
                    checkInTime: { gte: getStartOfDay() },
                    checkOutTime: null,
                },
            });

            if (existingCheckIn) {
                throw new BadRequestException('You have already checked in today and have not checked out');
            }

            const attendance = await tx.attendances.create({
                data: {
                    id: uuidv4(),
                    userId: checkInDto.userId,
                    photoUrl: checkInDto.photoUrl,
                    checkInTime: new Date(),
                },
                include: this.userInclude,
            });

            return AttendanceMapper.toResponseDto(attendance);
        });
    }

    async checkOut(checkOutDto: CheckOutDto): Promise<AttendanceResponseDto> {
        return this.prisma.$transaction(async (tx) => {
            const openCheckIn = await tx.attendances.findFirst({
                where: {
                    userId: checkOutDto.userId,
                    checkInTime: { gte: getStartOfDay() },
                    checkOutTime: null,
                },
            });

            if (!openCheckIn) {
                throw new BadRequestException('No active check-in found for today');
            }

            const attendance = await tx.attendances.update({
                where: { id: openCheckIn.id },
                data: { checkOutTime: new Date() },
                include: this.userInclude,
            });

            return AttendanceMapper.toResponseDto(attendance);
        });
    }

    async getMyAttendance(query: GetMyAttendanceDto): Promise<PaginatedAttendanceResponseDto> {
        const { userId, page = 1, limit = 10, startDate, endDate } = query;

        const where = this.buildAttendanceWhere({ userId, startDate, endDate });
        const [attendances, total] = await this.findAttendancesWithCount(where, page, limit);

        return buildPaginatedResponse(
            attendances.map((a) => AttendanceMapper.toResponseDto(a)),
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
            attendances.map((a) => AttendanceMapper.toResponseDto(a)),
            total,
            page,
            limit
        );
    }

    async getCheckInStatus(query: GetStatusDto): Promise<CheckInStatusResponseDto> {
        const openCheckIn = await this.findTodayOpenCheckIn(query.userId);

        if (openCheckIn) {
            const attendanceWithUser = await this.prisma.attendances.findUnique({
                where: { id: openCheckIn.id },
                include: this.userInclude,
            });

            return {
                status: AttendanceStatus.CHECKED_IN,
                message: 'Anda sudah check-in hari ini. Silakan check-out.',
                currentAttendance: attendanceWithUser ? AttendanceMapper.toResponseDto(attendanceWithUser) : undefined,
            };
        }

        const todayCompletedAttendance = await this.prisma.attendances.findFirst({
            where: {
                userId: query.userId,
                checkInTime: { gte: getStartOfDay() },
                checkOutTime: { not: null },
            },
            include: this.userInclude,
            orderBy: { checkInTime: 'desc' },
        });

        if (todayCompletedAttendance) {
            return {
                status: AttendanceStatus.CHECKED_OUT,
                message: 'Anda sudah menyelesaikan absensi hari ini.',
                currentAttendance: AttendanceMapper.toResponseDto(todayCompletedAttendance),
            };
        }

        return {
            status: AttendanceStatus.NOT_CHECKED_IN,
            message: 'Anda belum check-in hari ini. Silakan check-in.',
        };
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
}
