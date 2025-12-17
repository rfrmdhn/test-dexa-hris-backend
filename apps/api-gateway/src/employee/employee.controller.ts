import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import {
    CreateEmployeeDto,
    UpdateEmployeeDto,
    GetAllEmployeesDto,
    UserRole,
    PaginatedEmployeesResponseDto,
    EmployeeResponseDto,
    sendToService,
} from '@app/shared';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class EmployeeController {
    constructor(
        @Inject('AUTH_SERVICE') private readonly client: ClientProxy,
    ) { }

    @Get()
    async findAll(@Query() query: GetAllEmployeesDto) {
        return sendToService<PaginatedEmployeesResponseDto>(
            this.client, 'employee.find-all', query
        );
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return sendToService<EmployeeResponseDto>(
            this.client, 'employee.find-one', { id }
        );
    }

    @Post()
    async create(@Body() createDto: CreateEmployeeDto) {
        return sendToService<EmployeeResponseDto>(
            this.client, 'employee.create', createDto
        );
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
        return sendToService<EmployeeResponseDto>(
            this.client, 'employee.update', { id, updateDto }
        );
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return sendToService<{ message: string }>(
            this.client, 'employee.remove', { id }
        );
    }
}

