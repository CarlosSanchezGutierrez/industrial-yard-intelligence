import type {
    CloudApiAuditMutationEntryContract,
    CloudApiAuditMutationListPayloadContract,
    CloudApiAuditMutationSummaryPayloadContract,
} from "@iyi/api-contracts";

export interface CloudApiAuditDashboardSnapshot {
    readonly summary: CloudApiAuditMutationSummaryPayloadContract;
    readonly mutations: CloudApiAuditMutationListPayloadContract;
}

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

function assertAuditEntry(value: unknown): value is CloudApiAuditMutationEntryContract {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const record = value as Record<string, unknown>;

    if (typeof record["id"] !== "string") {
        return false;
    }

    const context = record["context"];

    if (!context || typeof context !== "object" || Array.isArray(context)) {
        return false;
    }

    const mutation = record["mutation"];

    if (!mutation || typeof mutation !== "object" || Array.isArray(mutation)) {
        return false;
    }

    return typeof (mutation as Record<string, unknown>)["type"] === "string";
}

function assertAuditMutationListPayload(
    payload: CloudApiAuditMutationListPayloadContract,
): CloudApiAuditMutationListPayloadContract {
    if (!Array.isArray(payload.entries)) {
        throw new Error("Audit mutation list payload did not include entries.");
    }

    if (!payload.entries.every(assertAuditEntry)) {
        throw new Error("Audit mutation list payload included invalid entries.");
    }

    return payload;
}

function assertAuditMutationSummaryPayload(
    payload: CloudApiAuditMutationSummaryPayloadContract,
): CloudApiAuditMutationSummaryPayloadContract {
    if (typeof payload.auditEntryCount !== "number") {
        throw new Error("Audit summary payload did not include auditEntryCount.");
    }

    if (!payload.mutationCountsByType || typeof payload.mutationCountsByType !== "object") {
        throw new Error("Audit summary payload did not include mutationCountsByType.");
    }

    return payload;
}

async function loadCloudApiJson<TPayload>(
    path: string,
    baseUrl = getCloudApiBaseUrl(),
): Promise<TPayload> {
    const response = await fetch(`${baseUrl.replace(/\/+$/u, "")}${path}`, {
        headers: {
            accept: "application/json",
            "x-request-id": "web-audit-mutations",
        },
    });

    if (!response.ok) {
        throw new Error(`Cloud API audit request failed for ${path} with HTTP ${response.status}.`);
    }

    const body = (await response.json()) as unknown;

    return unwrapCloudApiData<TPayload>(body);
}

export async function loadCloudApiAuditMutationSummary(
    baseUrl = getCloudApiBaseUrl(),
): Promise<CloudApiAuditMutationSummaryPayloadContract> {
    const payload = await loadCloudApiJson<CloudApiAuditMutationSummaryPayloadContract>(
        "/audit/summary",
        baseUrl,
    );

    return assertAuditMutationSummaryPayload(payload);
}

export async function loadCloudApiAuditMutations(
    baseUrl = getCloudApiBaseUrl(),
): Promise<CloudApiAuditMutationListPayloadContract> {
    const payload = await loadCloudApiJson<CloudApiAuditMutationListPayloadContract>(
        "/audit/mutations",
        baseUrl,
    );

    return assertAuditMutationListPayload(payload);
}

export async function loadCloudApiAuditDashboardSnapshot(
    baseUrl = getCloudApiBaseUrl(),
): Promise<CloudApiAuditDashboardSnapshot> {
    const [summary, mutations] = await Promise.all([
        loadCloudApiAuditMutationSummary(baseUrl),
        loadCloudApiAuditMutations(baseUrl),
    ]);

    return {
        summary,
        mutations,
    };
}