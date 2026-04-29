import type { CloudApiStockpileLifecyclePayloadContract } from "@iyi/api-contracts";

export type StockpileLifecycleDashboardSnapshot = CloudApiStockpileLifecyclePayloadContract;

const DEFAULT_CLOUD_API_BASE_URL = "http://localhost:8788";

function getCloudApiBaseUrl(): string {
    const configuredBaseUrl = import.meta.env.VITE_IYI_API_BASE_URL;

    if (typeof configuredBaseUrl === "string" && configuredBaseUrl.trim().length > 0) {
        return configuredBaseUrl.trim().replace(/\/+$/u, "");
    }

    return DEFAULT_CLOUD_API_BASE_URL;
}

function unwrapCloudApiData<TPayload>(body: unknown): TPayload {
    if (body && typeof body === "object" && "data" in body) {
        return (body as { data: TPayload }).data;
    }

    return body as TPayload;
}

function assertStockpileLifecyclePayload(
    payload: CloudApiStockpileLifecyclePayloadContract,
): CloudApiStockpileLifecyclePayloadContract {
    if (!Array.isArray(payload.statuses)) {
        throw new Error("Stockpile lifecycle payload did not include statuses.");
    }

    if (!Array.isArray(payload.transitions)) {
        throw new Error("Stockpile lifecycle payload did not include transitions.");
    }

    if (!payload.allowedTransitionsByStatus) {
        throw new Error("Stockpile lifecycle payload did not include allowedTransitionsByStatus.");
    }

    return payload;
}

export async function loadCloudApiStockpileLifecycle(
    baseUrl = getCloudApiBaseUrl(),
): Promise<StockpileLifecycleDashboardSnapshot> {
    const response = await fetch(`${baseUrl.replace(/\/+$/u, "")}/stockpiles/lifecycle`, {
        headers: {
            accept: "application/json",
            "x-request-id": "web-stockpile-lifecycle",
        },
    });

    if (!response.ok) {
        throw new Error(`Cloud API lifecycle request failed with HTTP ${response.status}.`);
    }

    const body = (await response.json()) as unknown;
    const payload = unwrapCloudApiData<CloudApiStockpileLifecyclePayloadContract>(body);

    return assertStockpileLifecyclePayload(payload);
}