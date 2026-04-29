import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getConflictResolutions,
  getEdgeStoreFilePath,
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

function createSyncRequest(
  eventSuffix = "001",
  idempotencySuffix = eventSuffix,
  expectedAggregateVersion = 0
): SyncSubmitRequest {
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
          idempotencyKey: `tenant_cooper_tsmith:device_android_001:1:event_${idempotencySuffix}`,
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

function submitSyncEvent(
  eventSuffix = "001",
  idempotencySuffix = eventSuffix,
  expectedAggregateVersion = 0
): void {
  routeEdgeRequest({
    method: "POST",
    pathname: "/sync/batches",
    requestId: `request_submit_${eventSuffix}`,
    now: "2026-04-28T12:00:01.000Z",
    body: createSyncRequest(eventSuffix, idempotencySuffix, expectedAggregateVersion)
  });
}

function createConflict(): void {
  submitSyncEvent("001", "001", 0);

  routeEdgeRequest({
    method: "POST",
    pathname: "/sync/batches",
    requestId: "request_conflict",
    now: "2026-04-28T12:00:02.000Z",
    body: createSyncRequest("002", "002", 0)
  });
}

describe("@iyi/edge", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
  });

  it("returns an edge manifest at root", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/",
      requestId: "request_001",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        service: string;
        internetRequired: boolean;
        persistence: string;
        storeFile: string;
        conflictResolutionFile: string;
        routes: readonly {
          path: string;
        }[];
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.service).toBe("Industrial Yard Intelligence Edge");
    expect(body.data.internetRequired).toBe(false);
    expect(body.data.persistence).toBe("json_file_development_store");
    expect(body.data.storeFile).toContain("sync-store.json");
    expect(body.data.conflictResolutionFile).toContain("conflict-resolutions.json");
    expect(body.data.routes.some((route) => route.path === "/sync/export")).toBe(true);
    expect(body.data.routes.some((route) => route.path === "/sync/import")).toBe(true);
    expect(body.data.routes.some((route) => route.path === "/sync/conflicts/resolve")).toBe(true);
    expect(body.data.routes.some((route) => route.path === "/sync/conflicts/resolutions")).toBe(true);
  });

  it("reconciles, stores sync batches, writes JSON file, and exports aggregate versions", () => {
    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/batches",
      requestId: "request_001",
      now: "2026-04-28T12:00:01.000Z",
      body: createSyncRequest("001")
    });

    const responseBody = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        result: {
          results: readonly {
            status: string;
          }[];
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(responseBody.ok).toBe(true);
    expect(responseBody.data.result.results[0]?.status).toBe("accepted");
    expect(existsSync(getEdgeStoreFilePath())).toBe(true);

    const exportResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/sync/export",
      requestId: "request_export",
      now: "2026-04-28T12:00:03.000Z"
    });

    const exportBody = JSON.parse(exportResponse.body) as {
      data: {
        store: {
          aggregateVersions: Record<string, number>;
        };
      };
    };

    expect(exportBody.data.store.aggregateVersions["stockpile:stockpile_001"]).toBe(1);
  });

  it("detects duplicate sync events by event id", () => {
    submitSyncEvent("001");

    const duplicateResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/batches",
      requestId: "request_002",
      now: "2026-04-28T12:00:02.000Z",
      body: createSyncRequest("001")
    });

    const body = JSON.parse(duplicateResponse.body) as {
      ok: boolean;
      data: {
        result: {
          results: readonly {
            status: string;
          }[];
        };
      };
    };

    expect(body.ok).toBe(true);
    expect(body.data.result.results[0]?.status).toBe("duplicate");
  });

  it("detects duplicate sync events by idempotency key", () => {
    submitSyncEvent("001", "same_idempotency");

    const duplicateResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/batches",
      requestId: "request_002",
      now: "2026-04-28T12:00:02.000Z",
      body: createSyncRequest("002", "same_idempotency")
    });

    const body = JSON.parse(duplicateResponse.body) as {
      ok: boolean;
      data: {
        result: {
          results: readonly {
            status: string;
          }[];
        };
      };
    };

    expect(body.ok).toBe(true);
    expect(body.data.result.results[0]?.status).toBe("duplicate");
  });

  it("detects stale aggregate version conflicts", () => {
    submitSyncEvent("001", "001", 0);

    const conflictResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/batches",
      requestId: "request_conflict",
      now: "2026-04-28T12:00:02.000Z",
      body: createSyncRequest("002", "002", 0)
    });

    const body = JSON.parse(conflictResponse.body) as {
      ok: boolean;
      data: {
        result: {
          results: readonly {
            status: string;
            conflict?: {
              conflictType: string;
            };
          }[];
        };
      };
    };

    expect(body.ok).toBe(true);
    expect(body.data.result.results[0]?.status).toBe("conflict");
    expect(body.data.result.results[0]?.conflict?.conflictType).toBe("status_conflict");
  });

  it("lists empty conflict resolutions before supervisor review", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/sync/conflicts/resolutions",
      requestId: "request_resolutions",
      now: "2026-04-28T12:00:03.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        resolutions: readonly unknown[];
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.resolutions).toHaveLength(0);
  });

  it("records supervisor conflict resolution", () => {
    createConflict();

    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/conflicts/resolve",
      requestId: "request_resolve",
      now: "2026-04-28T12:00:04.000Z",
      body: {
        eventId: "event_002",
        decision: "manual_action_required",
        note: "Reviewed in test.",
        resolvedByUserId: "user_supervisor_demo",
        resolvedByDeviceId: "device_web_supervisor"
      }
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        resolution: {
          eventId: string;
          decision: string;
          note: string;
          resolvedByUserId: string;
          resolvedByDeviceId: string;
          resolvedAt: string;
        };
        resolutions: readonly {
          eventId: string;
        }[];
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.resolution.eventId).toBe("event_002");
    expect(body.data.resolution.decision).toBe("manual_action_required");
    expect(body.data.resolution.note).toBe("Reviewed in test.");
    expect(body.data.resolution.resolvedByUserId).toBe("user_supervisor_demo");
    expect(body.data.resolution.resolvedByDeviceId).toBe("device_web_supervisor");
    expect(body.data.resolution.resolvedAt).toBe("2026-04-28T12:00:04.000Z");
    expect(body.data.resolutions).toHaveLength(1);
    expect(getConflictResolutions()).toHaveLength(1);
  });

  it("does not duplicate supervisor conflict resolution for same event", () => {
    createConflict();

    const firstResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/conflicts/resolve",
      requestId: "request_resolve_1",
      now: "2026-04-28T12:00:04.000Z",
      body: {
        eventId: "event_002",
        decision: "manual_action_required"
      }
    });

    const secondResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/conflicts/resolve",
      requestId: "request_resolve_2",
      now: "2026-04-28T12:00:05.000Z",
      body: {
        eventId: "event_002",
        decision: "accepted_after_review"
      }
    });

    const firstBody = JSON.parse(firstResponse.body) as {
      data: {
        resolution: {
          resolutionId: string;
        };
      };
    };

    const secondBody = JSON.parse(secondResponse.body) as {
      data: {
        resolution: {
          resolutionId: string;
        };
        resolutions: readonly unknown[];
      };
    };

    expect(secondResponse.statusCode).toBe(200);
    expect(secondBody.data.resolution.resolutionId).toBe(firstBody.data.resolution.resolutionId);
    expect(secondBody.data.resolutions).toHaveLength(1);
    expect(getConflictResolutions()).toHaveLength(1);
  });

  it("rejects conflict resolution without event id", () => {
    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/conflicts/resolve",
      requestId: "request_resolve_invalid",
      now: "2026-04-28T12:00:04.000Z",
      body: {
        decision: "manual_action_required"
      }
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      error: {
        code: string;
      };
    };

    expect(response.statusCode).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("bad_request");
  });

  it("exports sync store", () => {
    submitSyncEvent("001");

    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/sync/export",
      requestId: "request_export",
      now: "2026-04-28T12:00:03.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        store: {
          version: number;
          exportedAt: string;
          batches: readonly unknown[];
          events: readonly {
            eventId: string;
          }[];
          aggregateVersions: Record<string, number>;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.store.version).toBe(1);
    expect(body.data.store.exportedAt).toBe("2026-04-28T12:00:03.000Z");
    expect(body.data.store.batches).toHaveLength(1);
    expect(body.data.store.events[0]?.eventId).toBe("event_001");
    expect(body.data.store.aggregateVersions["stockpile:stockpile_001"]).toBe(1);
  });

  it("imports sync store and replaces current store", () => {
    submitSyncEvent("001");

    const exportResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/sync/export",
      requestId: "request_export",
      now: "2026-04-28T12:00:03.000Z"
    });

    const exported = JSON.parse(exportResponse.body) as {
      data: {
        store: unknown;
      };
    };

    resetEdgeMemoryStore();

    const importResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/import",
      requestId: "request_import",
      now: "2026-04-28T12:00:04.000Z",
      body: {
        replaceExistingStore: true,
        store: exported.data.store
      }
    });

    const importBody = JSON.parse(importResponse.body) as {
      ok: boolean;
      data: {
        importResult: {
          importedBatches: number;
          importedEvents: number;
          replacedExistingStore: boolean;
        };
        summary: {
          totalBatches: number;
          totalEvents: number;
        };
      };
    };

    expect(importResponse.statusCode).toBe(200);
    expect(importBody.ok).toBe(true);
    expect(importBody.data.importResult.importedBatches).toBe(1);
    expect(importBody.data.importResult.importedEvents).toBe(1);
    expect(importBody.data.importResult.replacedExistingStore).toBe(true);
    expect(importBody.data.summary.totalBatches).toBe(1);
    expect(importBody.data.summary.totalEvents).toBe(1);
  });

  it("rejects invalid sync store imports", () => {
    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/import",
      requestId: "request_import_invalid",
      now: "2026-04-28T12:00:04.000Z",
      body: {
        store: {
          version: 999,
          batches: [],
          events: []
        }
      }
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      error: {
        code: string;
      };
    };

    expect(response.statusCode).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("bad_request");
  });

  it("returns sync summary", () => {
    submitSyncEvent("001");

    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/sync/summary",
      requestId: "request_002",
      now: "2026-04-28T12:00:02.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        summary: {
          totalBatches: number;
          totalEvents: number;
          accepted: number;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.summary.totalBatches).toBe(1);
    expect(body.data.summary.totalEvents).toBe(1);
    expect(body.data.summary.accepted).toBe(1);
  });

  it("returns not found for unknown routes", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/unknown",
      requestId: "request_001",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      error: {
        code: string;
      };
    };

    expect(response.statusCode).toBe(404);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("not_found");
  });
});