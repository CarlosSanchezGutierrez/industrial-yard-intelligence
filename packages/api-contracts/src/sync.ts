import type { SyncBatch, SyncBatchResult } from "@iyi/sync-protocol";
import type { ApiTenantContext } from "./context.js";

export interface SyncSubmitRequest<TPayload = Record<string, unknown>> {
  readonly context: ApiTenantContext;
  readonly batch: SyncBatch<TPayload>;
}

export interface SyncSubmitResponse {
  readonly result: SyncBatchResult;
}

export function createSyncSubmitResponse(result: SyncBatchResult): SyncSubmitResponse {
  return {
    result
  };
}