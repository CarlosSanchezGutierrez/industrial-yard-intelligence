import {
  createApiError,
  createApiFailure,
  createApiSuccess,
  createHealthCheckResponse,
  createSyncSubmitResponse,
  type SyncSubmitRequest
} from "@iyi/api-contracts";
import { cooperSmokeSeed } from "@iyi/seed-data";
import { reconcileSyncBatch } from "@iyi/sync-core";

export interface EdgeRouteRequest {
  readonly method: string;
  readonly pathname: string;
  readonly requestId: string;
  readonly now: string;
  readonly body?: unknown;
}

export interface EdgeRouteResponse {
  readonly statusCode: number;
  readonly headers: Record<string, string>;
  readonly body: string;
}

function jsonResponse(statusCode: number, body: unknown): EdgeRouteResponse {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type, x-tenant-id, x-terminal-id, x-user-id, x-device-id"
    },
    body: JSON.stringify(body, null, 2)
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSyncSubmitRequest(value: unknown): value is SyncSubmitRequest {
  if (!isRecord(value)) {
    return false;
  }

  return isRecord(value["context"]) && isRecord(value["batch"]);
}

function createManifest(now: string) {
  return {
    service: "Industrial Yard Intelligence Edge",
    status: "ok",
    timestamp: now,
    mode: "local-first",
    internetRequired: false,
    routes: [
      {
        method: "GET",
        path: "/health",
        description: "Edge health check."
      },
      {
        method: "GET",
        path: "/seed/cooper-smoke",
        description: "Simulated Cooper/T. Smith seed payload."
      },
      {
        method: "POST",
        path: "/sync/batches",
        description: "Stateless local sync batch reconciliation endpoint."
      }
    ]
  };
}

function handleSyncBatch(request: EdgeRouteRequest): EdgeRouteResponse {
  if (!isSyncSubmitRequest(request.body)) {
    return jsonResponse(
      400,
      createApiFailure(
        createApiError("bad_request", "POST /sync/batches requires a valid sync submit body."),
        request.requestId,
        request.now
      )
    );
  }

  const syncRequest = request.body;

  const result = reconcileSyncBatch({
    batch: syncRequest.batch,
    receivedAtEdge: request.now,
    context: {
      expectedTenantId: syncRequest.context.tenantId,
      knownEventIds: new Set(),
      knownIdempotencyKeys: new Set(),
      aggregateVersions: new Map()
    }
  });

  return jsonResponse(
    200,
    createApiSuccess(
      createSyncSubmitResponse(result),
      request.requestId,
      request.now
    )
  );
}

export function routeEdgeRequest(request: EdgeRouteRequest): EdgeRouteResponse {
  if (request.method === "OPTIONS") {
    return jsonResponse(204, {});
  }

  if (request.method === "GET" && request.pathname === "/") {
    return jsonResponse(
      200,
      createApiSuccess(createManifest(request.now), request.requestId, request.now)
    );
  }

  if (request.method === "GET" && request.pathname === "/health") {
    return jsonResponse(
      200,
      createApiSuccess(
        createHealthCheckResponse({
          service: "edge",
          status: "ok",
          timestamp: request.now,
          version: "0.0.0"
        }),
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "GET" && request.pathname === "/seed/cooper-smoke") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          seed: cooperSmokeSeed
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "POST" && request.pathname === "/sync/batches") {
    return handleSyncBatch(request);
  }

  return jsonResponse(
    404,
    createApiFailure(
      createApiError("not_found", `Route ${request.pathname} was not found.`),
      request.requestId,
      request.now
    )
  );
}