import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  FALLBACK_ERROR_MESSAGE,
  REQUEST_ID_HEADER,
} from '../constants/http.constants';
import { ApiResponse } from '../interfaces/api-response.interface';
import { RequestWithId } from '../interfaces/http-request.interface';

type ExceptionResponseBody = {
  code?: string;
  error?: string;
  message?: string | string[];
  details?: unknown;
};

type NormalizedException = {
  code: string;
  message: string;
  details?: unknown;
};

const INTERNAL_SERVER_ERROR_STATUS = 500;

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithId>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const requestId = getRequestId(request);
    const path = request.originalUrl ?? request.url;
    const normalizedException = normalizeException(exception, status);
    const responseBody: ApiResponse = {
      success: false,
      statusCode: status,
      message: normalizedException.message,
      error: normalizedException,
      timestamp: new Date().toISOString(),
      path,
      requestId,
    };

    this.logException(exception, request, status, normalizedException);

    response.setHeader(REQUEST_ID_HEADER, requestId);
    response.status(status).json(responseBody);
  }

  private logException(
    exception: unknown,
    request: Request,
    status: number,
    normalizedException: NormalizedException,
  ): void {
    const logPayload = JSON.stringify({
      requestId: getRequestId(request as RequestWithId),
      method: request.method,
      path: request.originalUrl ?? request.url,
      statusCode: status,
      errorCode: normalizedException.code,
      message: normalizedException.message,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    if (status >= INTERNAL_SERVER_ERROR_STATUS) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(logPayload, stack);
      return;
    }

    this.logger.warn(logPayload);
  }
}

function normalizeException(
  exception: unknown,
  status: number,
): NormalizedException {
  if (exception instanceof HttpException) {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return {
        code: getErrorCode(status),
        message: exceptionResponse,
      };
    }

    if (isExceptionResponseBody(exceptionResponse)) {
      const message = normalizeMessage(exceptionResponse);
      const details = getErrorDetails(exceptionResponse);

      return {
        code: normalizeErrorCode(
          exceptionResponse.code ??
            exceptionResponse.error ??
            getErrorCode(status),
        ),
        message,
        ...(details === undefined ? {} : { details }),
      };
    }
  }

  return {
    code: getErrorCode(status),
    message:
      status >= INTERNAL_SERVER_ERROR_STATUS
        ? FALLBACK_ERROR_MESSAGE
        : getErrorMessage(exception),
  };
}

function isExceptionResponseBody(
  exceptionResponse: unknown,
): exceptionResponse is ExceptionResponseBody {
  return typeof exceptionResponse === 'object' && exceptionResponse !== null;
}

function normalizeMessage(exceptionResponse: ExceptionResponseBody): string {
  if (Array.isArray(exceptionResponse.message)) {
    return exceptionResponse.error ?? 'Validation failed';
  }

  return (
    exceptionResponse.message ??
    exceptionResponse.error ??
    FALLBACK_ERROR_MESSAGE
  );
}

function getErrorDetails(exceptionResponse: ExceptionResponseBody): unknown {
  if (exceptionResponse.details !== undefined) {
    return exceptionResponse.details;
  }

  if (Array.isArray(exceptionResponse.message)) {
    return exceptionResponse.message;
  }

  return undefined;
}

function getErrorMessage(exception: unknown): string {
  if (exception instanceof Error && exception.message) {
    return exception.message;
  }

  return FALLBACK_ERROR_MESSAGE;
}

function getErrorCode(status: number): string {
  return HttpStatus[status] ?? 'UNKNOWN_ERROR';
}

function normalizeErrorCode(errorCode: string): string {
  return errorCode
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function getRequestId(request: RequestWithId): string {
  const headerValue = request.headers[REQUEST_ID_HEADER];
  const requestId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  return request.requestId ?? requestId ?? 'unknown';
}
