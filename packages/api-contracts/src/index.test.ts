import { describe, expect, it } from "vitest";
import {
  createApiError,
  createApiFailure,
  createApiSuccess,
  createHealthCheckResponse,
  createSyncSubmitResponse,
  toTenantHeaders,
  validatePaginationLimit,
  type SyncSubmitRequest
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
import type { SyncBatch, SyncBatchResult, SyncEventEnvelope } from "@iyi/sync-protocol";

describe("@iyi/api-contracts", () => {
  const tenantId = asTenantId("tenant_cooper_tsmith");
  const terminalId = asTerminalId("terminal_altamira");
  const userId = asUserId("user_operator_001");
  const deviceId = asDeviceId("device_android_001");
  const eventId = asEventId("event_001");

  it("creates successful API responses", () => {
    const response = createApiSuccess(
      {
        message: "ok"
      },
      "request_001",
      "2026-04-28T12:00:00.000Z"
    );

    expect(response.ok).toBe(true);
    expect(response.data.message).toBe("ok");
  });

  it("creates failed API responses", () => {
    const error = createApiError("tenant_mismatch", "Tenant context is invalid.");
    const response = createApiFailure(error, "request_001", "2026-04-28T12:00:00.000Z");

    expect(response.ok).toBe(false);
    expect(response.error.code).toBe("tenant_mismatch");
  });

  it("validates pagination limits", () => {
    expect(validatePaginationLimit(50, 100).ok).toBe(true);

    const result = validatePaginationLimit(101, 100);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_limit");
    }
  });

  it("creates tenant headers", () => {
    const headers = toTenantHeaders({
      tenantId,
      terminalId,
      userId,
      deviceId
    });

    expect(headers["x-tenant-id"]).toBe("tenant_cooper_tsmith");
    expect(headers["x-terminal-id"]).toBe("terminal_altamira");
    expect(headers["x-user-id"]).toBe("user_operator_001");
    expect(headers["x-device-id"]).toBe("device_android_001");
  });

  it("creates health check responses", () => {
    const health = createHealthCheckResponse({
      service: "edge",
      status: "ok",
      timestamp: "2026-04-28T12:00:00.000Z",
      version: "0.0.0"
    });

    expect(health.service).toBe("edge");
    expect(health.status).toBe("ok");
  });

  it("creates sync submit responses", () => {
    const result: SyncBatchResult = {
      batchId: "batch_001",
      tenantId,
      terminalId,
      receivedAtEdge: "2026-04-28T12:00:01.000Z",
      results: [
        {
          eventId,
          tenantId,
          terminalId,
          status: "accepted",
          acceptedAtEdge: "2026-04-28T12:00:01.000Z"
        }
      ]
    };

    expect(createSyncSubmitResponse(result).result.results[0]?.status).toBe("accepted");
  });

  it("supports sync submit request contracts", () => {
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

    const batch: SyncBatch = {
      batchId: "batch_001",
      tenantId,
      terminalId,
      deviceId,
      createdAtClient: "2026-04-28T12:00:00.000Z",
      events: [envelope]
    };

    const request: SyncSubmitRequest = {
      context: {
        tenantId,
        terminalId,
        userId,
        deviceId
      },
      batch
    };

    expect(request.batch.events).toHaveLength(1);
  });
});