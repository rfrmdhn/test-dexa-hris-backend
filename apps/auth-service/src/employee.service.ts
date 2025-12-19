import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { users } from '@prisma/client';
import {
    UsersRepository,
    CreateEmployeeDto,
    UpdateEmployeeDto,
    GetAllEmployeesDto,
} from '@app/shared';

@Injectable()
export class EmployeeService {
    constructor(private readonly usersRepository: UsersRepository) { }

    async findAll(query: GetAllEmployeesDto): Promise<{ data: users[]; total: number }> {
        const { page = 1, limit = 10, search, role } = query;

        const [employees, total] = await this.usersRepository.findAllWithCount({ page, limit, search, role });

        return { data: employees as users[], total };
    }

    async findOne(id: string): Promise<users> {
        return this.usersRepository.findByIdOrThrow(id) as Promise<users>;
    }

    async create(createDto: CreateEmployeeDto): Promise<users> {
        return this.usersRepository.create(createDto) as Promise<users>;
    }

    async update(id: string, updateDto: UpdateEmployeeDto): Promise<users> {
        return this.usersRepository.update(id, updateDto) as Promise<users>;
    }

    async remove(id: string): Promise<{ message: string }> {
        await this.usersRepository.remove(id);
        return { message: 'Employee deleted successfully' };
    }




}

