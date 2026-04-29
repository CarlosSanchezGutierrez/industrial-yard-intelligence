import { beforeEach, describe, expect, it } from "vitest";
import {
  getAuditSummary,
  resetAuditStore,
  resetConflictResolutionStore,
  resetEdgeMemoryStore,
  routeEdgeRequest
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
import type { SyncSubmitRequest } from "@iyi/api-contracts";

function createSyncRequest(eventSuffix: string, expectedAggregateVersion: number): SyncSubmitRequest {
  const tenantId = asTenantId("tenant_cooper_tsmith");
  const terminalId = asTerminalId("terminal_altamira");
  const deviceId = asDeviceId("device_android_001");
  const userId = asUserId("user_operator_001");
  const eventId = asEventId(`event_${eventSuffix}`);

  return {
    context: {
      tenantId,
      terminalId,
      userId,
      deviceId
    },
    batch: {
      batchId: `batch_${eventSuffix}`,
      tenantId,
      terminalId,
      deviceId,
      createdAtClient: "2026-04-28T12:00:00.000Z",
      events: [
        {
          syncEnvelopeId: asSyncEnvelopeId(`sync_${eventSuffix}`),
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
          idempotencyKey: `tenant_cooper_tsmith:device_android_001:1:event_${eventSuffix}`,
          aggregateType: "stockpile",
          aggregateId: asAggregateId("stockpile_001"),
          validationState: "operational",
          confidenceLevel: "approximate",
          payload: {
            name: "Simulated stockpile",
            expectedAggregateVersion
          }
        }
      ]
    }
  };
}

function createConflict(): void {
  routeEdgeRequest({
    method: "POST",
    pathname: "/sync/batches",
    requestId: "request_accepted",
    now: "2026-04-28T12:00:01.000Z",
    body: createSyncRequest("001", 0)
  });

  routeEdgeRequest({
    method: "POST",
    pathname: "/sync/batches",
    requestId: "request_conflict",
    now: "2026-04-28T12:00:02.000Z",
    body: createSyncRequest("002", 0)
  });
}

describe("@iyi/edge audit integration", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
    resetAuditStore();
  });

  it("records audited hash-chain entry when resolving conflict", () => {
    createConflict();

    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/conflicts/resolve",
      requestId: "request_resolve",
      now: "2026-04-28T12:00:03.000Z",
      body: {
        eventId: "event_002",
        decision: "manual_action_required",
        note: "Reviewed with audit."
      }
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        auditEntry: {
          actionType: string;
          affectedEntityId: string;
          integrityHash: string;
        };
        auditSummary: {
          totalEntries: number;
          chainValid: boolean;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.auditEntry.actionType).toBe("SYNC_CONFLICT_REVIEWED");
    expect(body.data.auditEntry.affectedEntityId).toBe("event_002");
    expect(body.data.auditEntry.integrityHash).toHaveLength(64);
    expect(body.data.auditSummary.totalEntries).toBe(1);
    expect(body.data.auditSummary.chainValid).toBe(true);
    expect(getAuditSummary().totalEntries).toBe(1);
  });

  it("serves audit summary and verification endpoints", () => {
    createConflict();

    routeEdgeRequest({
      method: "POST",
      pathname: "/sync/conflicts/resolve",
      requestId: "request_resolve",
      now: "2026-04-28T12:00:03.000Z",
      body: {
        eventId: "event_002"
      }
    });

    const summaryResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/audit/summary",
      requestId: "request_audit_summary",
      now: "2026-04-28T12:00:04.000Z"
    });

    const verifyResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/audit/verify",
      requestId: "request_audit_verify",
      now: "2026-04-28T12:00:05.000Z"
    });

    const summaryBody = JSON.parse(summaryResponse.body) as {
      ok: boolean;
      data: {
        summary: {
          totalEntries: number;
          chainValid: boolean;
        };
      };
    };

    const verifyBody = JSON.parse(verifyResponse.body) as {
      ok: boolean;
      data: {
        verification: {
          ok: boolean;
          checkedEntries: number;
        };
      };
    };

    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryBody.ok).toBe(true);
    expect(summaryBody.data.summary.totalEntries).toBe(1);
    expect(summaryBody.data.summary.chainValid).toBe(true);

    expect(verifyResponse.statusCode).toBe(200);
    expect(verifyBody.ok).toBe(true);
    expect(verifyBody.data.verification.ok).toBe(true);
    expect(verifyBody.data.verification.checkedEntries).toBe(1);
  });

  it("includes audit store in offline backup export", () => {
    createConflict();

    routeEdgeRequest({
      method: "POST",
      pathname: "/sync/conflicts/resolve",
      requestId: "request_resolve",
      now: "2026-04-28T12:00:03.000Z",
      body: {
        eventId: "event_002"
      }
    });

    const exportResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/sync/export",
      requestId: "request_export",
      now: "2026-04-28T12:00:04.000Z"
    });

    const exportBody = JSON.parse(exportResponse.body) as {
      ok: boolean;
      data: {
        backup: {
          auditStore: {
            entries: readonly {
              integrityHash: string;
            }[];
          };
        };
      };
    };

    expect(exportResponse.statusCode).toBe(200);
    expect(exportBody.ok).toBe(true);
    expect(exportBody.data.backup.auditStore.entries).toHaveLength(1);
    expect(exportBody.data.backup.auditStore.entries[0]?.integrityHash).toHaveLength(64);
  });
});