import { Controller, Post, Body } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
    RegisterDto,
    LoginDto,
    CreateEmployeeDto,
    UpdateEmployeeDto,
    GetAllEmployeesDto,
    UserMapper,
    buildPaginatedResponse,
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
        const user = await this.authService.register(registerDto);
        return {
            message: 'User registered successfully',
            user: UserMapper.toResponseDto(user),
        };
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const result = await this.authService.login(loginDto);
        return {
            access_token: result.access_token,
            user: UserMapper.toResponseDto(result.user),
        };
    }

    @MessagePattern('employee.find-all')
    async findAllEmployees(@Payload() query: GetAllEmployeesDto) {
        const { data, total } = await this.employeeService.findAll(query);
        return buildPaginatedResponse(
            data.map(user => UserMapper.toResponseDto(user)),
            total,
            query.page || 1,
            query.limit || 10
        );
    }

    @MessagePattern('employee.find-one')
    async findOneEmployee(@Payload() data: { id: string }) {
        const employee = await this.employeeService.findOne(data.id);
        return UserMapper.toResponseDto(employee);
    }

    @MessagePattern('employee.create')
    async createEmployee(@Payload() createDto: CreateEmployeeDto) {
        const employee = await this.employeeService.create(createDto);
        return UserMapper.toResponseDto(employee);
    }

    @MessagePattern('employee.update')
    async updateEmployee(@Payload() data: { id: string; updateDto: UpdateEmployeeDto }) {
        const employee = await this.employeeService.update(data.id, data.updateDto);
        return UserMapper.toResponseDto(employee);
    }

    @MessagePattern('employee.remove')
    async removeEmployee(@Payload() data: { id: string }) {
        return this.employeeService.remove(data.id);
    }
}

