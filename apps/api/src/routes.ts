import {
  cloudApiRouteDefinitions,
  type CloudApiDbSchemaPayloadContract,
  type CloudApiDbTablesPayloadContract,
  type CloudApiHealthPayloadContract,
  type CloudApiManifestPayloadContract,
  type CloudApiSeedPayloadContract,
  type CloudApiStockpilesPayloadContract,
  type CloudApiSystemOverviewPayloadContract,
  type CloudApiTenantsPayloadContract
} from "@iyi/api-contracts";
import {
  dbSchemaVersion,
  getCoreSchemaSql,
  getRequiredCoreTableNames,
  type DbStockpileRecord,
  type DbTenantRecord
} from "@iyi/db";
import { cooperSmokeSeed } from "@iyi/seed-data";
import { createApiUnitOfWork } from "./repository-seed.js";

export interface ApiRouteRequest {
  readonly method: string;
  readonly pathname: string;
  readonly requestId: string;
  readonly now: string;
  readonly query?: Readonly<Record<string, string>>;
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

function createCorsHeaders(): Readonly<Record<string, string>> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-request-id",
    "access-control-max-age": "86400"
  };
}

function jsonResponse(statusCode: number, payload: unknown): ApiRouteResponse {
  return {
    statusCode,
    headers: {
      ...createCorsHeaders(),
      "content-type": "application/json; charset=utf-8"
    },
    body: `${JSON.stringify(payload, null, 2)}\n`
  };
}

function emptyResponse(statusCode: number): ApiRouteResponse {
  return {
    statusCode,
    headers: createCorsHeaders(),
    body: ""
  };
}

function toTenantSummary(record: DbTenantRecord): CloudApiTenantsPayloadContract["tenants"][number] {
  return {
    id: record.id,
    name: record.name,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function toStockpileSummary(
  record: DbStockpileRecord
): CloudApiStockpilesPayloadContract["stockpiles"][number] {
  return {
    id: record.id,
    tenantId: record.tenantId,
    terminalId: record.terminalId,
    name: record.name,
    material: record.material,
    category: record.category,
    estimatedTons: record.estimatedTons,
    validationState: record.validationState,
    confidenceLevel: record.confidenceLevel,
    status: record.status
  };
}

export async function routeApiRequest(request: ApiRouteRequest): Promise<ApiRouteResponse> {
  if (request.method === "OPTIONS") {
    return emptyResponse(204);
  }

  const unitOfWork = createApiUnitOfWork(request.now);

  if (request.method === "GET" && request.pathname === "/") {
    const payload: CloudApiManifestPayloadContract = {
      service: "@iyi/api",
      name: "Industrial Yard Intelligence API",
      runtime: "cloud-api-skeleton",
      routes: cloudApiRouteDefinitions
    };

    return jsonResponse(200, createSuccess(payload, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/health") {
    const payload: CloudApiHealthPayloadContract = {
      status: "ok",
      service: "@iyi/api",
      dbSchemaVersion,
      repositoryMode: "in_memory"
    };

    return jsonResponse(200, createSuccess(payload, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/db/schema") {
    const payload: CloudApiDbSchemaPayloadContract = {
      migrationId: dbSchemaVersion,
      sql: getCoreSchemaSql()
    };

    return jsonResponse(200, createSuccess(payload, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/db/tables") {
    const payload: CloudApiDbTablesPayloadContract = {
      migrationId: dbSchemaVersion,
      tables: getRequiredCoreTableNames()
    };

    return jsonResponse(200, createSuccess(payload, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/seed/cooper-smoke") {
    const payload: CloudApiSeedPayloadContract = {
      seed: cooperSmokeSeed
    };

    return jsonResponse(200, createSuccess(payload, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/tenants") {
    const tenants = await unitOfWork.repositories.tenants.list();

    const payload: CloudApiTenantsPayloadContract = {
      tenants: tenants.map(toTenantSummary)
    };

    return jsonResponse(200, createSuccess(payload, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/stockpiles") {
    const tenantId = request.query?.["tenantId"];
    const stockpiles = await unitOfWork.repositories.stockpiles.list(
      tenantId !== undefined ? { tenantId } : undefined
    );

    const payload: CloudApiStockpilesPayloadContract = {
      stockpiles: stockpiles.map(toStockpileSummary)
    };

    return jsonResponse(200, createSuccess(payload, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/system/overview") {
    const payload: CloudApiSystemOverviewPayloadContract = {
      tenantCount: await unitOfWork.repositories.tenants.count(),
      terminalCount: await unitOfWork.repositories.terminals.count(),
      userCount: await unitOfWork.repositories.users.count(),
      deviceCount: await unitOfWork.repositories.devices.count(),
      stockpileCount: await unitOfWork.repositories.stockpiles.count(),
      syncEventCount: await unitOfWork.repositories.syncEvents.count(),
      auditEntryCount: await unitOfWork.repositories.auditEntries.count(),
      evidenceItemCount: await unitOfWork.repositories.evidenceItems.count()
    };

    return jsonResponse(200, createSuccess(payload, request.requestId, request.now));
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