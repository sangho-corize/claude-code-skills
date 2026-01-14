import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If already has structure with data/meta, return as is
        if (data && typeof data === 'object' && 'data' in data) {
          return data;
        }
        // Otherwise, return data as is
        return data;
      }),
    );
  }
}
