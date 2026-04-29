import {
  cloudApiRouteDefinitions,
  type CloudApiAdminDbResetPayloadContract,
  type CloudApiAdminDbSnapshotPayloadContract,
  type CloudApiCreateStockpilePayloadContract,
  type CloudApiDbSchemaPayloadContract,
  type CloudApiDbTablesPayloadContract,
  type CloudApiHealthPayloadContract,
  type CloudApiManifestPayloadContract,
  type CloudApiSeedPayloadContract,
  type CloudApiStockpilesPayloadContract,
  type CloudApiSystemOverviewPayloadContract,
  type CloudApiTenantsPayloadContract,
  type CloudApiUpdateStockpileStatusPayloadContract
} from "@iyi/api-contracts";
import {
  dbSchemaVersion,
  getCoreSchemaSql,
  getRequiredCoreTableNames,
  type DbTenantRecord,
  type DbUnitOfWork
} from "@iyi/db";
import { cooperSmokeSeed } from "@iyi/seed-data";
import {
  createApiUnitOfWork,
  getApiDbFilePath,
  getApiJsonDbSnapshot,
  resetApiJsonDb
} from "./repository-seed.js";
import {
  createStockpileCommand,
  toStockpileSummary,
  updateStockpileStatusCommand
} from "./stockpile-service.js";

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

async function createSystemOverviewPayload(
  unitOfWork: DbUnitOfWork
): Promise<CloudApiSystemOverviewPayloadContract> {
  return {
    tenantCount: await unitOfWork.repositories.tenants.count(),
    terminalCount: await unitOfWork.repositories.terminals.count(),
    userCount: await unitOfWork.repositories.users.count(),
    deviceCount: await unitOfWork.repositories.devices.count(),
    stockpileCount: await unitOfWork.repositories.stockpiles.count(),
    syncEventCount: await unitOfWork.repositories.syncEvents.count(),
    auditEntryCount: await unitOfWork.repositories.auditEntries.count(),
    evidenceItemCount: await unitOfWork.repositories.evidenceItems.count()
  };
}

function getStockpileStatusPathId(pathname: string): string | null {
  const match = /^\/stockpiles\/([^/]+)\/status$/.exec(pathname);

  if (match === null) {
    return null;
  }

  return decodeURIComponent(match[1] ?? "");
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
      repositoryMode: "json_file"
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

  if (request.method === "POST" && request.pathname === "/stockpiles") {
    const result = await createStockpileCommand(request.body, request.now);

    if (!result.ok) {
      return jsonResponse(
        result.code === "conflict" ? 409 : 400,
        createFailure(result.code, result.message, request.requestId, request.now)
      );
    }

    const payload: CloudApiCreateStockpilePayloadContract = {
      stockpile: result.stockpile
    };

    return jsonResponse(201, createSuccess(payload, request.requestId, request.now));
  }

  if (request.method === "PATCH") {
    const stockpileId = getStockpileStatusPathId(request.pathname);

    if (stockpileId !== null) {
      const result = await updateStockpileStatusCommand(stockpileId, request.body, request.now);

      if (!result.ok) {
        const statusCode = result.code === "not_found" ? 404 : 400;

        return jsonResponse(
          statusCode,
          createFailure(result.code, result.message, request.requestId, request.now)
        );
      }

      const payload: CloudApiUpdateStockpileStatusPayloadContract = {
        stockpile: result.stockpile
      };

      return jsonResponse(200, createSuccess(payload, request.requestId, request.now));
    }
  }

  if (request.method === "GET" && request.pathname === "/system/overview") {
    const payload = await createSystemOverviewPayload(unitOfWork);

    return jsonResponse(200, createSuccess(payload, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/admin/db/snapshot") {
    const payload: CloudApiAdminDbSnapshotPayloadContract = {
      storeFile: getApiDbFilePath(),
      snapshot: getApiJsonDbSnapshot(request.now)
    };

    return jsonResponse(200, createSuccess(payload, request.requestId, request.now));
  }

  if (request.method === "POST" && request.pathname === "/admin/db/reset") {
    const store = resetApiJsonDb(request.now);

    const payload: CloudApiAdminDbResetPayloadContract = {
      reset: true,
      storeFile: getApiDbFilePath(),
      overview: await createSystemOverviewPayload(store)
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