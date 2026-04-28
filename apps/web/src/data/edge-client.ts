import { cooperSmokeSeed, type SmokeTenantSeed } from "@iyi/seed-data";

const defaultEdgeBaseUrl = "http://localhost:8787";

export type SmokeSeedSource = "edge" | "local_fallback";

export interface LoadSmokeSeedResult {
  readonly seed: SmokeTenantSeed;
  readonly source: SmokeSeedSource;
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