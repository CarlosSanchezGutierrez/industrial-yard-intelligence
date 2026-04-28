import type { TenantId, TerminalId } from "@iyi/kernel";
import {
  validateSyncBatch,
  type SyncBatch,
  type SyncBatchResult,
  type SyncEventResult
} from "@iyi/sync-protocol";
import { reconcileSyncEvent, type SyncCoreContext } from "./decision.js";

export interface ReconcileSyncBatchInput<TPayload = Record<string, unknown>> {
  readonly batch: SyncBatch<TPayload>;
  readonly context: SyncCoreContext;
  readonly receivedAtEdge: string;
}

function createBatchResult(
  batchId: string,
  tenantId: TenantId,
  receivedAtEdge: string,
  results: readonly SyncEventResult[],
  terminalId?: TerminalId
): SyncBatchResult {
  const result: {
    batchId: string;
    tenantId: TenantId;
    terminalId?: TerminalId;
    receivedAtEdge: string;
    results: readonly SyncEventResult[];
  } = {
    batchId,
    tenantId,
    receivedAtEdge,
    results
  };

  if (terminalId !== undefined) {
    result.terminalId = terminalId;
  }

  return result;
}

export function reconcileSyncBatch<TPayload>(
  input: ReconcileSyncBatchInput<TPayload>
): SyncBatchResult {
  const batchValidation = validateSyncBatch(input.batch);

  if (!batchValidation.ok) {
    return createBatchResult(
      input.batch.batchId,
      input.batch.tenantId,
      input.receivedAtEdge,
      [],
      input.batch.terminalId
    );
  }

  const results = input.batch.events.map((event) =>
    reconcileSyncEvent({
      event,
      context: input.context,
      acceptedAtEdge: input.receivedAtEdge
    })
  );

  return createBatchResult(
    input.batch.batchId,
    input.batch.tenantId,
    input.receivedAtEdge,
    results,
    input.batch.terminalId
  );
}