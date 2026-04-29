import type {
    CloudEdgeSyncConflictPolicyContract,
    CloudEdgeSyncIngestModeContract,
    CloudEdgeSyncIngestPayloadContract,
    CloudEdgeSyncIngestRequestContract,
    CloudEdgeSyncPackageContract,
    CloudEdgeSyncPreviewPayloadContract,
    CloudEdgeSyncPreviewRequestContract,
    CloudEdgeSyncStatusPayloadContract,
} from "@iyi/api-contracts";

type UnknownRequestRecord = Record<string, unknown>;
type RouteCore<TRequest, TResponse> = (request: TRequest) => TResponse | Promise<TResponse>;

const supportedPackageKinds = [
    "db_projection_snapshot",
    "audit_mutation_delta",
    "evidence_manifest",
    "full_demo_package",
] as const;

const supportedConflictPolicies = [
    "reject",
    "prefer_cloud",
    "prefer_edge",
    "manual_review",
] as const;

const supportedDirections = [
    "edge_to_cloud",
    "cloud_to_edge",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(record: Record<string, unknown>, keys: readonly string[]): string | undefined {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "string" && value.trim().length > 0) {
            return value;
        }

        if (typeof value === "number") {
            return String(value);
        }
    }

    return undefined;
}

function getRequestMethod(request: UnknownRequestRecord): string | undefined {
    return getString(request, ["method"])?.toUpperCase();
}

function getRequestPathname(request: UnknownRequestRecord): string {
    return getString(request, ["pathname", "path", "url"]) ?? "";
}

function getRequestBody(request: UnknownRequestRecord): unknown {
    for (const key of ["body", "json", "payload", "data"]) {
        if (key in request) {
            return request[key];
        }
    }

    return undefined;
}

function parseBody(value: unknown): unknown {
    if (typeof value === "string") {
        try {
            return JSON.parse(value) as unknown;
        } catch {
            return value;
        }
    }

    return value;
}

function createSuccessRouteResponse(data: unknown): unknown {
    return {
        statusCode: 200,
        body: {
            ok: true,
            data,
        },
    };
}

function createFailureRouteResponse(code: string, message: string): unknown {
    return {
        statusCode: 400,
        body: {
            ok: false,
            error: {
                code,
                message,
            },
        },
    };
}

function isSupportedConflictPolicy(value: unknown): value is CloudEdgeSyncConflictPolicyContract {
    return typeof value === "string" && supportedConflictPolicies.includes(
        value as CloudEdgeSyncConflictPolicyContract,
    );
}

function isSupportedIngestMode(value: unknown): value is CloudEdgeSyncIngestModeContract {
    return value === "preview" || value === "apply";
}

function readSyncPackage(value: unknown): CloudEdgeSyncPackageContract | null {
    if (!isRecord(value)) {
        return null;
    }

    const packageValue = value["package"];

    if (!isRecord(packageValue)) {
        return null;
    }

    const manifest = packageValue["manifest"];

    if (!isRecord(manifest)) {
        return null;
    }

    const packageId = manifest["packageId"];
    const payloadRecordCount = manifest["payloadRecordCount"];

    if (typeof packageId !== "string" || packageId.trim().length === 0) {
        return null;
    }

    if (typeof payloadRecordCount !== "number") {
        return null;
    }

    return packageValue as unknown as CloudEdgeSyncPackageContract;
}

function createSyncStatusPayload(): CloudEdgeSyncStatusPayloadContract {
    return {
        enabled: false,
        supportedPackageKinds,
        supportedConflictPolicies,
        supportedDirections,
    };
}

function createPreviewPayload(request: CloudEdgeSyncPreviewRequestContract): CloudEdgeSyncPreviewPayloadContract {
    return {
        packageId: request.package.manifest.packageId,
        accepted: true,
        ingestMode: "preview",
        conflictPolicy: request.conflictPolicy,
        detectedRecordCount: request.package.manifest.payloadRecordCount,
        detectedConflictCount: 0,
        warnings: [
            "Preview endpoint is active. Record application is intentionally disabled at this stage.",
        ],
    };
}

function createIngestPayload(request: CloudEdgeSyncIngestRequestContract): CloudEdgeSyncIngestPayloadContract {
    if (request.ingestMode === "preview") {
        return {
            packageId: request.package.manifest.packageId,
            accepted: true,
            ingestMode: "preview",
            appliedRecordCount: 0,
            skippedRecordCount: request.package.manifest.payloadRecordCount,
            conflictCount: 0,
            auditEntryIds: [],
            warnings: [
                "Ingest request used preview mode. No records were applied.",
            ],
        };
    }

    return {
        packageId: request.package.manifest.packageId,
        accepted: false,
        ingestMode: "apply",
        appliedRecordCount: 0,
        skippedRecordCount: request.package.manifest.payloadRecordCount,
        conflictCount: 0,
        auditEntryIds: [],
        warnings: [
            "Apply mode is not enabled yet. This endpoint currently validates the contract only.",
        ],
    };
}

function handleSyncPreview(request: UnknownRequestRecord): unknown {
    const body = parseBody(getRequestBody(request));

    if (!isRecord(body)) {
        return createFailureRouteResponse("invalid_sync_preview_request", "Sync preview request body must be an object.");
    }

    const syncPackage = readSyncPackage(body);

    if (!syncPackage) {
        return createFailureRouteResponse("invalid_sync_package", "Sync preview request did not include a valid package.");
    }

    const conflictPolicy = body["conflictPolicy"];

    if (!isSupportedConflictPolicy(conflictPolicy)) {
        return createFailureRouteResponse("invalid_conflict_policy", "Sync preview request used an unsupported conflict policy.");
    }

    return createSuccessRouteResponse(
        createPreviewPayload({
            package: syncPackage,
            conflictPolicy,
        }),
    );
}

function handleSyncIngest(request: UnknownRequestRecord): unknown {
    const body = parseBody(getRequestBody(request));

    if (!isRecord(body)) {
        return createFailureRouteResponse("invalid_sync_ingest_request", "Sync ingest request body must be an object.");
    }

    const syncPackage = readSyncPackage(body);

    if (!syncPackage) {
        return createFailureRouteResponse("invalid_sync_package", "Sync ingest request did not include a valid package.");
    }

    const conflictPolicy = body["conflictPolicy"];
    const ingestMode = body["ingestMode"];

    if (!isSupportedConflictPolicy(conflictPolicy)) {
        return createFailureRouteResponse("invalid_conflict_policy", "Sync ingest request used an unsupported conflict policy.");
    }

    if (!isSupportedIngestMode(ingestMode)) {
        return createFailureRouteResponse("invalid_ingest_mode", "Sync ingest request used an unsupported ingest mode.");
    }

    return createSuccessRouteResponse(
        createIngestPayload({
            package: syncPackage,
            ingestMode,
            conflictPolicy,
        }),
    );
}

function tryHandleSyncRoute(request: UnknownRequestRecord): unknown | null {
    const method = getRequestMethod(request);
    const pathname = getRequestPathname(request);

    if (method === "GET" && pathname === "/sync/status") {
        return createSuccessRouteResponse(createSyncStatusPayload());
    }

    if (method === "POST" && pathname === "/sync/preview") {
        return handleSyncPreview(request);
    }

    if (method === "POST" && pathname === "/sync/ingest") {
        return handleSyncIngest(request);
    }

    return null;
}

export function wrapCloudApiSyncRoutes<TRequest, TResponse>(
    coreRoute: RouteCore<TRequest, TResponse>,
): (request: TRequest) => Promise<Awaited<TResponse>> {
    return async (request: TRequest): Promise<Awaited<TResponse>> => {
        const requestRecord = isRecord(request) ? (request as UnknownRequestRecord) : {};
        const syncRouteResponse = tryHandleSyncRoute(requestRecord);

        if (syncRouteResponse) {
            return syncRouteResponse as Awaited<TResponse>;
        }

        return coreRoute(request) as Promise<Awaited<TResponse>>;
    };
}