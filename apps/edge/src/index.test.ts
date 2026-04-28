import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { getEdgeStoreFilePath, resetEdgeMemoryStore, routeEdgeRequest } from "./index.js";
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

function createSyncRequest(eventSuffix = "001"): SyncSubmitRequest {
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
            name: "Simulated stockpile"
          }
        }
      ]
    }
  };
}

describe("@iyi/edge", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
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
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.service).toBe("Industrial Yard Intelligence Edge");
    expect(body.data.internetRequired).toBe(false);
    expect(body.data.persistence).toBe("json_file_development_store");
    expect(body.data.storeFile).toContain("sync-store.json");
  });

  it("reconciles, stores sync batches, and writes JSON file", () => {
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

    const eventsResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/sync/events",
      requestId: "request_002",
      now: "2026-04-28T12:00:02.000Z"
    });

    const eventsBody = JSON.parse(eventsResponse.body) as {
      ok: boolean;
      data: {
        events: readonly {
          eventId: string;
          status: string;
        }[];
      };
    };

    expect(eventsBody.ok).toBe(true);
    expect(eventsBody.data.events).toHaveLength(1);
    expect(eventsBody.data.events[0]?.eventId).toBe("event_001");
    expect(eventsBody.data.events[0]?.status).toBe("accepted");
  });

  it("returns sync summary", () => {
    routeEdgeRequest({
      method: "POST",
      pathname: "/sync/batches",
      requestId: "request_001",
      now: "2026-04-28T12:00:01.000Z",
      body: createSyncRequest("001")
    });

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