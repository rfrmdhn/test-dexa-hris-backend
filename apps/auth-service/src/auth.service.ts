import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';
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
        // Check if user already exists
        const existingUser = await this.prisma.users.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            // In TCP/Microservices, RpcException is often preferred, but HttpException also works 
            // if the Gateway uses proper exception filters.
            // We'll stick to RpcException for clear microservice signaling, 
            // or standard HttpException if we assume standard serialization.
            // Let's use RpcException for "Distributed" clarity.
            throw new RpcException({ message: 'User with this email already exists', statusCode: HttpStatus.CONFLICT });
        }

        // Hash password
        const hashedPassword = await hashPassword(registerDto.password);

        // Generate UUID and create user
        const userId = uuidv4();
        const user = await this.prisma.users.create({
            data: {
                id: userId,
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
        // Find user by email
        const user = await this.prisma.users.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new RpcException({ message: 'Invalid credentials', statusCode: HttpStatus.UNAUTHORIZED });
        }

        // Compare passwords
        const isPasswordValid = await comparePassword(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new RpcException({ message: 'Invalid credentials', statusCode: HttpStatus.UNAUTHORIZED });
        }

        // Generate JWT token
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
