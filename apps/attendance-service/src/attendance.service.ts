import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

import {
    PrismaService,
    CheckInDto,
    GetAllAttendanceDto,
    AttendanceResponseDto,
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

    async getAll(query: GetAllAttendanceDto): Promise<AttendanceResponseDto[]> {
        const where: Record<string, unknown> = {};

        // Optional date filtering
        if (query.startDate || query.endDate) {
            where.checkInTime = {};
            if (query.startDate) {
                (where.checkInTime as Record<string, unknown>).gte = new Date(query.startDate);
            }
            if (query.endDate) {
                (where.checkInTime as Record<string, unknown>).lte = new Date(query.endDate);
            }
        }

        const attendances = await this.prisma.attendances.findMany({
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
        });

        return attendances.map((attendance) => ({
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
        }));
    }
}
