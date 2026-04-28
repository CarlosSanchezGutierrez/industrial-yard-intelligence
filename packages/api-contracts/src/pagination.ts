import { err, ok, type Result } from "@iyi/kernel";

export interface CursorPaginationRequest {
  readonly cursor?: string;
  readonly limit: number;
}

export interface CursorPaginationResponse {
  readonly nextCursor?: string;
  readonly hasMore: boolean;
}

export type PaginationValidationError = "invalid_limit";

export function validatePaginationLimit(
  limit: number,
  maxLimit: number
): Result<number, PaginationValidationError> {
  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
    return err(
      "invalid_limit",
      `Pagination limit must be an integer between 1 and ${maxLimit}.`
    );
  }

  return ok(limit);
}