import {
  createApiError,
  createApiFailure,
  createApiSuccess,
  createHealthCheckResponse
} from "@iyi/api-contracts";
import { cooperSmokeSeed } from "@iyi/seed-data";

export interface EdgeRouteRequest {
  readonly method: string;
  readonly pathname: string;
  readonly requestId: string;
  readonly now: string;
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
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type, x-tenant-id, x-terminal-id, x-user-id, x-device-id"
    },
    body: JSON.stringify(body, null, 2)
  };
}

export function routeEdgeRequest(request: EdgeRouteRequest): EdgeRouteResponse {
  if (request.method === "OPTIONS") {
    return jsonResponse(204, {});
  }

  if (request.method !== "GET") {
    return jsonResponse(
      405,
      createApiFailure(
        createApiError("bad_request", `Method ${request.method} is not supported.`),
        request.requestId,
        request.now
      )
    );
  }

  if (request.pathname === "/health") {
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

  if (request.pathname === "/seed/cooper-smoke") {
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

  return jsonResponse(
    404,
    createApiFailure(
      createApiError("not_found", `Route ${request.pathname} was not found.`),
      request.requestId,
      request.now
    )
  );
}