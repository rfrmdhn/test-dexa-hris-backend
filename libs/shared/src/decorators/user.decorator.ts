
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../dto/auth/auth.dto';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): UserPayload => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
