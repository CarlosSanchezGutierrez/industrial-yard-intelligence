import { describe, expect, it } from "vitest";
import { routeEdgeRequest } from "./index.js";
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

describe("@iyi/edge", () => {
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
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.service).toBe("Industrial Yard Intelligence Edge");
    expect(body.data.internetRequired).toBe(false);
  });

  it("returns health responses", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/health",
      requestId: "request_001",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        service: string;
        status: string;
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.service).toBe("edge");
    expect(body.data.status).toBe("ok");
  });

  it("returns Cooper smoke seed data", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/seed/cooper-smoke",
      requestId: "request_001",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        seed: {
          tenantName: string;
          classification: string;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.seed.tenantName).toBe("Cooper/T. Smith");
    expect(body.data.seed.classification).toBe("SIMULATED_DATA");
  });

  it("reconciles sync batches", () => {
    const tenantId = asTenantId("tenant_cooper_tsmith");
    const terminalId = asTerminalId("terminal_altamira");
    const deviceId = asDeviceId("device_android_001");
    const userId = asUserId("user_operator_001");
    const eventId = asEventId("event_001");

    const body: SyncSubmitRequest = {
      context: {
        tenantId,
        terminalId,
        userId,
        deviceId
      },
      batch: {
        batchId: "batch_001",
        tenantId,
        terminalId,
        deviceId,
        createdAtClient: "2026-04-28T12:00:00.000Z",
        events: [
          {
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
          }
        ]
      }
    };

    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/batches",
      requestId: "request_001",
      now: "2026-04-28T12:00:01.000Z",
      body
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