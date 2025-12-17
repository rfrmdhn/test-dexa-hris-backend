import { IsString, IsNotEmpty } from 'class-validator';

export class CheckInDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    photoUrl: string;
}

export class AttendanceResponseDto {
    id: string;
    userId: string;
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

export class GetAllAttendanceDto {
    // Optional filter params can be added here
    startDate?: Date;
    endDate?: Date;
}
