import {
    Controller,
    Post,
    Body,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
    RegisterDto,
    LoginDto,
    LoginResponseDto,
} from '@app/shared';

@Controller('auth')
export class AuthController {
    constructor(
        @Inject('AUTH_SERVICE') private readonly client: ClientProxy,
    ) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return firstValueFrom(this.client.send('auth.register', registerDto));
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
        return firstValueFrom(this.client.send('auth.login', loginDto));
    }
}
