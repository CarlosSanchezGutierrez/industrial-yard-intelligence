import type {
    CloudEdgeSyncConflictPolicyContract,
    CloudEdgeSyncIngestPayloadContract,
    CloudEdgeSyncIngestRequestContract,
    CloudEdgeSyncPackageContract,
    CloudEdgeSyncPreviewPayloadContract,
    CloudEdgeSyncPreviewRequestContract,
    CloudEdgeSyncStatusPayloadContract,
} from "@iyi/api-contracts";

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

function assertSyncStatusPayload(
    payload: CloudEdgeSyncStatusPayloadContract,
): CloudEdgeSyncStatusPayloadContract {
    if (typeof payload.enabled !== "boolean") {
        throw new Error("Cloud Edge sync status did not include enabled.");
    }

    if (!Array.isArray(payload.supportedPackageKinds)) {
        throw new Error("Cloud Edge sync status did not include supportedPackageKinds.");
    }

    if (!Array.isArray(payload.supportedConflictPolicies)) {
        throw new Error("Cloud Edge sync status did not include supportedConflictPolicies.");
    }

    if (!Array.isArray(payload.supportedDirections)) {
        throw new Error("Cloud Edge sync status did not include supportedDirections.");
    }

    return payload;
}

function assertSyncPreviewPayload(
    payload: CloudEdgeSyncPreviewPayloadContract,
): CloudEdgeSyncPreviewPayloadContract {
    if (typeof payload.packageId !== "string") {
        throw new Error("Cloud Edge sync preview did not include packageId.");
    }

    if (payload.ingestMode !== "preview") {
        throw new Error("Cloud Edge sync preview did not return preview ingestMode.");
    }

    return payload;
}

function assertSyncIngestPayload(
    payload: CloudEdgeSyncIngestPayloadContract,
): CloudEdgeSyncIngestPayloadContract {
    if (typeof payload.packageId !== "string") {
        throw new Error("Cloud Edge sync ingest did not include packageId.");
    }

    if (!Array.isArray(payload.warnings)) {
        throw new Error("Cloud Edge sync ingest did not include warnings.");
    }

    return payload;
}

async function loadCloudApiJson<TPayload>(
    path: string,
    init?: RequestInit,
    baseUrl = getCloudApiBaseUrl(),
): Promise<TPayload> {
    const response = await fetch(`${baseUrl.replace(/\/+$/u, "")}${path}`, {
        ...init,
        headers: {
            accept: "application/json",
            "x-request-id": "web-cloud-edge-sync",
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        throw new Error(`Cloud Edge sync request failed for ${path} with HTTP ${response.status}.`);
    }

    const body = (await response.json()) as unknown;

    return unwrapCloudApiData<TPayload>(body);
}

export function createDemoCloudEdgeSyncPackage(
    packageId: string,
    payloadRecordCount: number,
): CloudEdgeSyncPackageContract {
    return {
        manifest: {
            packageId,
            packageKind: "db_projection_snapshot",
            direction: "edge_to_cloud",
            createdAt: new Date().toISOString(),
            source: {
                tenantId: "tenant_cooper_t_smith",
                terminalId: "terminal_altamira",
                nodeId: "edge_altamira_yard_001",
                nodeRole: "edge",
            },
            target: {
                tenantId: "tenant_cooper_t_smith",
                terminalId: "terminal_altamira",
                nodeId: "cloud_primary",
                nodeRole: "cloud",
            },
            schemaVersion: "cloud-edge-sync-v1",
            payloadHash: `sha256:${packageId}`,
            payloadRecordCount,
        },
        payload: {
            stockpiles: [],
        },
    };
}

export async function loadCloudEdgeSyncStatus(
    baseUrl = getCloudApiBaseUrl(),
): Promise<CloudEdgeSyncStatusPayloadContract> {
    const payload = await loadCloudApiJson<CloudEdgeSyncStatusPayloadContract>(
        "/sync/status",
        undefined,
        baseUrl,
    );

    return assertSyncStatusPayload(payload);
}

export async function previewCloudEdgeSyncPackage(
    syncPackage: CloudEdgeSyncPackageContract,
    conflictPolicy: CloudEdgeSyncConflictPolicyContract = "manual_review",
    baseUrl = getCloudApiBaseUrl(),
): Promise<CloudEdgeSyncPreviewPayloadContract> {
    const requestBody: CloudEdgeSyncPreviewRequestContract = {
        package: syncPackage,
        conflictPolicy,
    };

    const payload = await loadCloudApiJson<CloudEdgeSyncPreviewPayloadContract>(
        "/sync/preview",
        {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestBody),
        },
        baseUrl,
    );

    return assertSyncPreviewPayload(payload);
}

export async function ingestCloudEdgeSyncPackagePreviewOnly(
    syncPackage: CloudEdgeSyncPackageContract,
    conflictPolicy: CloudEdgeSyncConflictPolicyContract = "reject",
    baseUrl = getCloudApiBaseUrl(),
): Promise<CloudEdgeSyncIngestPayloadContract> {
    const requestBody: CloudEdgeSyncIngestRequestContract = {
        package: syncPackage,
        ingestMode: "apply",
        conflictPolicy,
    };

    const payload = await loadCloudApiJson<CloudEdgeSyncIngestPayloadContract>(
        "/sync/ingest",
        {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestBody),
        },
        baseUrl,
    );

    return assertSyncIngestPayload(payload);
}