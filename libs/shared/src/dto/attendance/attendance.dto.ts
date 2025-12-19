import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckInDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    photoUrl: string;
}

export class CheckOutDto {
    @IsString()
    @IsNotEmpty()
    userId: string;
}

export class GetMyAttendanceDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    startDate?: string;

    @IsOptional()
    endDate?: string;
}

export class AttendanceResponseDto {
    id: string;
    checkInTime: Date;
    photoUrl: string;
    checkOutTime: Date | null;
    user?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

export class PaginatedAttendanceResponseDto {
    data: AttendanceResponseDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export class GetMyAttendanceQueryDto {
    @IsOptional()
    startDate?: string;

    @IsOptional()
    endDate?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}

export class GetAllAttendanceDto extends GetMyAttendanceQueryDto {
    @IsOptional()
    @IsString()
    userId?: string;
}

export class GetStatusDto {
    @IsString()
    @IsNotEmpty()
    userId: string;
}

export enum AttendanceStatus {
    NOT_CHECKED_IN = 'NOT_CHECKED_IN',
    CHECKED_IN = 'CHECKED_IN',
    CHECKED_OUT = 'CHECKED_OUT',
}

export class CheckInStatusResponseDto {
    status: AttendanceStatus;
    message: string;
    currentAttendance?: AttendanceResponseDto;
}

