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
                let responseData = data;
                let meta = undefined;

                // Handle Paginated Response
                if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
                    responseData = data.data;
                    meta = data.meta;
                }
                // Handle Wrapped Response (without meta)
                else if (data?.data) {
                    responseData = data.data;
                }

                if (responseData && typeof responseData === 'object' && 'message' in responseData) {
                    const { message: _, ...rest } = responseData;
                    responseData = rest;
                }

                return {
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    message,
                    data: responseData,
                    meta,
                    success: true,
                };
            }),
        );
    }
}
