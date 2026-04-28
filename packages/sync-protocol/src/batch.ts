import {
  err,
  ok,
  type Result,
  type TenantId,
  type TerminalId
} from "@iyi/kernel";
import type { SyncEventEnvelope } from "./envelope.js";
import { validateSyncEventEnvelope } from "./envelope.js";

export interface SyncBatch<TPayload = Record<string, unknown>> {
  readonly batchId: string;
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
  readonly deviceId: string;
  readonly createdAtClient: string;
  readonly events: readonly SyncEventEnvelope<TPayload>[];
}

export type SyncBatchValidationError =
  | "missing_batch_id"
  | "missing_device_id"
  | "empty_batch"
  | "tenant_mismatch"
  | "invalid_event_envelope";

export function validateSyncBatch<TPayload>(
  batch: SyncBatch<TPayload>
): Result<true, SyncBatchValidationError> {
  if (batch.batchId.trim().length === 0) {
    return err("missing_batch_id", "Sync batch must include a batch id.");
  }

  if (batch.deviceId.trim().length === 0) {
    return err("missing_device_id", "Sync batch must include a device id.");
  }

  if (batch.events.length === 0) {
    return err("empty_batch", "Sync batch must include at least one event.");
  }

  for (const event of batch.events) {
    if (event.tenantId !== batch.tenantId) {
      return err("tenant_mismatch", "All sync events must match the batch tenant id.");
    }

    const envelopeResult = validateSyncEventEnvelope(event);

    if (!envelopeResult.ok) {
      return err(
        "invalid_event_envelope",
        `Invalid sync event envelope: ${envelopeResult.message}`
      );
    }
  }

  return ok(true);
}