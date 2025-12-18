import { EmployeeResponseDto, UserRole } from '../dto';

export class UserMapper {
    static toResponseDto(user: {
        id: string;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }): EmployeeResponseDto {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
