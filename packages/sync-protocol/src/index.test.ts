import { describe, expect, it } from "vitest";
import {
  buildIdempotencyKey,
  canRetryOutboxRecord,
  getAcceptedEventCount,
  hasConflicts,
  isTerminalOutboxStatus,
  validateSyncBatch,
  validateSyncEventEnvelope,
  type SyncBatch,
  type SyncBatchResult,
  type SyncEventEnvelope
} from "./index.js";
import {
  asAggregateId,
  asDeviceId,
  asEventId,
  asSyncEnvelopeId,
  asTenantId,
  asTerminalId,
  asUserId
} from "@iyi/kernel";

describe("@iyi/sync-protocol", () => {
  const tenantId = asTenantId("tenant_cooper_tsmith");
  const terminalId = asTerminalId("terminal_altamira");
  const deviceId = asDeviceId("device_android_001");
  const userId = asUserId("user_operator_001");
  const eventId = asEventId("event_001");

  const envelope: SyncEventEnvelope = {
    syncEnvelopeId: asSyncEnvelopeId("sync_001"),
    eventId,
    eventType: "STOCKPILE_CREATED",
    eventVersion: 1,
    tenantId,
    terminalId,
    userId,
    deviceId,
    sourceRuntime: "mobile",
    createdAtClient: "2026-04-28T12:00:00.000Z",
    localSequence: 1,
    idempotencyKey: "tenant_cooper_tsmith:device_android_001:1:event_001",
    aggregateType: "stockpile",
    aggregateId: asAggregateId("stockpile_001"),
    validationState: "operational",
    confidenceLevel: "approximate",
    payload: {
      name: "Simulated stockpile"
    }
  };

  it("validates sync event envelopes", () => {
    expect(validateSyncEventEnvelope(envelope).ok).toBe(true);
  });

  it("builds stable idempotency keys", () => {
    expect(
      buildIdempotencyKey({
        tenantId,
        deviceId,
        localSequence: 1,
        eventId
      })
    ).toBe("tenant_cooper_tsmith:device_android_001:1:event_001");
  });

  it("rejects empty sync batches", () => {
    const batch: SyncBatch = {
      batchId: "batch_001",
      tenantId,
      terminalId,
      deviceId,
      createdAtClient: "2026-04-28T12:00:00.000Z",
      events: []
    };

    const result = validateSyncBatch(batch);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("empty_batch");
    }
  });

  it("validates sync batches with matching tenant context", () => {
    const batch: SyncBatch = {
      batchId: "batch_001",
      tenantId,
      terminalId,
      deviceId,
      createdAtClient: "2026-04-28T12:00:00.000Z",
      events: [envelope]
    };

    expect(validateSyncBatch(batch).ok).toBe(true);
  });

  it("identifies retryable outbox records", () => {
    expect(
      canRetryOutboxRecord(
        {
          outboxId: "outbox_001",
          eventId,
          tenantId,
          terminalId,
          deviceId,
          userId,
          envelope,
          localSequence: 1,
          status: "failed",
          retryCount: 1,
          createdAtClient: "2026-04-28T12:00:00.000Z"
        },
        3
      )
    ).toBe(true);
  });

  it("identifies terminal outbox statuses", () => {
    expect(isTerminalOutboxStatus("accepted")).toBe(true);
    expect(isTerminalOutboxStatus("pending")).toBe(false);
  });

  it("detects conflicts in sync batch results", () => {
    const batchResult: SyncBatchResult = {
      batchId: "batch_001",
      tenantId,
      terminalId,
      receivedAtEdge: "2026-04-28T12:00:01.000Z",
      results: [
        {
          eventId,
          tenantId,
          terminalId,
          status: "conflict",
          conflict: {
            conflictType: "geometry_conflict",
            message: "Geometry changed since mobile last synced."
          }
        }
      ]
    };

    expect(hasConflicts(batchResult)).toBe(true);
    expect(getAcceptedEventCount(batchResult)).toBe(0);
  });
});