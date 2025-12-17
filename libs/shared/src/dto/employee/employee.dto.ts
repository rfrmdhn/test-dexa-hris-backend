import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../auth/auth.dto';

// ========== Request DTOs ==========

export class CreateEmployeeDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.EMPLOYEE;
}

export class UpdateEmployeeDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}

export class GetAllEmployeesDto {
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
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

// ========== Response DTOs ==========

export class EmployeeResponseDto {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export class PaginatedEmployeesResponseDto {
    data: EmployeeResponseDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
