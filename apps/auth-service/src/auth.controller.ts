import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
    RegisterDto,
    LoginDto,
    CreateEmployeeDto,
    UpdateEmployeeDto,
    GetAllEmployeesDto,
} from '@app/shared';

import { AuthService } from './auth.service';
import { EmployeeService } from './employee.service';

@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly employeeService: EmployeeService,
    ) { }

    @MessagePattern('auth.register')
    async register(@Payload() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @MessagePattern('auth.login')
    async login(@Payload() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    // Employee CRUD
    @MessagePattern('employee.find-all')
    async findAllEmployees(@Payload() query: GetAllEmployeesDto) {
        return this.employeeService.findAll(query);
    }

    @MessagePattern('employee.find-one')
    async findOneEmployee(@Payload() data: { id: string }) {
        return this.employeeService.findOne(data.id);
    }

    @MessagePattern('employee.create')
    async createEmployee(@Payload() createDto: CreateEmployeeDto) {
        return this.employeeService.create(createDto);
    }

    @MessagePattern('employee.update')
    async updateEmployee(@Payload() data: { id: string; updateDto: UpdateEmployeeDto }) {
        return this.employeeService.update(data.id, data.updateDto);
    }

    @MessagePattern('employee.remove')
    async removeEmployee(@Payload() data: { id: string }) {
        return this.employeeService.remove(data.id);
    }
}

