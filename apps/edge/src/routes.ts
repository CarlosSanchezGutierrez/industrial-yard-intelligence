import {
  createApiError,
  createApiFailure,
  createApiSuccess,
  createHealthCheckResponse,
  createSyncSubmitResponse,
  type SyncSubmitRequest
} from "@iyi/api-contracts";
import { cooperSmokeSeed } from "@iyi/seed-data";
import {
  exportAuditStore,
  getAuditEntries,
  getAuditStoreFilePath,
  getAuditSummary,
  importAuditStore,
  recordConflictResolutionAudit,
  verifyEdgeAuditChain
} from "./audit-store.js";
import { reconcileSyncBatch } from "@iyi/sync-core";
import {
  exportConflictResolutionStore,
  getConflictResolutionFilePath,
  getConflictResolutions,
  importConflictResolutionStore,
  recordConflictResolution,
  type ConflictResolutionDecision
} from "./conflict-resolutions.js";
import {
  exportEdgeStore,
  getAggregateVersions,
  getEdgeStoreFilePath,
  getKnownSyncEventIds,
  getKnownSyncIdempotencyKeys,
  getSyncBatchHistory,
  getSyncEventHistory,
  getSyncSummary,
  importEdgeStore,
  recordSyncBatch,
  type EdgeStoreFile
} from "./store.js";

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

interface EdgeOfflineBackup {
  readonly version: 1;
  readonly exportedAt: string;
  readonly syncStore: EdgeStoreFile;
  readonly conflictResolutions: ReturnType<typeof exportConflictResolutionStore>;
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

function isEdgeOfflineBackup(value: unknown): value is EdgeOfflineBackup {
  return (
    isRecord(value) &&
    value["version"] === 1 &&
    isRecord(value["syncStore"]) &&
    isRecord(value["conflictResolutions"])
  );
}

function getBooleanBodyValue(body: unknown, key: string, fallback: boolean): boolean {
  if (!isRecord(body)) {
    return fallback;
  }

  return typeof body[key] === "boolean" ? body[key] : fallback;
}

function getStringBodyValue(body: unknown, key: string): string | undefined {
  if (!isRecord(body)) {
    return undefined;
  }

  return typeof body[key] === "string" ? body[key] : undefined;
}

function getDecisionBodyValue(body: unknown): ConflictResolutionDecision | undefined {
  const decision = getStringBodyValue(body, "decision");

  if (
    decision === "accepted_after_review" ||
    decision === "rejected_after_review" ||
    decision === "manual_action_required"
  ) {
    return decision;
  }

  return undefined;
}

function getStoreImportPayload(body: unknown): unknown {
  if (!isRecord(body)) {
    return body;
  }

  return "store" in body ? body["store"] : body;
}

function createOfflineBackup(now: string): EdgeOfflineBackup {
  return {
    version: 1,
    exportedAt: now,
    syncStore: exportEdgeStore(now),
    conflictResolutions: exportConflictResolutionStore(now),
    auditStore: exportAuditStore()
  };
}

function createManifest(now: string) {
  return {
    service: "Industrial Yard Intelligence Edge",
    status: "ok",
    timestamp: now,
    mode: "local-first",
    internetRequired: false,
    persistence: "json_file_development_store",
    storeFile: getEdgeStoreFilePath(),
    conflictResolutionFile: getConflictResolutionFilePath(),
    auditStoreFile: getAuditStoreFilePath(),
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
        description: "Local sync batch reconciliation endpoint."
      },
      {
        method: "GET",
        path: "/sync/events",
        description: "JSON-backed sync event history."
      },
      {
        method: "GET",
        path: "/sync/summary",
        description: "JSON-backed sync summary."
      },
      {
        method: "GET",
        path: "/sync/export",
        description: "Export combined offline backup with sync store and conflict resolutions."
      },
      {
        method: "POST",
        path: "/sync/import",
        description: "Import combined offline backup or legacy sync store."
      },
      {
        method: "GET",
        path: "/sync/conflicts/resolutions",
        description: "List supervisor conflict resolutions."
      },
      {
        method: "POST",
        path: "/sync/conflicts/resolve",
        description: "Mark a conflict event as reviewed by supervisor."
      },
      {
        method: "GET",
        path: "/audit/entries",
        description: "List append-only audit entries."
      },
      {
        method: "GET",
        path: "/audit/summary",
        description: "Show audit chain verification summary."
      },
      {
        method: "GET",
        path: "/audit/verify",
        description: "Verify audit hash chain integrity."
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
      knownEventIds: getKnownSyncEventIds(),
      knownIdempotencyKeys: getKnownSyncIdempotencyKeys(),
      aggregateVersions: getAggregateVersions()
    }
  });

  recordSyncBatch(syncRequest.batch, result);

  return jsonResponse(
    200,
    createApiSuccess(createSyncSubmitResponse(result), request.requestId, request.now)
  );
}

function handleStoreImport(request: EdgeRouteRequest): EdgeRouteResponse {
  try {
    const replaceExistingStore = getBooleanBodyValue(request.body, "replaceExistingStore", true);
    const importPayload = getStoreImportPayload(request.body);

    if (isEdgeOfflineBackup(importPayload)) {
      const importResult = importEdgeStore(importPayload.syncStore, replaceExistingStore);
      const conflictImportResult = importConflictResolutionStore(
        importPayload.conflictResolutions,
        replaceExistingStore
      );

      const auditImportResult =
        "auditStore" in importPayload
          ? importAuditStore(importPayload.auditStore, replaceExistingStore)
          : {
              importedAuditEntries: 0,
              replacedExistingStore: replaceExistingStore
            };

      return jsonResponse(
        200,
        createApiSuccess(
          {
            importResult,
            conflictImportResult,
            auditImportResult,
            summary: getSyncSummary(),
            resolutions: getConflictResolutions(),
            auditSummary: getAuditSummary()
          },
          request.requestId,
          request.now
        )
      );
    }

    const importResult = importEdgeStore(importPayload, replaceExistingStore);

    return jsonResponse(
      200,
      createApiSuccess(
        {
          importResult,
          summary: getSyncSummary(),
          resolutions: getConflictResolutions()
        },
        request.requestId,
        request.now
      )
    );
  } catch {
    return jsonResponse(
      400,
      createApiFailure(
        createApiError("bad_request", "Invalid edge store import payload."),
        request.requestId,
        request.now
      )
    );
  }
}

function handleConflictResolution(request: EdgeRouteRequest): EdgeRouteResponse {
  const eventId = getStringBodyValue(request.body, "eventId");

  if (eventId === undefined || eventId.trim().length === 0) {
    return jsonResponse(
      400,
      createApiFailure(
        createApiError("bad_request", "POST /sync/conflicts/resolve requires eventId."),
        request.requestId,
        request.now
      )
    );
  }

  const decision = getDecisionBodyValue(request.body);
  const note = getStringBodyValue(request.body, "note");
  const resolvedByUserId = getStringBodyValue(request.body, "resolvedByUserId");
  const resolvedByDeviceId = getStringBodyValue(request.body, "resolvedByDeviceId");

  const resolution = recordConflictResolution({
    eventId,
    resolvedAt: request.now,
    ...(decision !== undefined ? { decision } : {}),
    ...(note !== undefined ? { note } : {}),
    ...(resolvedByUserId !== undefined ? { resolvedByUserId } : {}),
    ...(resolvedByDeviceId !== undefined ? { resolvedByDeviceId } : {})
  });

  const auditEntry = recordConflictResolutionAudit({
    resolution,
    createdAt: request.now
  });

  return jsonResponse(
    200,
    createApiSuccess(
      {
        resolution,
        auditEntry,
        auditSummary: getAuditSummary(),
        resolutions: getConflictResolutions()
      },
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

  if (request.method === "GET" && request.pathname === "/sync/events") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          events: getSyncEventHistory(),
          batches: getSyncBatchHistory()
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "GET" && request.pathname === "/sync/summary") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          summary: getSyncSummary()
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "GET" && request.pathname === "/sync/export") {
    const backup = createOfflineBackup(request.now);

    return jsonResponse(
      200,
      createApiSuccess(
        {
          backup,
          store: backup.syncStore,
          conflictResolutions: backup.conflictResolutions
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "POST" && request.pathname === "/sync/import") {
    return handleStoreImport(request);
  }

  if (request.method === "GET" && request.pathname === "/audit/entries") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          entries: getAuditEntries()
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "GET" && request.pathname === "/audit/summary") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          summary: getAuditSummary()
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "GET" && request.pathname === "/audit/verify") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          verification: verifyEdgeAuditChain()
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "GET" && request.pathname === "/sync/conflicts/resolutions") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          resolutions: getConflictResolutions()
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "POST" && request.pathname === "/sync/conflicts/resolve") {
    return handleConflictResolution(request);
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