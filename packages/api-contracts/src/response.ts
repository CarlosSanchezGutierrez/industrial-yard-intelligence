import type { ApiError } from "./errors.js";

export interface ApiSuccess<TData> {
  readonly ok: true;
  readonly data: TData;
  readonly requestId: string;
  readonly timestamp: string;
}

export interface ApiFailure {
  readonly ok: false;
  readonly error: ApiError;
  readonly requestId: string;
  readonly timestamp: string;
}

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;

export function createApiSuccess<TData>(
  data: TData,
  requestId: string,
  timestamp: string
): ApiSuccess<TData> {
  return {
    ok: true,
    data,
    requestId,
    timestamp
  };
}

export function createApiFailure(
  error: ApiError,
  requestId: string,
  timestamp: string
): ApiFailure {
  return {
    ok: false,
    error,
    requestId,
    timestamp
  };
}