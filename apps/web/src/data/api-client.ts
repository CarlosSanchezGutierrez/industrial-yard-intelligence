import type {
  CloudApiCreateStockpilePayloadContract,
  CloudApiCreateStockpileRequestContract,
  CloudApiHealthPayloadContract,
  CloudApiStockpileStatusContract,
  CloudApiStockpileSummaryContract,
  CloudApiSystemOverviewPayloadContract,
  CloudApiTenantSummaryContract,
  CloudApiUpdateStockpileStatusPayloadContract,
  CloudApiUpdateStockpileStatusRequestContract
} from "@iyi/api-contracts";

interface ApiEnvelope<TData> {
  readonly ok: boolean;
  readonly data?: TData;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
  readonly requestId: string;
  readonly timestamp: string;
}

export interface CloudApiDashboardSnapshot {
  readonly loadedAt: string;
  readonly health: CloudApiHealthPayloadContract;
  readonly overview: CloudApiSystemOverviewPayloadContract;
  readonly tenants: readonly CloudApiTenantSummaryContract[];
  readonly stockpiles: readonly CloudApiStockpileSummaryContract[];
}

export interface CloudApiDashboardResult {
  readonly ok: boolean;
  readonly source: "api" | "unavailable";
  readonly snapshot: CloudApiDashboardSnapshot | null;
  readonly message: string;
}

export interface CreateCloudStockpileResult {
  readonly ok: boolean;
  readonly source: "api" | "unavailable";
  readonly stockpile: CloudApiStockpileSummaryContract | null;
  readonly message: string;
}

export interface UpdateCloudStockpileStatusResult {
  readonly ok: boolean;
  readonly source: "api" | "unavailable";
  readonly stockpile: CloudApiStockpileSummaryContract | null;
  readonly message: string;
}

function getApiBaseUrl(): string {
  const maybeEnv = (import.meta as ImportMeta & {
    readonly env?: Readonly<Record<string, string | undefined>>;
  }).env;

  return maybeEnv?.["VITE_IYI_API_BASE_URL"] ?? "http://localhost:8788";
}

async function requestApi<TData>(path: string): Promise<TData> {
  const apiBaseUrl = getApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "GET",
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`API endpoint ${path} responded with HTTP ${response.status}.`);
  }

  const body = (await response.json()) as ApiEnvelope<TData>;

  if (!body.ok || body.data === undefined) {
    throw new Error(body.error?.message ?? `API endpoint ${path} returned invalid payload.`);
  }

  return body.data;
}

async function sendJsonApi<TRequest, TData>(
  method: "POST" | "PATCH",
  path: string,
  payload: TRequest
): Promise<TData> {
  const apiBaseUrl = getApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const body = (await response.json()) as ApiEnvelope<TData>;

  if (!response.ok || !body.ok || body.data === undefined) {
    throw new Error(body.error?.message ?? `API endpoint ${path} responded with HTTP ${response.status}.`);
  }

  return body.data;
}

export async function loadCloudApiDashboardSnapshot(): Promise<CloudApiDashboardResult> {
  const apiBaseUrl = getApiBaseUrl();

  try {
    const [health, overviewPayload, tenantsPayload, stockpilesPayload] = await Promise.all([
      requestApi<CloudApiHealthPayloadContract>("/health"),
      requestApi<CloudApiSystemOverviewPayloadContract>("/system/overview"),
      requestApi<{ readonly tenants: readonly CloudApiTenantSummaryContract[] }>("/tenants"),
      requestApi<{ readonly stockpiles: readonly CloudApiStockpileSummaryContract[] }>("/stockpiles")
    ]);

    const snapshot: CloudApiDashboardSnapshot = {
      loadedAt: new Date().toISOString(),
      health,
      overview: overviewPayload,
      tenants: tenantsPayload.tenants,
      stockpiles: stockpilesPayload.stockpiles
    };

    return {
      ok: true,
      source: "api",
      snapshot,
      message: `Loaded cloud API: ${snapshot.tenants.length} tenants, ${snapshot.stockpiles.length} stockpiles.`
    };
  } catch {
    return {
      ok: false,
      source: "unavailable",
      snapshot: null,
      message: `Cloud API unavailable at ${apiBaseUrl}. Start it with pnpm --filter @iyi/api dev.`
    };
  }
}

export async function createCloudApiStockpile(
  request: CloudApiCreateStockpileRequestContract
): Promise<CreateCloudStockpileResult> {
  const apiBaseUrl = getApiBaseUrl();

  try {
    const payload = await sendJsonApi<
      CloudApiCreateStockpileRequestContract,
      CloudApiCreateStockpilePayloadContract
    >("POST", "/stockpiles", request);

    return {
      ok: true,
      source: "api",
      stockpile: payload.stockpile,
      message: `Created stockpile ${payload.stockpile.name}.`
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : `Cloud API unavailable at ${apiBaseUrl}.`;

    return {
      ok: false,
      source: "unavailable",
      stockpile: null,
      message
    };
  }
}

export async function updateCloudApiStockpileStatus(
  stockpileId: string,
  status: CloudApiStockpileStatusContract
): Promise<UpdateCloudStockpileStatusResult> {
  const apiBaseUrl = getApiBaseUrl();

  const request: CloudApiUpdateStockpileStatusRequestContract = {
    status,
    validationState: status === "validated" ? "supervisor_validated" : `status_${status}`,
    confidenceLevel: status === "validated" ? "reviewed" : "operator_input"
  };

  try {
    const payload = await sendJsonApi<
      CloudApiUpdateStockpileStatusRequestContract,
      CloudApiUpdateStockpileStatusPayloadContract
    >("PATCH", `/stockpiles/${encodeURIComponent(stockpileId)}/status`, request);

    return {
      ok: true,
      source: "api",
      stockpile: payload.stockpile,
      message: `Updated ${payload.stockpile.name} to ${payload.stockpile.status}.`
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : `Cloud API unavailable at ${apiBaseUrl}.`;

    return {
      ok: false,
      source: "unavailable",
      stockpile: null,
      message
    };
  }
}