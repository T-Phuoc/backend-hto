import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { REQUEST_ID_HEADER } from '../constants/http.constants';
import { ApiResponse } from '../interfaces/api-response.interface';
import { RequestWithId } from '../interfaces/http-request.interface';

@Injectable()
export class ResponseInterceptor<TData> implements NestInterceptor<
  TData,
  ApiResponse<TData>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<TData>,
  ): Observable<ApiResponse<TData>> {
    const request = context.switchToHttp().getRequest<RequestWithId>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: getRequestId(request),
      })),
    );
  }
}

function getRequestId(request: RequestWithId): string {
  const headerValue = request.headers[REQUEST_ID_HEADER];
  const requestId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  return request.requestId ?? requestId ?? 'unknown';
}
