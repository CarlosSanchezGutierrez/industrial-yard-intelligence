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
  const eventId = asEventId(`event_web_demo_${Date.now()}`);

  return {
    context: {
      tenantId,
      terminalId,
      userId,
      deviceId
    },
    batch: {
      batchId: `batch_web_demo_${Date.now()}`,
      tenantId,
      terminalId,
      deviceId,
      createdAtClient: new Date().toISOString(),
      events: [
        {
          syncEnvelopeId: asSyncEnvelopeId(`sync_web_demo_${Date.now()}`),
          eventId,
          eventType: "WEB_DEMO_MOVEMENT_RECORDED",
          eventVersion: 1,
          tenantId,
          terminalId,
          userId,
          deviceId,
          sourceRuntime: "mobile",
          createdAtClient: new Date().toISOString(),
          localSequence: Date.now(),
          idempotencyKey: `tenant_cooper_tsmith:device_web_demo:${Date.now()}:${eventId}`,
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