import { createHash } from "node:crypto";
import {
  createApiError,
  createApiFailure,
  createApiSuccess,
  createHealthCheckResponse,
  createSyncSubmitResponse,
  getDemoReportStatusFromReadiness,
  type DemoExecutiveReportContract,
  type DemoPackageContract,
  type DemoPackageIntegrityContract,
  type DemoReadinessReportContract,
  type SyncSubmitRequest
} from "@iyi/api-contracts";
import { cooperSmokeSeed } from "@iyi/seed-data";
import {
  asAggregateId,
  asDeviceId,
  asEventId,
  asSyncEnvelopeId,
  asTenantId,
  asTerminalId,
  asUserId
} from "@iyi/kernel";
import { reconcileSyncBatch } from "@iyi/sync-core";
import {
  exportAuditStore,
  getAuditEntries,
  getAuditStoreFilePath,
  getAuditSummary,
  importAuditStore,
  recordConflictResolutionAudit,
  recordEvidenceRegisteredAudit,
  resetAuditStore,
  verifyEdgeAuditChain
} from "./audit-store.js";
import {
  exportConflictResolutionStore,
  getConflictResolutionFilePath,
  getConflictResolutions,
  importConflictResolutionStore,
  recordConflictResolution,
  resetConflictResolutionStore,
  type ConflictResolutionDecision
} from "./conflict-resolutions.js";
import {
  exportEvidenceStore,
  getEvidenceItems,
  getEvidenceStoreFilePath,
  getEvidenceSummary,
  importEvidenceStore,
  recordTextEvidence,
  resetEvidenceStore,
  verifyEvidenceStore
} from "./evidence-store.js";
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
  resetEdgeMemoryStore,
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
  readonly auditStore?: ReturnType<typeof exportAuditStore>;
  readonly evidenceStore?: ReturnType<typeof exportEvidenceStore>;
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
    auditStore: exportAuditStore(),
    evidenceStore: exportEvidenceStore(now)
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
    evidenceStoreFile: getEvidenceStoreFilePath(),
    routes: [
      { method: "GET", path: "/health", description: "Edge health check." },
      { method: "GET", path: "/seed/cooper-smoke", description: "Simulated Cooper/T. Smith seed payload." },
      { method: "POST", path: "/sync/batches", description: "Local sync batch reconciliation endpoint." },
      { method: "GET", path: "/sync/events", description: "JSON-backed sync event history." },
      { method: "GET", path: "/sync/summary", description: "JSON-backed sync summary." },
      { method: "GET", path: "/sync/export", description: "Export combined offline backup." },
      { method: "POST", path: "/sync/import", description: "Import combined offline backup or legacy sync store." },
      { method: "GET", path: "/sync/conflicts/resolutions", description: "List supervisor conflict resolutions." },
      { method: "POST", path: "/sync/conflicts/resolve", description: "Mark a conflict event as reviewed by supervisor." },
      { method: "GET", path: "/audit/entries", description: "List append-only audit entries." },
      { method: "GET", path: "/audit/summary", description: "Show audit chain verification summary." },
      { method: "GET", path: "/audit/verify", description: "Verify audit hash chain integrity." },
      { method: "POST", path: "/evidence/register", description: "Register simulated text evidence with SHA-256 integrity." },
      { method: "GET", path: "/evidence/items", description: "List registered evidence items." },
      { method: "GET", path: "/evidence/summary", description: "Show evidence integrity summary." },
      { method: "GET", path: "/evidence/verify", description: "Verify evidence hashes." },
      { method: "POST", path: "/admin/reset-demo-state", description: "Reset local demo state on edge." },
      { method: "GET", path: "/admin/demo-readiness", description: "Show local demo readiness report." },
      { method: "POST", path: "/admin/run-guided-demo", description: "Create a deterministic local demo scenario." },
      { method: "GET", path: "/admin/demo-report", description: "Show executive demo report for Cooper/T. Smith." },
      { method: "GET", path: "/admin/demo-package", description: "Export executive report plus full offline backup package." },
      { method: "GET", path: "/admin/demo-package/verify", description: "Verify current demo package SHA-256 integrity." },
      { method: "POST", path: "/admin/demo-package/verify", description: "Verify uploaded demo package SHA-256 integrity." },
      { method: "POST", path: "/admin/demo-package/import", description: "Import uploaded verified demo package into local edge state." }
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
        importPayload.auditStore !== undefined
          ? importAuditStore(importPayload.auditStore, replaceExistingStore)
          : {
              importedAuditEntries: 0,
              replacedExistingStore: replaceExistingStore
            };

      const evidenceImportResult =
        importPayload.evidenceStore !== undefined
          ? importEvidenceStore(importPayload.evidenceStore, replaceExistingStore)
          : {
              importedEvidenceItems: 0,
              replacedExistingStore: replaceExistingStore
            };

      return jsonResponse(
        200,
        createApiSuccess(
          {
            importResult,
            conflictImportResult,
            auditImportResult,
            evidenceImportResult,
            summary: getSyncSummary(),
            resolutions: getConflictResolutions(),
            auditSummary: getAuditSummary(),
            evidenceSummary: getEvidenceSummary()
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
          resolutions: getConflictResolutions(),
          auditSummary: getAuditSummary(),
          evidenceSummary: getEvidenceSummary()
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

function handleEvidenceRegister(request: EdgeRouteRequest): EdgeRouteResponse {
  const content = getStringBodyValue(request.body, "content");

  if (content === undefined || content.length === 0) {
    return jsonResponse(
      400,
      createApiFailure(
        createApiError("bad_request", "POST /evidence/register requires non-empty content."),
        request.requestId,
        request.now
      )
    );
  }

  try {
    const evidenceKind = getStringBodyValue(request.body, "evidenceKind");
    const storageProvider = getStringBodyValue(request.body, "storageProvider");
    const storageKey = getStringBodyValue(request.body, "storageKey");
    const fileName = getStringBodyValue(request.body, "fileName");
    const mimeType = getStringBodyValue(request.body, "mimeType");
    const relatedEntityId = getStringBodyValue(request.body, "relatedEntityId");
    const relatedEventId = getStringBodyValue(request.body, "relatedEventId");

    const evidence = recordTextEvidence({
      content,
      registeredAt: request.now,
      ...(evidenceKind !== undefined ? { evidenceKind } : {}),
      ...(storageProvider !== undefined ? { storageProvider } : {}),
      ...(storageKey !== undefined ? { storageKey } : {}),
      ...(fileName !== undefined ? { fileName } : {}),
      ...(mimeType !== undefined ? { mimeType } : {}),
      ...(relatedEntityId !== undefined ? { relatedEntityId } : {}),
      ...(relatedEventId !== undefined ? { relatedEventId } : {})
    });

    const auditEntry = recordEvidenceRegisteredAudit({
      evidence,
      createdAt: request.now
    });

    return jsonResponse(
      200,
      createApiSuccess(
        {
          evidence,
          auditEntry,
          auditSummary: getAuditSummary(),
          summary: getEvidenceSummary(),
          verification: verifyEvidenceStore()
        },
        request.requestId,
        request.now
      )
    );
  } catch {
    return jsonResponse(
      400,
      createApiFailure(
        createApiError("bad_request", "Invalid evidence registration payload."),
        request.requestId,
        request.now
      )
    );
  }
}

function normalizeDemoSuffix(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, "_");
}

function createGuidedDemoSyncRequest(input: {
  readonly suffix: string;
  readonly expectedAggregateVersion: number;
  readonly now: string;
}): SyncSubmitRequest {
  const tenantId = asTenantId("tenant_cooper_tsmith");
  const terminalId = asTerminalId("terminal_altamira");
  const userId = asUserId("user_demo_operator");
  const deviceId = asDeviceId("device_web_demo");
  const eventId = asEventId(`event_guided_demo_${input.suffix}`);

  return {
    context: {
      tenantId,
      terminalId,
      userId,
      deviceId
    },
    batch: {
      batchId: `batch_guided_demo_${input.suffix}`,
      tenantId,
      terminalId,
      deviceId,
      createdAtClient: input.now,
      events: [
        {
          syncEnvelopeId: asSyncEnvelopeId(`sync_guided_demo_${input.suffix}`),
          eventId,
          eventType: "GUIDED_DEMO_MOVEMENT_RECORDED",
          eventVersion: 1,
          tenantId,
          terminalId,
          userId,
          deviceId,
          sourceRuntime: "edge",
          createdAtClient: input.now,
          localSequence: input.expectedAggregateVersion + 1,
          idempotencyKey: `tenant_cooper_tsmith:device_web_demo:guided_demo:${input.suffix}:${eventId}`,
          aggregateType: "stockpile",
          aggregateId: asAggregateId("stockpile_pet_coke_001"),
          validationState: "operational",
          confidenceLevel: "simulated",
          payload: {
            movementType: "GUIDED_DEMO",
            source: "apps/edge",
            expectedAggregateVersion: input.expectedAggregateVersion,
            note: "Server-side guided demo sync event."
          }
        }
      ]
    }
  };
}

function reconcileAndRecordGuidedDemoSync(syncRequest: SyncSubmitRequest, receivedAtEdge: string) {
  const result = reconcileSyncBatch({
    batch: syncRequest.batch,
    receivedAtEdge,
    context: {
      expectedTenantId: syncRequest.context.tenantId,
      knownEventIds: getKnownSyncEventIds(),
      knownIdempotencyKeys: getKnownSyncIdempotencyKeys(),
      aggregateVersions: getAggregateVersions()
    }
  });

  recordSyncBatch(syncRequest.batch, result);

  return {
    result,
    firstStatus: result.results[0]?.status ?? "unknown"
  };
}
function createDemoReadinessReport(now: string): DemoReadinessReportContract {
  const syncSummary = getSyncSummary();
  const resolutions = getConflictResolutions();
  const auditSummary = getAuditSummary();
  const auditVerification = verifyEdgeAuditChain();
  const evidenceSummary = getEvidenceSummary();
  const evidenceVerification = verifyEvidenceStore();

  const pendingConflictCount = Math.max(syncSummary.conflicts - resolutions.length, 0);
  const hasOperationalData = syncSummary.totalEvents > 0 || evidenceSummary.totalEvidenceItems > 0;
  const auditReady = auditSummary.chainValid && auditVerification.ok;
  const evidenceReady = evidenceVerification.ok;
  const backupReady = auditReady && evidenceReady;

  const checks = [
    {
      id: "edge_online",
      label: "Edge local online",
      ok: true,
      detail: "Edge server responded locally."
    },
    {
      id: "sync_state",
      label: "Sync state available",
      ok: syncSummary.totalEvents >= 0,
      detail: `${syncSummary.totalEvents} sync events stored.`
    },
    {
      id: "pending_conflicts",
      label: "Pending conflicts visible",
      ok: pendingConflictCount >= 0,
      detail: `${pendingConflictCount} unresolved conflicts.`
    },
    {
      id: "audit_chain",
      label: "Audit hash-chain valid",
      ok: auditReady,
      detail: auditSummary.verificationMessage
    },
    {
      id: "evidence_integrity",
      label: "Evidence hashes verified",
      ok: evidenceReady,
      detail: `${evidenceSummary.verifiedItems}/${evidenceSummary.totalEvidenceItems} evidence items verified.`
    },
    {
      id: "offline_backup",
      label: "Offline backup available",
      ok: backupReady,
      detail: "Export includes sync store, conflict resolutions, audit store and evidence store."
    }
  ];

  const failedChecks = checks.filter((check) => !check.ok);
  const status = !hasOperationalData ? "empty" : failedChecks.length === 0 ? "ready" : "attention";

  return {
    status,
    generatedAt: now,
    hasOperationalData,
    pendingConflictCount,
    syncSummary,
    auditSummary,
    evidenceSummary,
    checks
  };
}
function createDemoExecutiveReport(now: string): DemoExecutiveReportContract {
  const readiness = createDemoReadinessReport(now);
  const syncSummary = getSyncSummary();
  const resolutions = getConflictResolutions();
  const auditSummary = getAuditSummary();
  const evidenceSummary = getEvidenceSummary();

  const unresolvedConflicts = Math.max(syncSummary.conflicts - resolutions.length, 0);
  const reportStatus = getDemoReportStatusFromReadiness(readiness.status);

  return {
    reportId: `demo_report_${normalizeDemoSuffix(now)}`,
    title: "Industrial Yard Intelligence - Cooper/T. Smith Demo Report",
    customer: "Cooper/T. Smith",
    generatedAt: now,
    status: reportStatus,
    summary: [
      "Local-first edge demo for industrial yard visibility.",
      "Tracks sync events, conflicts, evidence integrity and audit chain state.",
      "Demonstrates offline backup with sync store, conflict resolutions, audit trail and evidence records."
    ],
    metrics: [
      {
        label: "Sync events",
        value: syncSummary.totalEvents,
        detail: `${syncSummary.accepted} accepted, ${syncSummary.conflicts} conflicts.`
      },
      {
        label: "Pending conflicts",
        value: unresolvedConflicts,
        detail: `${resolutions.length} conflicts already reviewed by supervisor.`
      },
      {
        label: "Audit entries",
        value: auditSummary.totalEntries,
        detail: auditSummary.chainValid ? "Audit hash-chain is valid." : "Audit hash-chain needs review."
      },
      {
        label: "Evidence items",
        value: evidenceSummary.totalEvidenceItems,
        detail: `${evidenceSummary.verifiedItems} verified, ${evidenceSummary.failedItems} failed.`
      }
    ],
    proofPoints: [
      {
        label: "Offline operation",
        detail: "The edge stores demo state in local JSON-backed development stores."
      },
      {
        label: "Conflict visibility",
        detail: "Stale aggregate versions produce sync conflicts for supervisor review."
      },
      {
        label: "Evidence integrity",
        detail: "Registered evidence receives SHA-256 integrity metadata."
      },
      {
        label: "Auditability",
        detail: "Supervisor actions and evidence registration generate append-only audit hash-chain entries."
      },
      {
        label: "Portable backup",
        detail: "Export includes sync events, conflict resolutions, audit entries and evidence records."
      }
    ],
    demoScript: [
      "Reset demo state.",
      "Run guided demo scenario.",
      "Show accepted sync event and conflict.",
      "Register or inspect evidence with SHA-256 hash.",
      "Review audit chain validity.",
      "Export offline backup JSON."
    ],
    recommendedNextSteps: [
      "Connect real mobile capture flow.",
      "Replace JSON development stores with production persistence.",
      "Add user authentication and role-based supervisor review.",
      "Integrate real GPS/RTK/GeoJSON evidence sources.",
      "Prepare pilot deployment checklist for Cooper/T. Smith."
    ],
    readiness
  };
}
function isSerializableRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (isSerializableRecord(value)) {
    const entries = Object.keys(value)
      .sort()
      .filter((key) => value[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);

    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(null);
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function createDemoPackageIntegrity(
  payload: Omit<DemoPackageContract, "integrity">
): DemoPackageIntegrityContract {
  return {
    algorithm: "sha256",
    hashValue: sha256Hex(stableStringify(payload)),
    signedPayloadFields: [
      "version",
      "packageId",
      "customer",
      "product",
      "exportedAt",
      "contents",
      "report",
      "backup"
    ]
  };
}
function createDemoPackage(now: string): DemoPackageContract {
  const report = createDemoExecutiveReport(now);
  const backup = createOfflineBackup(now);

  const packagePayload: Omit<DemoPackageContract, "integrity"> = {
    version: 1,
    packageId: `demo_package_${normalizeDemoSuffix(now)}`,
    customer: "Cooper/T. Smith",
    product: "Industrial Yard Intelligence",
    exportedAt: now,
    contents: {
      executiveReport: true,
      offlineBackup: true,
      syncStore: true,
      conflictResolutions: true,
      auditStore: true,
      evidenceStore: true
    },
    report,
    backup
  };

  return {
    ...packagePayload,
    integrity: createDemoPackageIntegrity(packagePayload)
  };
}
function getDemoPackageFromBody(body: unknown): unknown {
  if (!isRecord(body)) {
    return body;
  }

  return "package" in body ? body["package"] : body;
}

function isDemoPackageLike(value: unknown): value is DemoPackageContract {
  if (!isRecord(value) || !isRecord(value["integrity"])) {
    return false;
  }

  const integrity = value["integrity"];

  return (
    value["version"] === 1 &&
    typeof value["packageId"] === "string" &&
    typeof value["customer"] === "string" &&
    typeof value["product"] === "string" &&
    typeof value["exportedAt"] === "string" &&
    isRecord(value["contents"]) &&
    isRecord(value["report"]) &&
    isRecord(value["backup"]) &&
    integrity["algorithm"] === "sha256" &&
    typeof integrity["hashValue"] === "string" &&
    Array.isArray(integrity["signedPayloadFields"])
  );
}

function verifyProvidedDemoPackageIntegrity(value: unknown, now: string) {
  if (!isDemoPackageLike(value)) {
    return {
      ok: false,
      packageId: null,
      checkedAt: now,
      algorithm: "sha256",
      hashValue: null,
      expectedHashValue: null,
      signedPayloadFields: [],
      message: "Provided demo package is invalid or missing integrity metadata."
    };
  }

  const { integrity, ...payload } = value;
  const expectedIntegrity = createDemoPackageIntegrity(payload);

  const ok =
    integrity.algorithm === expectedIntegrity.algorithm &&
    integrity.hashValue === expectedIntegrity.hashValue &&
    integrity.signedPayloadFields.join("|") === expectedIntegrity.signedPayloadFields.join("|");

  return {
    ok,
    packageId: value.packageId,
    checkedAt: now,
    algorithm: integrity.algorithm,
    hashValue: integrity.hashValue,
    expectedHashValue: expectedIntegrity.hashValue,
    signedPayloadFields: integrity.signedPayloadFields,
    message: ok
      ? "Provided demo package integrity is valid."
      : "Provided demo package integrity hash does not match its payload."
  };
}
function verifyDemoPackageIntegrity(now: string) {
  const demoPackage = createDemoPackage(now);
  const { integrity, ...payload } = demoPackage;
  const expectedIntegrity = createDemoPackageIntegrity(payload);

  const ok =
    integrity.algorithm === expectedIntegrity.algorithm &&
    integrity.hashValue === expectedIntegrity.hashValue &&
    integrity.signedPayloadFields.join("|") === expectedIntegrity.signedPayloadFields.join("|");

  return {
    ok,
    packageId: demoPackage.packageId,
    checkedAt: now,
    algorithm: integrity.algorithm,
    hashValue: integrity.hashValue,
    expectedHashValue: expectedIntegrity.hashValue,
    signedPayloadFields: integrity.signedPayloadFields,
    message: ok
      ? "Demo package integrity is valid."
      : "Demo package integrity hash does not match expected payload hash."
  };
}
function handleRunGuidedDemo(request: EdgeRouteRequest): EdgeRouteResponse {
  const resetBeforeRun = getBooleanBodyValue(request.body, "resetBeforeRun", true);

  if (resetBeforeRun) {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
    resetAuditStore();
    resetEvidenceStore();
  }

  const suffixBase = normalizeDemoSuffix(request.now);
  const firstSyncRequest = createGuidedDemoSyncRequest({
    suffix: `accepted_${suffixBase}`,
    expectedAggregateVersion: 0,
    now: request.now
  });

  const firstSync = reconcileAndRecordGuidedDemoSync(firstSyncRequest, request.now);

  const secondSyncRequest = createGuidedDemoSyncRequest({
    suffix: `conflict_${suffixBase}`,
    expectedAggregateVersion: 0,
    now: request.now
  });

  const secondSync = reconcileAndRecordGuidedDemoSync(secondSyncRequest, request.now);

  const relatedEventId = String(firstSyncRequest.batch.events[0]?.eventId ?? "event_guided_demo_missing");

  const evidence = recordTextEvidence({
    content: JSON.stringify(
      {
        type: "FeatureCollection",
        name: "guided-demo-evidence",
        generatedAt: request.now,
        features: []
      },
      null,
      2
    ),
    evidenceKind: "geojson",
    storageProvider: "edge_filesystem",
    storageKey: `evidence/geojson/guided-demo-${suffixBase}.geojson`,
    fileName: `guided-demo-${suffixBase}.geojson`,
    mimeType: "application/geo+json",
    relatedEntityId: "stockpile_pet_coke_001",
    relatedEventId,
    registeredAt: request.now
  });

  const evidenceAuditEntry = recordEvidenceRegisteredAudit({
    evidence,
    createdAt: request.now
  });

  return jsonResponse(
    200,
    createApiSuccess(
      {
        guidedDemo: {
          resetBeforeRun,
          firstSyncStatus: firstSync.firstStatus,
          secondSyncStatus: secondSync.firstStatus,
          evidenceId: String(evidence.metadata.evidenceId),
          evidenceHash: evidence.metadata.integrity.hashValue,
          auditHash: evidenceAuditEntry.integrityHash
        },
        readiness: createDemoReadinessReport(request.now),
        summary: getSyncSummary(),
        resolutions: getConflictResolutions(),
        auditSummary: getAuditSummary(),
        evidenceSummary: getEvidenceSummary()
      },
      request.requestId,
      request.now
    )
  );
}
function handleImportDemoPackage(request: EdgeRouteRequest): EdgeRouteResponse {
  const packagePayload = getDemoPackageFromBody(request.body);
  const verification = verifyProvidedDemoPackageIntegrity(packagePayload, request.now);
  const replaceExistingStore = getBooleanBodyValue(request.body, "replaceExistingStore", true);

  if (!verification.ok || !isDemoPackageLike(packagePayload) || !isEdgeOfflineBackup(packagePayload.backup)) {
    return jsonResponse(
      400,
      createApiFailure(
        createApiError(
          "bad_request",
          verification.message ?? "Invalid or unverifiable demo package import payload."
        ),
        request.requestId,
        request.now
      )
    );
  }

  try {
    const importResult = importEdgeStore(packagePayload.backup.syncStore, replaceExistingStore);

    const conflictImportResult = importConflictResolutionStore(
      packagePayload.backup.conflictResolutions,
      replaceExistingStore
    );

    const auditImportResult =
      packagePayload.backup.auditStore !== undefined
        ? importAuditStore(packagePayload.backup.auditStore, replaceExistingStore)
        : {
            importedAuditEntries: 0,
            replacedExistingStore: replaceExistingStore
          };

    const evidenceImportResult =
      packagePayload.backup.evidenceStore !== undefined
        ? importEvidenceStore(packagePayload.backup.evidenceStore, replaceExistingStore)
        : {
            importedEvidenceItems: 0,
            replacedExistingStore: replaceExistingStore
          };

    return jsonResponse(
      200,
      createApiSuccess(
        {
          imported: true,
          verification,
          importResult,
          conflictImportResult,
          auditImportResult,
          evidenceImportResult,
          summary: getSyncSummary(),
          resolutions: getConflictResolutions(),
          auditSummary: getAuditSummary(),
          evidenceSummary: getEvidenceSummary(),
          readiness: createDemoReadinessReport(request.now)
        },
        request.requestId,
        request.now
      )
    );
  } catch {
    return jsonResponse(
      400,
      createApiFailure(
        createApiError("bad_request", "Failed to import verified demo package backup."),
        request.requestId,
        request.now
      )
    );
  }
}
function handleResetDemoState(request: EdgeRouteRequest): EdgeRouteResponse {
  resetEdgeMemoryStore();
  resetConflictResolutionStore();
  resetAuditStore();
  resetEvidenceStore();

  return jsonResponse(
    200,
    createApiSuccess(
      {
        reset: true,
        message: "Local edge demo state was reset.",
        summary: getSyncSummary(),
        resolutions: getConflictResolutions(),
        auditSummary: getAuditSummary(),
        evidenceSummary: getEvidenceSummary()
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
    return jsonResponse(200, createApiSuccess(createManifest(request.now), request.requestId, request.now));
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
    return jsonResponse(200, createApiSuccess({ seed: cooperSmokeSeed }, request.requestId, request.now));
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
    return jsonResponse(200, createApiSuccess({ summary: getSyncSummary() }, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/sync/export") {
    const backup = createOfflineBackup(request.now);

    return jsonResponse(
      200,
      createApiSuccess(
        {
          backup,
          store: backup.syncStore,
          conflictResolutions: backup.conflictResolutions,
          auditStore: backup.auditStore,
          evidenceStore: backup.evidenceStore
        },
        request.requestId,
        request.now
      )
    );
  }

  if (request.method === "POST" && request.pathname === "/sync/import") {
    return handleStoreImport(request);
  }

  if (request.method === "GET" && request.pathname === "/sync/conflicts/resolutions") {
    return jsonResponse(
      200,
      createApiSuccess({ resolutions: getConflictResolutions() }, request.requestId, request.now)
    );
  }

  if (request.method === "POST" && request.pathname === "/sync/conflicts/resolve") {
    return handleConflictResolution(request);
  }

  if (request.method === "GET" && request.pathname === "/audit/entries") {
    return jsonResponse(200, createApiSuccess({ entries: getAuditEntries() }, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/audit/summary") {
    return jsonResponse(200, createApiSuccess({ summary: getAuditSummary() }, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/audit/verify") {
    return jsonResponse(
      200,
      createApiSuccess({ verification: verifyEdgeAuditChain() }, request.requestId, request.now)
    );
  }

  if (request.method === "POST" && request.pathname === "/evidence/register") {
    return handleEvidenceRegister(request);
  }

  if (request.method === "GET" && request.pathname === "/evidence/items") {
    return jsonResponse(200, createApiSuccess({ items: getEvidenceItems() }, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/evidence/summary") {
    return jsonResponse(200, createApiSuccess({ summary: getEvidenceSummary() }, request.requestId, request.now));
  }

  if (request.method === "GET" && request.pathname === "/evidence/verify") {
    return jsonResponse(
      200,
      createApiSuccess({ verification: verifyEvidenceStore() }, request.requestId, request.now)
    );
  }

  if (request.method === "POST" && request.pathname === "/admin/run-guided-demo") {
    return handleRunGuidedDemo(request);
  }
  if (request.method === "GET" && request.pathname === "/admin/demo-report") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          report: createDemoExecutiveReport(request.now)
        },
        request.requestId,
        request.now
      )
    );
  }
  if (request.method === "POST" && request.pathname === "/admin/demo-package/import") {
    return handleImportDemoPackage(request);
  }
  if (request.method === "POST" && request.pathname === "/admin/demo-package/verify") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          verification: verifyProvidedDemoPackageIntegrity(getDemoPackageFromBody(request.body), request.now)
        },
        request.requestId,
        request.now
      )
    );
  }
  if (request.method === "GET" && request.pathname === "/admin/demo-package/verify") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          verification: verifyDemoPackageIntegrity(request.now)
        },
        request.requestId,
        request.now
      )
    );
  }
  if (request.method === "GET" && request.pathname === "/admin/demo-package") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          package: createDemoPackage(request.now)
        },
        request.requestId,
        request.now
      )
    );
  }
  if (request.method === "POST" && request.pathname === "/admin/reset-demo-state") {
    return handleResetDemoState(request);
  }
  if (request.method === "GET" && request.pathname === "/admin/demo-readiness") {
    return jsonResponse(
      200,
      createApiSuccess(
        {
          readiness: createDemoReadinessReport(request.now)
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