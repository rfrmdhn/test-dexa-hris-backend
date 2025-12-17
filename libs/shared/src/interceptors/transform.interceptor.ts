import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse } from '../interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, BaseResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<BaseResponse<T>> {
        return next.handle().pipe(
            map((data) => ({
                statusCode: context.switchToHttp().getResponse().statusCode,
                message: data?.message || 'Success',
                data: data?.data ? data.data : data,
                success: true
            })),
        );
    }
}
