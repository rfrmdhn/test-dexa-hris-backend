import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
    RegisterDto,
    LoginDto,
} from '@app/shared';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @MessagePattern('auth.register')
    async register(@Payload() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @MessagePattern('auth.login')
    async login(@Payload() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
