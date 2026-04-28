import { describe, expect, it } from "vitest";
import {
  determineSyncEventStatus,
  hasBlockingSyncIssues,
  reconcileSyncBatch,
  reconcileSyncEvent,
  summarizeSyncBatchResult
} from "./index.js";
import type { SyncBatch, SyncEventEnvelope } from "@iyi/sync-protocol";
import {
  asAggregateId,
  asDeviceId,
  asEventId,
  asSyncEnvelopeId,
  asTenantId,
  asTerminalId,
  asUserId
} from "@iyi/kernel";

describe("@iyi/sync-core", () => {
  const tenantId = asTenantId("tenant_cooper_tsmith");
  const otherTenantId = asTenantId("tenant_other");
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
      name: "Simulated stockpile",
      expectedAggregateVersion: 0
    }
  };

  it("accepts valid events for the expected tenant", () => {
    const result = reconcileSyncEvent({
      event: envelope,
      acceptedAtEdge: "2026-04-28T12:00:01.000Z",
      context: {
        expectedTenantId: tenantId,
        knownEventIds: new Set(),
        knownIdempotencyKeys: new Set(),
        aggregateVersions: new Map([["stockpile:stockpile_001", 0]])
      }
    });

    expect(result.status).toBe("accepted");
    expect(result.acceptedAtEdge).toBe("2026-04-28T12:00:01.000Z");
  });

  it("detects tenant mismatch conflicts", () => {
    const status = determineSyncEventStatus(
      {
        ...envelope,
        tenantId: otherTenantId
      },
      {
        expectedTenantId: tenantId,
        knownEventIds: new Set(),
        knownIdempotencyKeys: new Set()
      }
    );

    expect(status.status).toBe("conflict");
    expect(status.conflict?.conflictType).toBe("tenant_mismatch");
  });

  it("detects duplicate events", () => {
    const status = determineSyncEventStatus(envelope, {
      expectedTenantId: tenantId,
      knownEventIds: new Set([String(eventId)]),
      knownIdempotencyKeys: new Set()
    });

    expect(status.status).toBe("duplicate");
  });

  it("detects stale aggregate version conflicts", () => {
    const status = determineSyncEventStatus(envelope, {
      expectedTenantId: tenantId,
      knownEventIds: new Set(),
      knownIdempotencyKeys: new Set(),
      aggregateVersions: new Map([["stockpile:stockpile_001", 2]])
    });

    expect(status.status).toBe("conflict");
    expect(status.conflict?.conflictType).toBe("status_conflict");
  });

  it("reconciles sync batches", () => {
    const batch: SyncBatch = {
      batchId: "batch_001",
      tenantId,
      terminalId,
      deviceId,
      createdAtClient: "2026-04-28T12:00:00.000Z",
      events: [envelope]
    };

    const result = reconcileSyncBatch({
      batch,
      receivedAtEdge: "2026-04-28T12:00:01.000Z",
      context: {
        expectedTenantId: tenantId,
        knownEventIds: new Set(),
        knownIdempotencyKeys: new Set(),
        aggregateVersions: new Map([["stockpile:stockpile_001", 0]])
      }
    });

    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.status).toBe("accepted");
  });

  it("summarizes sync results", () => {
    const batch: SyncBatch = {
      batchId: "batch_001",
      tenantId,
      terminalId,
      deviceId,
      createdAtClient: "2026-04-28T12:00:00.000Z",
      events: [envelope]
    };

    const result = reconcileSyncBatch({
      batch,
      receivedAtEdge: "2026-04-28T12:00:01.000Z",
      context: {
        expectedTenantId: tenantId,
        knownEventIds: new Set(),
        knownIdempotencyKeys: new Set(),
        aggregateVersions: new Map([["stockpile:stockpile_001", 0]])
      }
    });

    const summary = summarizeSyncBatchResult(result);

    expect(summary.accepted).toBe(1);
    expect(summary.total).toBe(1);
    expect(hasBlockingSyncIssues(summary)).toBe(false);
  });
});