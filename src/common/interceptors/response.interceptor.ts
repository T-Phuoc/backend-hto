import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<TData>
  implements NestInterceptor<TData, ApiResponse<TData>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<TData>,
  ): Observable<ApiResponse<TData>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
