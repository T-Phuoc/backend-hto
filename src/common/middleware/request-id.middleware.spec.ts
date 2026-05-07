import { Response } from 'express';
import { REQUEST_ID_HEADER } from '../constants/http.constants';
import { RequestWithId } from '../interfaces/http-request.interface';
import { requestIdMiddleware } from './request-id.middleware';

describe('requestIdMiddleware', () => {
  it('uses x-request-id from the incoming request', () => {
    const request = {
      headers: {
        [REQUEST_ID_HEADER]: ' req-123 ',
      },
    } as RequestWithId;
    const setHeader = jest.fn();
    const response = { setHeader } as unknown as Response;
    const next = jest.fn();

    requestIdMiddleware(request, response, next);

    expect(request.requestId).toBe('req-123');
    expect(setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, 'req-123');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('generates a request id when the incoming header is missing', () => {
    const request = { headers: {} } as RequestWithId;
    const setHeader = jest.fn();
    const response = { setHeader } as unknown as Response;
    const next = jest.fn();

    requestIdMiddleware(request, response, next);

    expect(request.requestId).toEqual(expect.any(String));
    expect(request.requestId).not.toHaveLength(0);
    expect(setHeader).toHaveBeenCalledWith(
      REQUEST_ID_HEADER,
      request.requestId,
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
});
