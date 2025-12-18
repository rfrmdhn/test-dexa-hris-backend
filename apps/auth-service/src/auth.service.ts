import { Injectable, HttpStatus, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import {
    PrismaService,
    RegisterDto,
    LoginDto,
    LoginResponseDto,
    UserRole,
    hashPassword,
    comparePassword,
    UserMapper,
    UserValidator,
} from '@app/shared';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {


        await UserValidator.validateEmailDoesNotExist(this.prisma, registerDto.email);

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
            user: UserMapper.toResponseDto(user),
        };
    }

    async login(loginDto: LoginDto): Promise<LoginResponseDto> {
        const user = await this.prisma.users.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await comparePassword(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            access_token: accessToken,
            user: UserMapper.toResponseDto(user),
        };
    }
}

