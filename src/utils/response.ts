export interface SuccessResponse<T = unknown> {
  data: T;
  message: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export function success<T>(data: T, message: string): SuccessResponse<T> {
  return { data, message };
}

export function error(errorName: string, message: string, details?: Array<{ field: string; message: string }>): ErrorResponse {
  return { error: errorName, message, details };
}
