import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from '../utils/password.utils';
import { UserValidator } from '../utils/user.validator';
import { UpdateEmployeeDto } from '../dto/employee/employee.dto';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../dto/auth/auth.dto';
import { users } from '@prisma/client';
import { calculateSkip, EMPLOYEE_SELECT } from '../utils/query.utils';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllWithCount(params: {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
  }) {
    const where = this.buildWhere(params);
    return Promise.all([
      this.prisma.users.findMany({
        where,
        select: EMPLOYEE_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: calculateSkip(params.page, params.limit),
        take: params.limit,
      }),
      this.prisma.users.count({ where }),
    ]);
  }

  async findByIdOrThrow(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: EMPLOYEE_SELECT,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<users | null> {
    return this.prisma.users.findUnique({ where: { email } });
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }) {
    await UserValidator.validateEmailDoesNotExist(this.prisma, data.email);

    const hashedPassword = await hashPassword(data.password);

    return this.prisma.users.create({
      data: {
        id: uuidv4(),
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || UserRole.EMPLOYEE,
      },
      select: EMPLOYEE_SELECT,
    });
  }

  async update(id: string, data: UpdateEmployeeDto) {
    const existingUser = await this.findByIdOrThrow(id);

    if (data.email && data.email !== existingUser.email) {
      await UserValidator.validateEmailDoesNotExist(this.prisma, data.email);
    }

    const updateData: Record<string, unknown> = {};
    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.password) updateData.password = await hashPassword(data.password);

    return this.prisma.users.update({
      where: { id },
      data: updateData,
      select: EMPLOYEE_SELECT,
    });
  }

  async remove(id: string) {
    await this.findByIdOrThrow(id);
    return this.prisma.users.delete({ where: { id } });
  }

  private buildWhere(params: {
    search?: string;
    role?: UserRole;
  }): Record<string, unknown> {
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
}
