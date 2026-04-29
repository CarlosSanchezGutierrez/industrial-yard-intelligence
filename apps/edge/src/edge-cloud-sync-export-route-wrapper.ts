import {
    createEdgeCloudSyncExportResponse,
    type EdgeCloudSyncExportPayloadContract,
} from "./edge-cloud-sync-export-handler.js";
import type { EdgeDbProjectionSyncSnapshot } from "./db-projection-sync-package.js";

type UnknownRequestRecord = Record<string, unknown>;
type RouteCore<TRequest, TResponse> = (request: TRequest) => TResponse;

const defaultTenantId = "tenant_cooper_t_smith";
const defaultTerminalId = "terminal_altamira";
const defaultEdgeNodeId = "edge_altamira_yard_001";
const defaultCloudNodeId = "cloud_primary";

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
    const rawPathname = getString(request, ["pathname", "path", "url"]) ?? "";

    if (rawPathname.startsWith("http://") || rawPathname.startsWith("https://")) {
        try {
            return new URL(rawPathname).pathname;
        } catch {
            return rawPathname;
        }
    }

    const queryIndex = rawPathname.indexOf("?");

    if (queryIndex >= 0) {
        return rawPathname.slice(0, queryIndex);
    }

    return rawPathname;
}

function getRequestNow(request: UnknownRequestRecord): Date {
    const now = request["now"];

    if (now instanceof Date) {
        return now;
    }

    if (typeof now === "string") {
        return new Date(now);
    }

    return new Date();
}

function getRequestSearchParams(request: UnknownRequestRecord): URLSearchParams {
    const searchParams = request["searchParams"];

    if (searchParams instanceof URLSearchParams) {
        return searchParams;
    }

    const query = request["query"];

    if (typeof query === "string") {
        return new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
    }

    const url = getString(request, ["url", "path", "pathname"]);

    if (url) {
        try {
            return new URL(url, "http://edge.local").searchParams;
        } catch {
            return new URLSearchParams();
        }
    }

    return new URLSearchParams();
}

function unwrapBody(response: unknown): unknown {
    if (!isRecord(response)) {
        return response;
    }

    if ("body" in response) {
        return response["body"];
    }

    return response;
}

function unwrapData(value: unknown): unknown {
    if (typeof value === "string") {
        try {
            return unwrapData(JSON.parse(value) as unknown);
        } catch {
            return value;
        }
    }

    if (isRecord(value) && "data" in value) {
        return value["data"];
    }

    return value;
}

function getResponseStatusCode(response: unknown): number | undefined {
    if (!isRecord(response)) {
        return undefined;
    }

    const statusCode = response["statusCode"];

    if (typeof statusCode === "number") {
        return statusCode;
    }

    const status = response["status"];

    if (typeof status === "number") {
        return status;
    }

    return undefined;
}

function isSuccessfulResponse(response: unknown): boolean {
    const statusCode = getResponseStatusCode(response);

    if (typeof statusCode === "number") {
        return statusCode >= 200 && statusCode < 300;
    }

    const body = unwrapBody(response);

    if (isRecord(body) && body["ok"] === false) {
        return false;
    }

    return true;
}

function createSnapshotRequest<TRequest>(request: TRequest): TRequest {
    if (!isRecord(request)) {
        return request;
    }

    return {
        ...request,
        method: "GET",
        pathname: "/db/snapshot",
        path: "/db/snapshot",
        url: "/db/snapshot",
    } as TRequest;
}

function toSnapshot(value: unknown): EdgeDbProjectionSyncSnapshot | null {
    const data = unwrapData(unwrapBody(value));

    if (!isRecord(data)) {
        return null;
    }

    if ("snapshot" in data && isRecord(data["snapshot"])) {
        return data["snapshot"] as EdgeDbProjectionSyncSnapshot;
    }

    return data as EdgeDbProjectionSyncSnapshot;
}

function createJsonResponse(statusCode: number, body: unknown): unknown {
    return {
        statusCode,
        headers: {
            "content-type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(body),
    };
}

function createFailureResponse(message: string): unknown {
    return createJsonResponse(500, {
        ok: false,
        error: {
            code: "edge_sync_export_failed",
            message,
        },
    });
}

function createSuccessResponse(data: EdgeCloudSyncExportPayloadContract): unknown {
    return createJsonResponse(200, {
        ok: true,
        data,
    });
}

function isDbProjectionSyncExportRequest(request: UnknownRequestRecord): boolean {
    return (
        getRequestMethod(request) === "GET" &&
        getRequestPathname(request) === "/sync/packages/db-projection"
    );
}

export function wrapEdgeCloudSyncExportRoute<TRequest, TResponse>(
    coreRoute: RouteCore<TRequest, TResponse>,
): (request: TRequest) => TResponse {
    return (request: TRequest): TResponse => {
        const requestRecord = isRecord(request) ? (request as UnknownRequestRecord) : {};

        if (!isDbProjectionSyncExportRequest(requestRecord)) {
            return coreRoute(request);
        }

        const snapshotResponse = coreRoute(createSnapshotRequest(request));
        const snapshot = toSnapshot(snapshotResponse);

        if (!isSuccessfulResponse(snapshotResponse) || !snapshot) {
            return createFailureResponse("Could not load edge DB projection snapshot.") as TResponse;
        }

        const searchParams = getRequestSearchParams(requestRecord);
        const packageId = searchParams.get("packageId") ?? getString(requestRecord, ["packageId"]);
        const tenantId = searchParams.get("tenantId") ?? getString(requestRecord, ["tenantId"]) ?? defaultTenantId;
        const terminalId =
            searchParams.get("terminalId") ?? getString(requestRecord, ["terminalId"]) ?? defaultTerminalId;
        const edgeNodeId =
            searchParams.get("edgeNodeId") ?? getString(requestRecord, ["edgeNodeId"]) ?? defaultEdgeNodeId;
        const cloudNodeId =
            searchParams.get("cloudNodeId") ?? getString(requestRecord, ["cloudNodeId"]) ?? defaultCloudNodeId;

        const response = createEdgeCloudSyncExportResponse({
            ...(packageId !== null && packageId !== undefined ? { packageId } : {}),
            createdAt: getRequestNow(requestRecord),
            tenantId,
            terminalId,
            edgeNodeId,
            cloudNodeId,
            snapshot,
        });

        return createSuccessResponse(response.body.data) as TResponse;
    };
}