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
        return this.employeeService.findOne(req.user.sub);
    }

    @Get()
    async findAll(@Query() query: GetAllEmployeesDto) {
        return this.employeeService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.employeeService.findOne(id);
    }

    @Post()
    async create(@Body() createDto: CreateEmployeeDto) {
        return this.employeeService.create(createDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
        return this.employeeService.update(id, updateDto);
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
