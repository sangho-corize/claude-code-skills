import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: any = {
      statusCode: status,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || 'An error occurred',
      error: HttpStatus[status] || 'Error',
    };

    // Add details if available (validation errors)
    if (
      typeof exceptionResponse === 'object' &&
      (exceptionResponse as any).message
    ) {
      const messages = (exceptionResponse as any).message;
      if (Array.isArray(messages)) {
        errorResponse.details = messages.map((msg) => ({
          message: msg,
        }));
      }
    }

    response.status(status).json(errorResponse);
  }
}
