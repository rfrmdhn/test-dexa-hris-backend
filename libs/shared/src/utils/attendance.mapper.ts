import { AttendanceResponseDto } from '../dto';

export class AttendanceMapper {
    static toResponseDto(attendance: {
        id: string;
        userId: string;
        checkInTime: Date;
        photoUrl: string;
        checkOutTime: Date | null;
        users?: { id: string; email: string; name: string; role: string };
    }): AttendanceResponseDto {
        return {
            id: attendance.id,
            checkInTime: attendance.checkInTime,
            photoUrl: attendance.photoUrl.startsWith('uploads/')
                ? `/public/${attendance.photoUrl}`
                : attendance.photoUrl,
            checkOutTime: attendance.checkOutTime,
            user: attendance.users,
        };
    }
}
