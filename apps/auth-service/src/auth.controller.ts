import { Controller, Post, Body } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly employeeService: EmployeeService,
    ) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

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

