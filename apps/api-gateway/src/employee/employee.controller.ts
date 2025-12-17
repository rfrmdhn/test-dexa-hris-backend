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
import { firstValueFrom } from 'rxjs';

import {
    CreateEmployeeDto,
    UpdateEmployeeDto,
    GetAllEmployeesDto,
    UserRole,
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
        return firstValueFrom(this.client.send('employee.find-all', query));
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return firstValueFrom(this.client.send('employee.find-one', { id }));
    }

    @Post()
    async create(@Body() createDto: CreateEmployeeDto) {
        return firstValueFrom(this.client.send('employee.create', createDto));
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
        return firstValueFrom(this.client.send('employee.update', { id, updateDto }));
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return firstValueFrom(this.client.send('employee.remove', { id }));
    }
}
