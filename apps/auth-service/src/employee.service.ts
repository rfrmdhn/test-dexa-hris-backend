import { Injectable, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

import {
    PrismaService,
    CreateEmployeeDto,
    UpdateEmployeeDto,
    GetAllEmployeesDto,
    EmployeeResponseDto,
    PaginatedEmployeesResponseDto,
    hashPassword,
} from '@app/shared';

@Injectable()
export class EmployeeService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(query: GetAllEmployeesDto): Promise<PaginatedEmployeesResponseDto> {
        const { page = 1, limit = 10, search, role } = query;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
            ];
        }

        if (role) {
            where.role = role;
        }

        const [employees, total] = await Promise.all([
            this.prisma.users.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.users.count({ where }),
        ]);

        return {
            data: employees.map((e: typeof employees[number]) => this.mapToResponseDto(e)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string): Promise<EmployeeResponseDto> {
        const employee = await this.prisma.users.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!employee) {
            throw new RpcException({ message: 'Employee not found', statusCode: HttpStatus.NOT_FOUND });
        }

        return this.mapToResponseDto(employee);
    }

    async create(createDto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
        // Check if email already exists
        const existingUser = await this.prisma.users.findUnique({
            where: { email: createDto.email },
        });

        if (existingUser) {
            throw new RpcException({ message: 'User with this email already exists', statusCode: HttpStatus.CONFLICT });
        }

        // Hash password
        const hashedPassword = await hashPassword(createDto.password);

        // Generate UUID and create user
        const userId = uuidv4();
        const employee = await this.prisma.users.create({
            data: {
                id: userId,
                email: createDto.email,
                password: hashedPassword,
                name: createDto.name,
                role: createDto.role || 'EMPLOYEE',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return this.mapToResponseDto(employee);
    }

    async update(id: string, updateDto: UpdateEmployeeDto): Promise<EmployeeResponseDto> {
        // Check if employee exists
        const existingEmployee = await this.prisma.users.findUnique({
            where: { id },
        });

        if (!existingEmployee) {
            throw new RpcException({ message: 'Employee not found', statusCode: HttpStatus.NOT_FOUND });
        }

        // Check if email is being updated and already exists
        if (updateDto.email && updateDto.email !== existingEmployee.email) {
            const emailExists = await this.prisma.users.findUnique({
                where: { email: updateDto.email },
            });

            if (emailExists) {
                throw new RpcException({ message: 'User with this email already exists', statusCode: HttpStatus.CONFLICT });
            }
        }

        // Prepare update data
        const updateData: Record<string, unknown> = {};

        if (updateDto.email) updateData.email = updateDto.email;
        if (updateDto.name) updateData.name = updateDto.name;
        if (updateDto.role) updateData.role = updateDto.role;

        if (updateDto.password) {
            updateData.password = await hashPassword(updateDto.password);
        }

        const employee = await this.prisma.users.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return this.mapToResponseDto(employee);
    }

    async remove(id: string): Promise<{ message: string }> {
        // Check if employee exists
        const existingEmployee = await this.prisma.users.findUnique({
            where: { id },
        });

        if (!existingEmployee) {
            throw new RpcException({ message: 'Employee not found', statusCode: HttpStatus.NOT_FOUND });
        }

        await this.prisma.users.delete({
            where: { id },
        });

        return { message: 'Employee deleted successfully' };
    }

    private mapToResponseDto(employee: {
        id: string;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }): EmployeeResponseDto {
        return {
            id: employee.id,
            email: employee.email,
            name: employee.name,
            role: employee.role as EmployeeResponseDto['role'],
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt,
        };
    }
}
