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

export interface EdgeSyncSnapshot {
  readonly ok: boolean;
  readonly source: "edge" | "unavailable";
  readonly summary: EdgeSyncSummary | null;
  readonly events: readonly EdgeSyncEvent[];
  readonly conflictResolutions: readonly EdgeConflictResolution[];
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
  readonly error?: {
    readonly code: string;
    readonly message: string;
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
    readonly code: string;
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
  const eventId = asEventId(`event_web_demo_${now}`);

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
          idempotencyKey: `tenant_cooper_tsmith:device_web_demo:${now}:${eventId}`,
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

export async function loadEdgeSyncSnapshot(): Promise<EdgeSyncSnapshot> {
  const edgeBaseUrl = getEdgeBaseUrl();

  try {
    const [summaryResponse, eventsResponse, resolutionsResponse] = await Promise.all([
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
      })
    ]);

    if (!summaryResponse.ok || !eventsResponse.ok || !resolutionsResponse.ok) {
      return {
        ok: false,
        source: "unavailable",
        summary: null,
        events: [],
        conflictResolutions: [],
        message: "Edge sync monitor endpoints are unavailable."
      };
    }

    const summaryBody = (await summaryResponse.json()) as EdgeSummaryResponse;
    const eventsBody = (await eventsResponse.json()) as EdgeEventsResponse;
    const resolutionsBody = (await resolutionsResponse.json()) as EdgeConflictResolutionsResponse;

    return {
      ok: summaryBody.ok && eventsBody.ok && resolutionsBody.ok,
      source: "edge",
      summary: summaryBody.data?.summary ?? null,
      events: eventsBody.data?.events ?? [],
      conflictResolutions: resolutionsBody.data?.resolutions ?? [],
      message: "Loaded sync summary, event history and conflict resolutions from local edge."
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
      summary: null,
      events: [],
      conflictResolutions: [],
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
      message: `Conflict ${eventId} marked as reviewed.`
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
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
        message: `Exported ${backup.syncStore.batches.length} batches, ${backup.syncStore.events.length} events and ${backup.conflictResolutions.resolutions.length} conflict resolutions from local edge.`
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