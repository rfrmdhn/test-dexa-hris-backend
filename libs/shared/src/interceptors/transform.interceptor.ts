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
            map((data) => {
                const message = data?.message || 'Success';

                // Extract the actual data, removing message from it if present
                let responseData = data?.data ? data.data : data;

                // If responseData has a message property, remove it to avoid duplication
                if (responseData && typeof responseData === 'object' && 'message' in responseData) {
                    const { message: _, ...rest } = responseData;
                    responseData = rest;
                }

                return {
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    message,
                    data: responseData,
                    success: true,
                };
            }),
        );
    }
}
