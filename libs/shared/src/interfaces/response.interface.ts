export interface BaseResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    statusCode?: number;
}

export function createResponse<T>(data: T, message = 'Success', statusCode = 200): BaseResponse<T> {
    return {
        success: true,
        message,
        data,
        statusCode,
    };
}
