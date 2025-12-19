import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { HttpException, HttpStatus } from '@nestjs/common';

const DEFAULT_TIMEOUT = 30000;

export interface MicroserviceCallOptions {
  timeout?: number;
}

export async function sendToService<TResult = unknown, TInput = unknown>(
  client: ClientProxy,
  pattern: string,
  data: TInput,
  options: MicroserviceCallOptions = {},
): Promise<TResult> {
  const timeoutMs = options.timeout ?? DEFAULT_TIMEOUT;

  return firstValueFrom(
    client.send<TResult>(pattern, data).pipe(
      timeout(timeoutMs),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          throw new HttpException(
            {
              statusCode: HttpStatus.GATEWAY_TIMEOUT,
              message: `Service timeout after ${timeoutMs}ms`,
              pattern,
            },
            HttpStatus.GATEWAY_TIMEOUT,
          );
        }

        if (error?.message && error?.statusCode) {
          throw new HttpException(
            {
              statusCode: error.statusCode,
              message: error.message,
            },
            error.statusCode,
          );
        }

        if (error?.code === 'ECONNREFUSED') {
          throw new HttpException(
            {
              statusCode: HttpStatus.SERVICE_UNAVAILABLE,
              message: 'Service is unavailable',
              pattern,
            },
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }

        throw error;
      }),
    ),
  );
}

export function emitEvent<TInput = unknown>(
  client: ClientProxy,
  pattern: string,
  data: TInput,
): void {
  client.emit(pattern, data);
}

export async function batchSend<TResult = unknown>(
  calls: Array<{
    client: ClientProxy;
    pattern: string;
    data: unknown;
    options?: MicroserviceCallOptions;
  }>,
): Promise<TResult[]> {
  return Promise.all(
    calls.map((call) =>
      sendToService<TResult>(
        call.client,
        call.pattern,
        call.data,
        call.options,
      ),
    ),
  );
}
