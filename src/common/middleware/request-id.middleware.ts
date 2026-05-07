import { randomUUID } from 'crypto';
import { NextFunction, Response } from 'express';
import { REQUEST_ID_HEADER } from '../constants/http.constants';
import { RequestWithId } from '../interfaces/http-request.interface';

const MAX_REQUEST_ID_LENGTH = 128;

export function requestIdMiddleware(
  request: RequestWithId,
  response: Response,
  next: NextFunction,
): void {
  const requestId = getRequestId(request.headers[REQUEST_ID_HEADER]);

  request.requestId = requestId;
  response.setHeader(REQUEST_ID_HEADER, requestId);

  next();
}

function getRequestId(headerValue: string | string[] | undefined): string {
  const requestId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (typeof requestId !== 'string') {
    return randomUUID();
  }

  const normalizedRequestId = requestId.trim();

  if (
    normalizedRequestId.length === 0 ||
    normalizedRequestId.length > MAX_REQUEST_ID_LENGTH
  ) {
    return randomUUID();
  }

  return normalizedRequestId;
}
