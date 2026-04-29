import { randomUUID } from "node:crypto";
import {
  cloudApiRouteDefinitions,
  type CloudApiAdminDbResetPayloadContract,
  type CloudApiAdminDbSnapshotPayloadContract,
  type CloudApiCreateStockpilePayloadContract,
  type CloudApiCreateStockpileRequestContract,
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
import {
  createApiJsonDbStore,
  createApiUnitOfWork,
  getApiDbFilePath,
  getApiJsonDbSnapshot,
  resetApiJsonDb
} from "./repository-seed.js";

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

interface RecordLike {
  readonly [key: string]: unknown;
}

function isRecord(value: unknown): value is RecordLike {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

async function createSystemOverviewPayload(
  unitOfWork: Awaited<ReturnType<typeof createApiUnitOfWork>>
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

function stringBodyValue(body: RecordLike, key: string): string | null {
  const value = body[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function optionalStringBodyValue(body: RecordLike, key: string): string | undefined {
  const value = body[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  return value.trim();
}

function optionalNumberBodyValue(body: RecordLike, key: string, fallback: number): number {
  const value = body[key];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return value;
}

function normalizeStockpileStatus(value: unknown): DbStockpileRecord["status"] {
  if (
    value === "draft" ||
    value === "operational" ||
    value === "pending_review" ||
    value === "validated" ||
    value === "archived"
  ) {
    return value;
  }

  return "draft";
}

function createStockpileRecordFromBody(
  body: unknown,
  now: string
): { readonly ok: true; readonly record: DbStockpileRecord } | { readonly ok: false; readonly message: string } {
  if (!isRecord(body)) {
    return {
      ok: false,
      message: "Request body must be a JSON object."
    };
  }

  const tenantId = stringBodyValue(body, "tenantId");
  const terminalId = stringBodyValue(body, "terminalId");
  const name = stringBodyValue(body, "name");
  const material = stringBodyValue(body, "material");

  if (tenantId === null) {
    return {
      ok: false,
      message: "tenantId is required."
    };
  }

  if (terminalId === null) {
    return {
      ok: false,
      message: "terminalId is required."
    };
  }

  if (name === null) {
    return {
      ok: false,
      message: "name is required."
    };
  }

  if (material === null) {
    return {
      ok: false,
      message: "material is required."
    };
  }

  const request = body as unknown as Partial<CloudApiCreateStockpileRequestContract>;
  const id = optionalStringBodyValue(body, "id") ?? `stockpile_${randomUUID()}`;
  const category = optionalStringBodyValue(body, "category") ?? "bulk";
  const validationState = optionalStringBodyValue(body, "validationState") ?? "created_from_api";
  const confidenceLevel = optionalStringBodyValue(body, "confidenceLevel") ?? "operator_input";
  const estimatedTons = optionalNumberBodyValue(body, "estimatedTons", 0);
  const status = normalizeStockpileStatus(request.status);

  return {
    ok: true,
    record: {
      id,
      tenantId,
      terminalId,
      name,
      material,
      category,
      estimatedTons,
      validationState,
      confidenceLevel,
      status,
      createdAt: now,
      updatedAt: now
    }
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
    const parseResult = createStockpileRecordFromBody(request.body, request.now);

    if (!parseResult.ok) {
      return jsonResponse(
        400,
        createFailure("bad_request", parseResult.message, request.requestId, request.now)
      );
    }

    const store = createApiJsonDbStore(request.now);
    const saved = await store.repositories.stockpiles.upsert(parseResult.record);

    store.saveToDisk(request.now);

    const payload: CloudApiCreateStockpilePayloadContract = {
      stockpile: toStockpileSummary(saved)
    };

    return jsonResponse(201, createSuccess(payload, request.requestId, request.now));
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