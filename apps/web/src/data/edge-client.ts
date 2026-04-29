import type { SyncSubmitRequest } from "@iyi/api-contracts";
import {
  asAggregateId,
  asDeviceId,
  asEventId,
  asSyncEnvelopeId,
  asTenantId,
  asTerminalId,
  asUserId
} from "@iyi/kernel";
import { cooperSmokeSeed, type SmokeTenantSeed } from "@iyi/seed-data";

const defaultEdgeBaseUrl = "http://localhost:8787";

export type SmokeSeedSource = "edge" | "local_fallback";

export interface LoadSmokeSeedResult {
  readonly seed: SmokeTenantSeed;
  readonly source: SmokeSeedSource;
  readonly message: string;
}

export interface SubmitSyncDemoResult {
  readonly ok: boolean;
  readonly source: "edge" | "unavailable";
  readonly status: string;
  readonly message: string;
}

export interface EdgeSyncSummary {
  readonly totalBatches: number;
  readonly totalEvents: number;
  readonly accepted: number;
  readonly conflicts: number;
  readonly rejected: number;
  readonly invalid: number;
  readonly duplicates: number;
  readonly pendingReview: number;
  readonly superseded: number;
}

export interface EdgeSyncEvent {
  readonly eventId: string;
  readonly idempotencyKey?: string;
  readonly eventType: string;
  readonly tenantId: string;
  readonly terminalId?: string;
  readonly userId: string;
  readonly deviceId: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly validationState: string;
  readonly confidenceLevel?: string;
  readonly createdAtClient: string;
  readonly receivedAtEdge: string;
  readonly status: string;
  readonly message?: string;
  readonly conflictType?: string;
}

export interface EdgeConflictResolution {
  readonly resolutionId: string;
  readonly eventId: string;
  readonly decision: string;
  readonly note: string;
  readonly resolvedByUserId: string;
  readonly resolvedByDeviceId: string;
  readonly resolvedAt: string;
}

export interface EdgeAuditSummary {
  readonly totalEntries: number;
  readonly chainValid: boolean;
  readonly verificationMessage: string;
}

export interface EdgeAuditEntry {
  readonly auditEventId: string;
  readonly actionType: string;
  readonly affectedEntityId: string;
  readonly affectedEntityType: string;
  readonly result: string;
  readonly sourceRuntime: string;
  readonly userId: string;
  readonly deviceId: string;
  readonly createdAt: string;
  readonly previousHash: string | null;
  readonly integrityHash: string;
}

export interface EdgeEvidenceSummary {
  readonly totalEvidenceItems: number;
  readonly verifiedItems: number;
  readonly failedItems: number;
}

export interface EdgeEvidenceIntegrity {
  readonly algorithm: "sha256";
  readonly hashValue: string;
  readonly byteSize: number;
}

export interface EdgeEvidenceMetadata {
  readonly evidenceId: string;
  readonly evidenceKind: string;
  readonly storageProvider: string;
  readonly storageKey: string;
  readonly fileName?: string;
  readonly mimeType?: string;
  readonly integrity: EdgeEvidenceIntegrity;
  readonly immutable: true;
  readonly createdAt: string;
}

export interface EdgeEvidenceItem {
  readonly metadata: EdgeEvidenceMetadata;
  readonly contentText: string;
  readonly registeredAt: string;
}

export interface EdgeEvidenceVerification {
  readonly ok: boolean;
  readonly checkedItems: number;
  readonly failedEvidenceIds: readonly string[];
}

export interface RegisterEvidenceResult {
  readonly ok: boolean;
  readonly source: "edge" | "unavailable";
  readonly message: string;
}

export interface RunGuidedDemoResult {
  readonly ok: boolean;
  readonly message: string;
}

export interface ResetDemoStateResult {
  readonly ok: boolean;
  readonly message: string;
}

export interface DemoReadinessCheck {
  readonly id: string;
  readonly label: string;
  readonly ok: boolean;
  readonly detail: string;
}

export interface DemoReadinessReport {
  readonly status: "ready" | "attention" | "empty";
  readonly generatedAt: string;
  readonly hasOperationalData: boolean;
  readonly pendingConflictCount: number;
  readonly checks: readonly DemoReadinessCheck[];
}

export interface DemoReadinessResult {
  readonly ok: boolean;
  readonly source: "edge" | "unavailable";
  readonly readiness: DemoReadinessReport | null;
  readonly message: string;
}

export interface EdgeDemoReportMetric {
  readonly label: string;
  readonly value: number;
  readonly detail: string;
}

export interface EdgeDemoReportProofPoint {
  readonly label: string;
  readonly detail: string;
}

export interface EdgeDemoExecutiveReport {
  readonly reportId: string;
  readonly title: string;
  readonly customer: string;
  readonly generatedAt: string;
  readonly status: "ready_for_demo" | "needs_attention" | "empty_demo_state";
  readonly summary: readonly string[];
  readonly metrics: readonly EdgeDemoReportMetric[];
  readonly proofPoints: readonly EdgeDemoReportProofPoint[];
  readonly demoScript: readonly string[];
  readonly recommendedNextSteps: readonly string[];
  readonly readiness: DemoReadinessReport;
}

export interface DemoReportResult {
  readonly ok: boolean;
  readonly source: "edge" | "unavailable";
  readonly report: EdgeDemoExecutiveReport | null;
  readonly message: string;
}

export interface EdgeDemoPackage {
  readonly version: 1;
  readonly packageId: string;
  readonly customer: string;
  readonly product: string;
  readonly exportedAt: string;
  readonly contents: {
    readonly executiveReport: boolean;
    readonly offlineBackup: boolean;
    readonly syncStore: boolean;
    readonly conflictResolutions: boolean;
    readonly auditStore: boolean;
    readonly evidenceStore: boolean;
  };
  readonly report: EdgeDemoExecutiveReport;
  readonly backup: EdgeOfflineBackup;
}

export interface DemoPackageResult {
  readonly ok: boolean;
  readonly source: "edge" | "unavailable";
  readonly packageData: EdgeDemoPackage | null;
  readonly message: string;
}

export interface EdgeSyncSnapshot {
  readonly ok: boolean;
  readonly source: "edge" | "unavailable";
  readonly summary: EdgeSyncSummary | null;
  readonly events: readonly EdgeSyncEvent[];
  readonly conflictResolutions: readonly EdgeConflictResolution[];
  readonly auditSummary: EdgeAuditSummary | null;
  readonly auditEntries: readonly EdgeAuditEntry[];
  readonly evidenceSummary: EdgeEvidenceSummary | null;
  readonly evidenceItems: readonly EdgeEvidenceItem[];
  readonly evidenceVerification: EdgeEvidenceVerification | null;
  readonly demoReadiness: DemoReadinessReport | null;
  readonly message: string;
}

export interface EdgeStoreFile {
  readonly version: 1;
  readonly exportedAt?: string;
  readonly batches: readonly unknown[];
  readonly events: readonly unknown[];
  readonly aggregateVersions?: Record<string, number>;
}

export interface EdgeOfflineBackup {
  readonly version: 1;
  readonly exportedAt: string;
  readonly syncStore: EdgeStoreFile;
  readonly conflictResolutions: {
    readonly version: 1;
    readonly exportedAt?: string;
    readonly resolutions: readonly EdgeConflictResolution[];
  };
  readonly auditStore?: {
    readonly version: 1;
    readonly entries: readonly EdgeAuditEntry[];
  };
  readonly evidenceStore?: {
    readonly version: 1;
    readonly exportedAt?: string;
    readonly items: readonly EdgeEvidenceItem[];
  };
}

export interface EdgeStoreExportResult {
  readonly ok: boolean;
  readonly source: "edge" | "unavailable";
  readonly store: EdgeOfflineBackup | null;
  readonly message: string;
}

export interface EdgeStoreImportResult {
  readonly ok: boolean;
  readonly source: "edge" | "unavailable";
  readonly importedBatches: number;
  readonly importedEvents: number;
  readonly replacedExistingStore: boolean;
  readonly message: string;
}

export interface ResolveConflictResult {
  readonly ok: boolean;
  readonly source: "edge" | "unavailable";
  readonly message: string;
}

interface EdgeSeedResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly seed?: SmokeTenantSeed;
  };
}

interface EdgeSyncResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly result?: {
      readonly results?: readonly {
        readonly status?: string;
      }[];
    };
  };
}

interface EdgeSummaryResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly summary?: EdgeSyncSummary;
  };
}

interface EdgeEventsResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly events?: readonly EdgeSyncEvent[];
  };
}

interface EdgeConflictResolutionsResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly resolutions?: readonly EdgeConflictResolution[];
  };
}

interface EdgeAuditSummaryResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly summary?: EdgeAuditSummary;
  };
}

interface EdgeAuditEntriesResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly entries?: readonly EdgeAuditEntry[];
  };
}

interface EdgeEvidenceSummaryResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly summary?: EdgeEvidenceSummary;
  };
}

interface EdgeEvidenceItemsResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly items?: readonly EdgeEvidenceItem[];
  };
}

interface EdgeEvidenceVerifyResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly verification?: EdgeEvidenceVerification;
  };
}
interface DemoReadinessResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly readiness?: DemoReadinessReport;
  };
}
interface DemoReportResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly report?: EdgeDemoExecutiveReport;
  };
}
interface DemoPackageResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly package?: EdgeDemoPackage;
  };
}

interface EdgeEvidenceRegisterResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly evidence?: EdgeEvidenceItem;
    readonly summary?: EdgeEvidenceSummary;
    readonly verification?: EdgeEvidenceVerification;
  };
}

interface EdgeExportResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly backup?: EdgeOfflineBackup;
    readonly store?: EdgeStoreFile;
    readonly conflictResolutions?: {
      readonly version: 1;
      readonly exportedAt?: string;
      readonly resolutions: readonly EdgeConflictResolution[];
    };
  };
}

interface EdgeImportResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly importResult?: {
      readonly importedBatches: number;
      readonly importedEvents: number;
      readonly replacedExistingStore: boolean;
    };
  };
  readonly error?: {
    readonly message: string;
  };
}

function getEdgeBaseUrl(): string {
  return import.meta.env["VITE_EDGE_BASE_URL"] ?? defaultEdgeBaseUrl;
}

function isSmokeTenantSeed(value: unknown): value is SmokeTenantSeed {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<SmokeTenantSeed>;

  return (
    candidate.classification === "SIMULATED_DATA" &&
    typeof candidate.tenantName === "string" &&
    typeof candidate.terminalName === "string" &&
    Array.isArray(candidate.stockpiles) &&
    Array.isArray(candidate.equipment)
  );
}

function isEdgeStoreFile(value: unknown): value is EdgeStoreFile {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<EdgeStoreFile>;

  return candidate.version === 1 && Array.isArray(candidate.batches) && Array.isArray(candidate.events);
}

export async function loadCooperSmokeSeed(): Promise<LoadSmokeSeedResult> {
  const edgeBaseUrl = getEdgeBaseUrl();

  try {
    const response = await fetch(`${edgeBaseUrl}/seed/cooper-smoke`, {
      method: "GET",
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      return {
        seed: cooperSmokeSeed,
        source: "local_fallback",
        message: `Edge responded with HTTP ${response.status}; using local fallback seed.`
      };
    }

    const body = (await response.json()) as EdgeSeedResponse;
    const edgeSeed = body.data?.seed;

    if (!body.ok || !isSmokeTenantSeed(edgeSeed)) {
      return {
        seed: cooperSmokeSeed,
        source: "local_fallback",
        message: "Edge response did not contain a valid seed payload; using local fallback seed."
      };
    }

    return {
      seed: edgeSeed,
      source: "edge",
      message: `Loaded seed data from local edge server at ${edgeBaseUrl}.`
    };
  } catch {
    return {
      seed: cooperSmokeSeed,
      source: "local_fallback",
      message: `Local edge server unavailable at ${edgeBaseUrl}; using local fallback seed.`
    };
  }
}

function createDemoSyncRequest(): SyncSubmitRequest {
  const tenantId = asTenantId("tenant_cooper_tsmith");
  const terminalId = asTerminalId("terminal_altamira");
  const userId = asUserId("user_demo_operator");
  const deviceId = asDeviceId("device_web_demo");
  const now = Date.now();
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${now}`;
  const eventId = asEventId(`event_web_demo_${now}_${randomPart}`);

  return {
    context: {
      tenantId,
      terminalId,
      userId,
      deviceId
    },
    batch: {
      batchId: `batch_web_demo_${now}`,
      tenantId,
      terminalId,
      deviceId,
      createdAtClient: new Date().toISOString(),
      events: [
        {
          syncEnvelopeId: asSyncEnvelopeId(`sync_web_demo_${now}`),
          eventId,
          eventType: "WEB_DEMO_MOVEMENT_RECORDED",
          eventVersion: 1,
          tenantId,
          terminalId,
          userId,
          deviceId,
          sourceRuntime: "mobile",
          createdAtClient: new Date().toISOString(),
          localSequence: now,
          idempotencyKey: `tenant_cooper_tsmith:device_web_demo:${now}:${randomPart}:${eventId}`,
          aggregateType: "stockpile",
          aggregateId: asAggregateId("stockpile_pet_coke_001"),
          validationState: "operational",
          confidenceLevel: "simulated",
          payload: {
            movementType: "WEB_SMOKE_TEST",
            source: "apps/web",
            expectedAggregateVersion: 0,
            note: "Simulated sync event created from web smoke UI."
          }
        }
      ]
    }
  };
}

export async function submitDemoSyncBatch(): Promise<SubmitSyncDemoResult> {
  const edgeBaseUrl = getEdgeBaseUrl();
  const request = createDemoSyncRequest();

  try {
    const response = await fetch(`${edgeBaseUrl}/sync/batches`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      return {
        ok: false,
        source: "edge",
        status: `HTTP_${response.status}`,
        message: `Edge sync endpoint responded with HTTP ${response.status}.`
      };
    }

    const body = (await response.json()) as EdgeSyncResponse;
    const firstStatus = body.data?.result?.results?.[0]?.status ?? "unknown";

    return {
      ok: body.ok,
      source: "edge",
      status: firstStatus,
      message: `Edge accepted sync request. First event status: ${firstStatus}.`
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
      status: "edge_unavailable",
      message: `Local edge server unavailable at ${edgeBaseUrl}. Start apps/edge to test sync.`
    };
  }
}

export async function registerDemoEvidence(): Promise<RegisterEvidenceResult> {
  const edgeBaseUrl = getEdgeBaseUrl();
  const now = Date.now();

  try {
    const response = await fetch(`${edgeBaseUrl}/evidence/register`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        content: JSON.stringify(
          {
            type: "FeatureCollection",
            name: "web-demo-evidence",
            generatedAt: new Date(now).toISOString(),
            features: []
          },
          null,
          2
        ),
        evidenceKind: "geojson",
        storageProvider: "edge_filesystem",
        storageKey: `evidence/geojson/web-demo-${now}.geojson`,
        fileName: `web-demo-${now}.geojson`,
        mimeType: "application/geo+json",
        relatedEntityId: "stockpile_pet_coke_001",
        relatedEventId: `event_web_demo_${now}`
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        source: "edge",
        message: `Edge evidence endpoint responded with HTTP ${response.status}.`
      };
    }

    const body = (await response.json()) as EdgeEvidenceRegisterResponse;
    const evidence = body.data?.evidence;

    return {
      ok: body.ok,
      source: "edge",
      message:
        evidence !== undefined
          ? `Evidence registered with SHA-256 ${evidence.metadata.integrity.hashValue.slice(0, 12)}...`
          : "Evidence registered on local edge."
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
      message: `Local edge server unavailable at ${edgeBaseUrl}.`
    };
  }
}

export async function runGuidedDemoScenario(): Promise<RunGuidedDemoResult> {
  const edgeBaseUrl = getEdgeBaseUrl();

  try {
    const response = await fetch(`${edgeBaseUrl}/admin/run-guided-demo`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        resetBeforeRun: true
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Edge guided demo endpoint responded with HTTP ${response.status}.`
      };
    }

    const body = (await response.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly guidedDemo?: {
          readonly firstSyncStatus?: string;
          readonly secondSyncStatus?: string;
          readonly evidenceHash?: string;
        };
      };
    };

    const guidedDemo = body.data?.guidedDemo;

    return {
      ok: body.ok,
      message:
        guidedDemo !== undefined
          ? `Guided demo ran on edge: first sync=${guidedDemo.firstSyncStatus ?? "unknown"}, second sync=${guidedDemo.secondSyncStatus ?? "unknown"}, evidence=${guidedDemo.evidenceHash?.slice(0, 12) ?? "unknown"}...`
          : "Guided demo ran on edge."
    };
  } catch {
    return {
      ok: false,
      message: `Local edge server unavailable at ${edgeBaseUrl}.`
    };
  }
}

export async function loadEdgeSyncSnapshot(): Promise<EdgeSyncSnapshot> {
  const edgeBaseUrl = getEdgeBaseUrl();

  try {
    const [
      summaryResponse,
      eventsResponse,
      resolutionsResponse,
      auditSummaryResponse,
      auditEntriesResponse,
      evidenceSummaryResponse,
      evidenceItemsResponse,
      evidenceVerifyResponse,
      readinessResponse
    ] = await Promise.all([
      fetch(`${edgeBaseUrl}/sync/summary`, {
        method: "GET",
        headers: {
          accept: "application/json"
        }
      }),
      fetch(`${edgeBaseUrl}/sync/events`, {
        method: "GET",
        headers: {
          accept: "application/json"
        }
      }),
      fetch(`${edgeBaseUrl}/sync/conflicts/resolutions`, {
        method: "GET",
        headers: {
          accept: "application/json"
        }
      }),
      fetch(`${edgeBaseUrl}/audit/summary`, {
        method: "GET",
        headers: {
          accept: "application/json"
        }
      }),
      fetch(`${edgeBaseUrl}/audit/entries`, {
        method: "GET",
        headers: {
          accept: "application/json"
        }
      }),
      fetch(`${edgeBaseUrl}/evidence/summary`, {
        method: "GET",
        headers: {
          accept: "application/json"
        }
      }),
      fetch(`${edgeBaseUrl}/evidence/items`, {
        method: "GET",
        headers: {
          accept: "application/json"
        }
      }),
      fetch(`${edgeBaseUrl}/evidence/verify`, {
        method: "GET",
        headers: {
          accept: "application/json"
        }
      }),
      fetch(`${edgeBaseUrl}/admin/demo-readiness`, {
        method: "GET",
        headers: {
          accept: "application/json"
        }
      })
    ]);

    if (
      !summaryResponse.ok ||
      !eventsResponse.ok ||
      !resolutionsResponse.ok ||
      !auditSummaryResponse.ok ||
      !auditEntriesResponse.ok ||
      !evidenceSummaryResponse.ok ||
      !evidenceItemsResponse.ok ||
      !evidenceVerifyResponse.ok ||
      !readinessResponse.ok
    ) {
      return {
        ok: false,
        source: "unavailable",
        summary: null,
        events: [],
        conflictResolutions: [],
        auditSummary: null,
        auditEntries: [],
        evidenceSummary: null,
        evidenceItems: [],
        evidenceVerification: null,
        demoReadiness: null,
        message: "Edge sync, audit, evidence or readiness monitor endpoints are unavailable."
      };
    }

    const summaryBody = (await summaryResponse.json()) as EdgeSummaryResponse;
    const eventsBody = (await eventsResponse.json()) as EdgeEventsResponse;
    const resolutionsBody = (await resolutionsResponse.json()) as EdgeConflictResolutionsResponse;
    const auditSummaryBody = (await auditSummaryResponse.json()) as EdgeAuditSummaryResponse;
    const auditEntriesBody = (await auditEntriesResponse.json()) as EdgeAuditEntriesResponse;
    const evidenceSummaryBody = (await evidenceSummaryResponse.json()) as EdgeEvidenceSummaryResponse;
    const evidenceItemsBody = (await evidenceItemsResponse.json()) as EdgeEvidenceItemsResponse;
    const evidenceVerifyBody = (await evidenceVerifyResponse.json()) as EdgeEvidenceVerifyResponse;
    const readinessBody = (await readinessResponse.json()) as DemoReadinessResponse;

    return {
      ok:
        summaryBody.ok &&
        eventsBody.ok &&
        resolutionsBody.ok &&
        auditSummaryBody.ok &&
        auditEntriesBody.ok &&
        evidenceSummaryBody.ok &&
        evidenceItemsBody.ok &&
        evidenceVerifyBody.ok &&
        readinessBody.ok,
      source: "edge",
      summary: summaryBody.data?.summary ?? null,
      events: eventsBody.data?.events ?? [],
      conflictResolutions: resolutionsBody.data?.resolutions ?? [],
      auditSummary: auditSummaryBody.data?.summary ?? null,
      auditEntries: auditEntriesBody.data?.entries ?? [],
      evidenceSummary: evidenceSummaryBody.data?.summary ?? null,
      evidenceItems: evidenceItemsBody.data?.items ?? [],
      evidenceVerification: evidenceVerifyBody.data?.verification ?? null,
      demoReadiness: readinessBody.data?.readiness ?? null,
      message: "Loaded sync, conflict, audit, evidence and readiness state from local edge."
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
      summary: null,
      events: [],
      conflictResolutions: [],
      auditSummary: null,
      auditEntries: [],
      evidenceSummary: null,
      evidenceItems: [],
      evidenceVerification: null,
      demoReadiness: null,
      message: `Local edge server unavailable at ${edgeBaseUrl}.`
    };
  }
}

export async function resolveSyncConflict(eventId: string): Promise<ResolveConflictResult> {
  const edgeBaseUrl = getEdgeBaseUrl();

  try {
    const response = await fetch(`${edgeBaseUrl}/sync/conflicts/resolve`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        eventId,
        decision: "manual_action_required",
        note: "Conflict reviewed from web smoke UI.",
        resolvedByUserId: "user_supervisor_demo",
        resolvedByDeviceId: "device_web_supervisor"
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        source: "edge",
        message: `Edge conflict resolution endpoint responded with HTTP ${response.status}.`
      };
    }

    return {
      ok: true,
      source: "edge",
      message: `Conflict ${eventId} marked as reviewed and audited.`
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
      message: `Local edge server unavailable at ${edgeBaseUrl}.`
    };
  }
}

export async function loadDemoExecutiveReport(): Promise<DemoReportResult> {
  const edgeBaseUrl = getEdgeBaseUrl();

  try {
    const response = await fetch(`${edgeBaseUrl}/admin/demo-report`, {
      method: "GET",
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      return {
        ok: false,
        source: "edge",
        report: null,
        message: `Edge demo report endpoint responded with HTTP ${response.status}.`
      };
    }

    const body = (await response.json()) as DemoReportResponse;
    const report = body.data?.report ?? null;

    return {
      ok: body.ok && report !== null,
      source: "edge",
      report,
      message:
        report !== null
          ? `Loaded executive report ${report.reportId}.`
          : "Edge demo report response did not contain report payload."
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
      report: null,
      message: `Local edge server unavailable at ${edgeBaseUrl}.`
    };
  }
}
export async function exportDemoPackage(): Promise<DemoPackageResult> {
  const edgeBaseUrl = getEdgeBaseUrl();

  try {
    const response = await fetch(`${edgeBaseUrl}/admin/demo-package`, {
      method: "GET",
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      return {
        ok: false,
        source: "edge",
        packageData: null,
        message: `Edge demo package endpoint responded with HTTP ${response.status}.`
      };
    }

    const body = (await response.json()) as DemoPackageResponse;
    const packageData = body.data?.package ?? null;

    return {
      ok: body.ok && packageData !== null,
      source: "edge",
      packageData,
      message:
        packageData !== null
          ? `Exported demo package ${packageData.packageId}.`
          : "Edge demo package response did not contain package payload."
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
      packageData: null,
      message: `Local edge server unavailable at ${edgeBaseUrl}.`
    };
  }
}
export async function resetEdgeDemoState(): Promise<ResetDemoStateResult> {
  const edgeBaseUrl = getEdgeBaseUrl();

  try {
    const response = await fetch(`${edgeBaseUrl}/admin/reset-demo-state`, {
      method: "POST",
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Edge reset endpoint responded with HTTP ${response.status}.`
      };
    }

    return {
      ok: true,
      message: "Local edge demo state was reset."
    };
  } catch {
    return {
      ok: false,
      message: `Local edge server unavailable at ${edgeBaseUrl}.`
    };
  }
}
export async function exportEdgeSyncStore(): Promise<EdgeStoreExportResult> {
  const edgeBaseUrl = getEdgeBaseUrl();

  try {
    const response = await fetch(`${edgeBaseUrl}/sync/export`, {
      method: "GET",
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      return {
        ok: false,
        source: "edge",
        store: null,
        message: `Edge export endpoint responded with HTTP ${response.status}.`
      };
    }

    const body = (await response.json()) as EdgeExportResponse;
    const backup = body.data?.backup;

    if (body.ok && backup !== undefined) {
      return {
        ok: true,
        source: "edge",
        store: backup,
        message: `Exported ${backup.syncStore.batches.length} batches, ${backup.syncStore.events.length} events, ${backup.conflictResolutions.resolutions.length} conflict resolutions, ${backup.auditStore?.entries.length ?? 0} audit entries and ${backup.evidenceStore?.items.length ?? 0} evidence items from local edge.`
      };
    }

    const legacyStore = body.data?.store;

    if (!body.ok || !isEdgeStoreFile(legacyStore)) {
      return {
        ok: false,
        source: "edge",
        store: null,
        message: "Edge export response did not contain a valid backup payload."
      };
    }

    const legacyBackup: EdgeOfflineBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      syncStore: legacyStore,
      conflictResolutions: {
        version: 1,
        resolutions: body.data?.conflictResolutions?.resolutions ?? []
      }
    };

    return {
      ok: true,
      source: "edge",
      store: legacyBackup,
      message: `Exported ${legacyStore.batches.length} batches and ${legacyStore.events.length} events from local edge.`
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
      store: null,
      message: `Local edge server unavailable at ${edgeBaseUrl}.`
    };
  }
}

export async function importEdgeSyncStore(
  store: unknown,
  replaceExistingStore = true
): Promise<EdgeStoreImportResult> {
  const edgeBaseUrl = getEdgeBaseUrl();

  try {
    const response = await fetch(`${edgeBaseUrl}/sync/import`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        replaceExistingStore,
        store
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        source: "edge",
        importedBatches: 0,
        importedEvents: 0,
        replacedExistingStore: replaceExistingStore,
        message: `Edge import endpoint responded with HTTP ${response.status}.`
      };
    }

    const body = (await response.json()) as EdgeImportResponse;
    const importResult = body.data?.importResult;

    if (!body.ok || importResult === undefined) {
      return {
        ok: false,
        source: "edge",
        importedBatches: 0,
        importedEvents: 0,
        replacedExistingStore: replaceExistingStore,
        message: body.error?.message ?? "Edge import response did not contain import result."
      };
    }

    return {
      ok: true,
      source: "edge",
      importedBatches: importResult.importedBatches,
      importedEvents: importResult.importedEvents,
      replacedExistingStore: importResult.replacedExistingStore,
      message: `Imported ${importResult.importedBatches} batches and ${importResult.importedEvents} events into local edge.`
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
      importedBatches: 0,
      importedEvents: 0,
      replacedExistingStore: replaceExistingStore,
      message: `Local edge server unavailable at ${edgeBaseUrl}.`
    };
  }
}