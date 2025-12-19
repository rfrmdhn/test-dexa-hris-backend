import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';

import {
    CreateEmployeeDto,
    UpdateEmployeeDto,
    GetAllEmployeesDto,
    UserRole,
    UserPayload,
    JwtAuthGuard,
    RolesGuard,
    Roles,
    UserMapper,
    buildPaginatedResponse,
} from '@app/shared';

import { EmployeeService } from './employee.service';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class EmployeeController {
    constructor(
        private readonly employeeService: EmployeeService,
    ) { }

    @Get('profile')
    @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
    async getProfile(@Request() req: { user: UserPayload }) {
        const employee = await this.employeeService.findOne(req.user.sub);
        return UserMapper.toResponseDto(employee);
    }

    @Get()
    async findAll(@Query() query: GetAllEmployeesDto) {
        const { data, total } = await this.employeeService.findAll(query);
        return buildPaginatedResponse(
            data.map((user) => UserMapper.toResponseDto(user)),
            total,
            query.page || 1,
            query.limit || 10
        );
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const employee = await this.employeeService.findOne(id);
        return UserMapper.toResponseDto(employee);
    }

    @Post()
    async create(@Body() createDto: CreateEmployeeDto) {
        const employee = await this.employeeService.create(createDto);
        return UserMapper.toResponseDto(employee);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
        const employee = await this.employeeService.update(id, updateDto);
        return UserMapper.toResponseDto(employee);
    }

    @Patch(':id')
    async patch(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
        return this.employeeService.update(id, updateDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.employeeService.remove(id);
    }
}
