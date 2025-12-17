import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { RpcException } from '@nestjs/microservices';

import {
    PrismaService,
    RegisterDto,
    LoginDto,
    LoginResponseDto,
    UserRole,
    hashPassword,
    comparePassword,
} from '@app/shared';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.prisma.users.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new RpcException({
                message: 'User with this email already exists',
                statusCode: HttpStatus.CONFLICT
            });
        }

        const hashedPassword = await hashPassword(registerDto.password);

        const user = await this.prisma.users.create({
            data: {
                id: uuidv4(),
                email: registerDto.email,
                password: hashedPassword,
                name: registerDto.name,
                role: registerDto.role || 'EMPLOYEE',
            },
        });

        return {
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async login(loginDto: LoginDto): Promise<LoginResponseDto> {
        const user = await this.prisma.users.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new RpcException({ message: 'Invalid credentials', statusCode: HttpStatus.UNAUTHORIZED });
        }

        const isPasswordValid = await comparePassword(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new RpcException({ message: 'Invalid credentials', statusCode: HttpStatus.UNAUTHORIZED });
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            access_token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role as UserRole,
            },
        };
    }
}

