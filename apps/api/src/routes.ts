import {
  dbSchemaVersion,
  getCoreSchemaSql,
  getRequiredCoreTableNames
} from "@iyi/db";
import { cooperSmokeSeed } from "@iyi/seed-data";

export interface ApiRouteRequest {
  readonly method: string;
  readonly pathname: string;
  readonly requestId: string;
  readonly now: string;
  readonly body?: unknown;
}

export interface ApiRouteResponse {
  readonly statusCode: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
}

export interface ApiSuccessResponse<TData> {
  readonly ok: true;
  readonly data: TData;
  readonly requestId: string;
  readonly timestamp: string;
}

export interface ApiFailureResponse {
  readonly ok: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
  readonly requestId: string;
  readonly timestamp: string;
}

const apiRoutes = [
  {
    method: "GET",
    path: "/",
    description: "API manifest."
  },
  {
    method: "GET",
    path: "/health",
    description: "API health check."
  },
  {
    method: "GET",
    path: "/db/schema",
    description: "Return DB schema SQL contract."
  },
  {
    method: "GET",
    path: "/db/tables",
    description: "Return required DB table names."
  },
  {
    method: "GET",
    path: "/seed/cooper-smoke",
    description: "Return Cooper/T. Smith smoke seed data."
  }
] as const;

function createSuccess<TData>(
  data: TData,
  requestId: string,
  timestamp: string
): ApiSuccessResponse<TData> {
  return {
    ok: true,
    data,
    requestId,
    timestamp
  };
}

function createFailure(
  code: string,
  message: string,
  requestId: string,
  timestamp: string
): ApiFailureResponse {
  return {
    ok: false,
    error: {
      code,
      message
    },
    requestId,
    timestamp
  };
}

function jsonResponse(statusCode: number, payload: unknown): ApiRouteResponse {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8"
    },
    body: `${JSON.stringify(payload, null, 2)}\n`
  };
}

export function routeApiRequest(request: ApiRouteRequest): ApiRouteResponse {
  if (request.method === "GET" && request.pathname === "/") {
    return jsonResponse(
      200,
      createSuccess(
        {
          service: "@iyi/api",
          name: "Industrial Yard Intelligence API",
          runtime: "cloud-api-skeleton",
          routes: apiRoutes
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "GET" && request.pathname === "/health") {
    return jsonResponse(
      200,
      createSuccess(
        {
          status: "ok",
          service: "@iyi/api",
          dbSchemaVersion
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "GET" && request.pathname === "/db/schema") {
    return jsonResponse(
      200,
      createSuccess(
        {
          migrationId: dbSchemaVersion,
          sql: getCoreSchemaSql()
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "GET" && request.pathname === "/db/tables") {
    return jsonResponse(
      200,
      createSuccess(
        {
          migrationId: dbSchemaVersion,
          tables: getRequiredCoreTableNames()
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "GET" && request.pathname === "/seed/cooper-smoke") {
    return jsonResponse(
      200,
      createSuccess(
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
    createFailure(
      "not_found",
      `Route ${request.pathname} was not found.`,
      request.requestId,
      request.now
    )
  );
}