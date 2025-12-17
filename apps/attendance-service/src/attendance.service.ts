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
} from '@app/shared';

@Injectable()
export class AttendanceService {
    constructor(private readonly prisma: PrismaService) { }

    async checkIn(checkInDto: CheckInDto): Promise<AttendanceResponseDto> {
        // Verify the user exists
        const user = await this.prisma.users.findUnique({
            where: { id: checkInDto.userId },
        });

        if (!user) {
            throw new RpcException({ message: 'User not found', statusCode: HttpStatus.NOT_FOUND });
        }

        // Check if user already checked in today without checking out
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingCheckIn = await this.prisma.attendances.findFirst({
            where: {
                userId: checkInDto.userId,
                checkInTime: {
                    gte: today,
                },
                checkOutTime: null,
            },
        });

        if (existingCheckIn) {
            throw new RpcException({ message: 'You have already checked in today and have not checked out', statusCode: HttpStatus.BAD_REQUEST });
        }

        // Create attendance record
        const attendanceId = uuidv4();
        const attendance = await this.prisma.attendances.create({
            data: {
                id: attendanceId,
                userId: checkInDto.userId,
                photoUrl: checkInDto.photoUrl,
                checkInTime: new Date(),
            },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });

        return this.mapToResponseDto(attendance);
    }

    async checkOut(checkOutDto: CheckOutDto): Promise<AttendanceResponseDto> {
        // Find today's open check-in
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const openCheckIn = await this.prisma.attendances.findFirst({
            where: {
                userId: checkOutDto.userId,
                checkInTime: {
                    gte: today,
                },
                checkOutTime: null,
            },
        });

        if (!openCheckIn) {
            throw new RpcException({ message: 'No active check-in found for today', statusCode: HttpStatus.BAD_REQUEST });
        }

        // Update with check-out time
        const attendance = await this.prisma.attendances.update({
            where: { id: openCheckIn.id },
            data: {
                checkOutTime: new Date(),
            },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });

        return this.mapToResponseDto(attendance);
    }

    async getMyAttendance(query: GetMyAttendanceDto): Promise<PaginatedAttendanceResponseDto> {
        const { userId, page = 1, limit = 10, startDate, endDate } = query;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = { userId };

        // Optional date filtering
        if (startDate || endDate) {
            where.checkInTime = {};
            if (startDate) {
                (where.checkInTime as Record<string, unknown>).gte = new Date(startDate);
            }
            if (endDate) {
                (where.checkInTime as Record<string, unknown>).lte = new Date(endDate);
            }
        }

        const [attendances, total] = await Promise.all([
            this.prisma.attendances.findMany({
                where,
                include: {
                    users: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    checkInTime: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.attendances.count({ where }),
        ]);

        return {
            data: attendances.map((a: typeof attendances[number]) => this.mapToResponseDto(a)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getAll(query: GetAllAttendanceDto): Promise<PaginatedAttendanceResponseDto> {
        const { userId, page = 1, limit = 10, startDate, endDate } = query;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};

        // Optional userId filter
        if (userId) {
            where.userId = userId;
        }

        // Optional date filtering
        if (startDate || endDate) {
            where.checkInTime = {};
            if (startDate) {
                (where.checkInTime as Record<string, unknown>).gte = new Date(startDate);
            }
            if (endDate) {
                (where.checkInTime as Record<string, unknown>).lte = new Date(endDate);
            }
        }

        const [attendances, total] = await Promise.all([
            this.prisma.attendances.findMany({
                where,
                include: {
                    users: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    checkInTime: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.attendances.count({ where }),
        ]);

        return {
            data: attendances.map((a: typeof attendances[number]) => this.mapToResponseDto(a)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    private mapToResponseDto(attendance: {
        id: string;
        userId: string;
        checkInTime: Date;
        photoUrl: string;
        checkOutTime: Date | null;
        users?: {
            id: string;
            email: string;
            name: string;
            role: string;
        } | null;
    }): AttendanceResponseDto {
        return {
            id: attendance.id,
            userId: attendance.userId,
            checkInTime: attendance.checkInTime,
            photoUrl: attendance.photoUrl,
            checkOutTime: attendance.checkOutTime,
            user: attendance.users
                ? {
                    id: attendance.users.id,
                    email: attendance.users.email,
                    name: attendance.users.name,
                    role: attendance.users.role,
                }
                : undefined,
        };
    }
}

