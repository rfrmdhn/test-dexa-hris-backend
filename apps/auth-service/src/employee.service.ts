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
    EMPLOYEE_SELECT,
    buildPaginatedResponse,
    calculateSkip,
} from '@app/shared';

@Injectable()
export class EmployeeService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(query: GetAllEmployeesDto): Promise<PaginatedEmployeesResponseDto> {
        const { page = 1, limit = 10, search, role } = query;

        const where = this.buildEmployeeWhere({ search, role });
        const [employees, total] = await this.findEmployeesWithCount(where, page, limit);

        return buildPaginatedResponse(
            employees.map((e: Awaited<ReturnType<typeof this.findEmployeesWithCount>>[0][number]) => this.mapToResponseDto(e)),
            total,
            page,
            limit
        );
    }

    async findOne(id: string): Promise<EmployeeResponseDto> {
        const employee = await this.prisma.users.findUnique({
            where: { id },
            select: EMPLOYEE_SELECT,
        });

        if (!employee) {
            throw new RpcException({ message: 'Employee not found', statusCode: HttpStatus.NOT_FOUND });
        }

        return this.mapToResponseDto(employee);
    }

    async create(createDto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
        await this.ensureEmailNotExists(createDto.email);

        const employee = await this.prisma.users.create({
            data: {
                id: uuidv4(),
                email: createDto.email,
                password: await hashPassword(createDto.password),
                name: createDto.name,
                role: createDto.role || 'EMPLOYEE',
            },
            select: EMPLOYEE_SELECT,
        });

        return this.mapToResponseDto(employee);
    }

    async update(id: string, updateDto: UpdateEmployeeDto): Promise<EmployeeResponseDto> {
        const existingEmployee = await this.prisma.users.findUnique({ where: { id } });

        if (!existingEmployee) {
            throw new RpcException({ message: 'Employee not found', statusCode: HttpStatus.NOT_FOUND });
        }

        if (updateDto.email && updateDto.email !== existingEmployee.email) {
            await this.ensureEmailNotExists(updateDto.email);
        }

        const updateData = await this.buildUpdateData(updateDto);

        const employee = await this.prisma.users.update({
            where: { id },
            data: updateData,
            select: EMPLOYEE_SELECT,
        });

        return this.mapToResponseDto(employee);
    }

    async remove(id: string): Promise<{ message: string }> {
        const existingEmployee = await this.prisma.users.findUnique({ where: { id } });

        if (!existingEmployee) {
            throw new RpcException({ message: 'Employee not found', statusCode: HttpStatus.NOT_FOUND });
        }

        await this.prisma.users.delete({ where: { id } });

        return { message: 'Employee deleted successfully' };
    }


    private async ensureEmailNotExists(email: string): Promise<void> {
        const existingUser = await this.prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            throw new RpcException({
                message: 'User with this email already exists',
                statusCode: HttpStatus.CONFLICT
            });
        }
    }

    private buildEmployeeWhere(params: { search?: string; role?: string }): Record<string, unknown> {
        const where: Record<string, unknown> = {};

        if (params.search) {
            where.OR = [
                { name: { contains: params.search } },
                { email: { contains: params.search } },
            ];
        }

        if (params.role) {
            where.role = params.role;
        }

        return where;
    }

    private async findEmployeesWithCount(
        where: Record<string, unknown>,
        page: number,
        limit: number
    ) {
        return Promise.all([
            this.prisma.users.findMany({
                where,
                select: EMPLOYEE_SELECT,
                orderBy: { createdAt: 'desc' },
                skip: calculateSkip(page, limit),
                take: limit,
            }),
            this.prisma.users.count({ where }),
        ]);
    }

    private async buildUpdateData(updateDto: UpdateEmployeeDto): Promise<Record<string, unknown>> {
        const updateData: Record<string, unknown> = {};

        if (updateDto.email) updateData.email = updateDto.email;
        if (updateDto.name) updateData.name = updateDto.name;
        if (updateDto.role) updateData.role = updateDto.role;
        if (updateDto.password) updateData.password = await hashPassword(updateDto.password);

        return updateData;
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

