export const apiErrorCodes = [
  "bad_request",
  "unauthorized",
  "forbidden",
  "not_found",
  "conflict",
  "validation_error",
  "tenant_mismatch",
  "sync_conflict",
  "internal_error",
  "service_unavailable"
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

export interface ApiError {
  readonly code: ApiErrorCode;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export function createApiError(
  code: ApiErrorCode,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return {
    code,
    message,
    ...(details !== undefined ? { details } : {})
  };
}