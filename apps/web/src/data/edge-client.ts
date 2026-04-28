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

export interface EdgeSyncSnapshot {
  readonly ok: boolean;
  readonly source: "edge" | "unavailable";
  readonly summary: EdgeSyncSummary | null;
  readonly events: readonly EdgeSyncEvent[];
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
  readonly error?: {
    readonly code: string;
    readonly message: string;
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
    const [summaryResponse, eventsResponse] = await Promise.all([
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
      })
    ]);

    if (!summaryResponse.ok || !eventsResponse.ok) {
      return {
        ok: false,
        source: "unavailable",
        summary: null,
        events: [],
        message: "Edge sync monitor endpoints are unavailable."
      };
    }

    const summaryBody = (await summaryResponse.json()) as EdgeSummaryResponse;
    const eventsBody = (await eventsResponse.json()) as EdgeEventsResponse;

    return {
      ok: summaryBody.ok && eventsBody.ok,
      source: "edge",
      summary: summaryBody.data?.summary ?? null,
      events: eventsBody.data?.events ?? [],
      message: "Loaded sync summary and event history from local edge."
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
      summary: null,
      events: [],
      message: `Local edge server unavailable at ${edgeBaseUrl}.`
    };
  }
}