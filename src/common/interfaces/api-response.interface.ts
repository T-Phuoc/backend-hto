export interface ApiResponse<TData = unknown> {
  success: boolean;
  data?: TData;
  message?: string;
  error?: ApiError;
  statusCode?: number;
  timestamp: string;
  path: string;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
