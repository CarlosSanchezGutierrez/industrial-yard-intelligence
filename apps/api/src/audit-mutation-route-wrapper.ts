import type { CloudApiAuditMutationPayloadContract } from "@iyi/api-contracts";

import { createAuditMutationEntry } from "./audit-mutation-service.js";
import {
    appendCloudApiAuditMutationEntryToRuntimeStore,
    readCloudApiRuntimeStockpileStatus,
} from "./audit-mutation-json-file-store.js";

type UnknownRequestRecord = Record<string, unknown>;
type UnknownResponseRecord = Record<string, unknown>;
type RouteCore<TRequest, TResponse> = (request: TRequest) => TResponse | Promise<TResponse>;

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

function getRequestBody(request: UnknownRequestRecord): unknown {
    for (const key of ["body", "json", "payload", "data"]) {
        if (key in request) {
            return request[key];
        }
    }

    return undefined;
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

function getRequestId(request: UnknownRequestRecord): string {
    return getString(request, ["requestId", "id", "correlationId"]) ?? "cloud_api_request";
}

function createStockpileCreatedMutation(
    request: UnknownRequestRecord,
    response: unknown,
): CloudApiAuditMutationPayloadContract | null {
    const responseData = unwrapData(unwrapBody(response));
    const requestBody = getRequestBody(request);

    const responseRecord = isRecord(responseData) ? responseData : {};
    const requestRecord = isRecord(requestBody) ? requestBody : {};

    const stockpileId = getString(responseRecord, ["id", "stockpileId"]) ?? getString(requestRecord, ["id", "stockpileId"]);

    if (!stockpileId) {
        return null;
    }

    const stockpileName =
        getString(responseRecord, ["name", "stockpileName", "label", "code"]) ??
        getString(requestRecord, ["name", "stockpileName", "label", "code"]) ??
        stockpileId;

    const status =
        getString(responseRecord, ["status", "lifecycleStatus", "currentStatus"]) ??
        getString(requestRecord, ["status", "lifecycleStatus", "currentStatus"]) ??
        "draft";

    const materialName =
        getString(responseRecord, ["materialName", "material", "commodity"]) ??
        getString(requestRecord, ["materialName", "material", "commodity"]);

    const yardZoneName =
        getString(responseRecord, ["yardZoneName", "zoneName", "yardZone", "zone"]) ??
        getString(requestRecord, ["yardZoneName", "zoneName", "yardZone", "zone"]);

    return {
        type: "stockpile.created",
        stockpileId,
        stockpileName,
        status,
        ...(materialName !== undefined ? { materialName } : {}),
        ...(yardZoneName !== undefined ? { yardZoneName } : {}),
    };
}

function createStockpileStatusUpdatedMutation(
    request: UnknownRequestRecord,
    response: unknown,
    previousStatus: string | undefined,
): CloudApiAuditMutationPayloadContract | null {
    const pathname = getString(request, ["pathname", "path", "url"]) ?? "";
    const pathMatch = /^\/stockpiles\/([^/]+)\/status$/u.exec(pathname);

    if (!pathMatch?.[1]) {
        return null;
    }

    const stockpileId = decodeURIComponent(pathMatch[1]);
    const responseData = unwrapData(unwrapBody(response));
    const requestBody = getRequestBody(request);

    const responseRecord = isRecord(responseData) ? responseData : {};
    const requestRecord = isRecord(requestBody) ? requestBody : {};

    const nextStatus =
        getString(responseRecord, ["status", "nextStatus", "lifecycleStatus", "currentStatus"]) ??
        getString(requestRecord, ["status", "nextStatus", "lifecycleStatus", "currentStatus"]);

    if (!nextStatus) {
        return null;
    }

    return {
        type: "stockpile.status_updated",
        stockpileId,
        previousStatus: previousStatus ?? "unknown",
        nextStatus,
    };
}

function getStatusUpdateStockpileId(request: UnknownRequestRecord): string | undefined {
    const method = getString(request, ["method"])?.toUpperCase();
    const pathname = getString(request, ["pathname", "path", "url"]) ?? "";

    if (method !== "PATCH") {
        return undefined;
    }

    const pathMatch = /^\/stockpiles\/([^/]+)\/status$/u.exec(pathname);

    if (!pathMatch?.[1]) {
        return undefined;
    }

    return decodeURIComponent(pathMatch[1]);
}

function createMutationForRequest(
    request: UnknownRequestRecord,
    response: unknown,
    previousStatus: string | undefined,
): CloudApiAuditMutationPayloadContract | null {
    const method = getString(request, ["method"])?.toUpperCase();
    const pathname = getString(request, ["pathname", "path", "url"]) ?? "";

    if (method === "POST" && pathname === "/stockpiles") {
        return createStockpileCreatedMutation(request, response);
    }

    if (method === "PATCH" && /^\/stockpiles\/[^/]+\/status$/u.test(pathname)) {
        return createStockpileStatusUpdatedMutation(request, response, previousStatus);
    }

    return null;
}

export function wrapCloudApiRouteRequestWithAudit<TRequest, TResponse>(
    coreRoute: RouteCore<TRequest, TResponse>,
): (request: TRequest) => Promise<Awaited<TResponse>> {
    return async (request: TRequest): Promise<Awaited<TResponse>> => {
        const requestRecord = isRecord(request) ? (request as UnknownRequestRecord) : {};
        const statusUpdateStockpileId = getStatusUpdateStockpileId(requestRecord);
        const previousStatus = statusUpdateStockpileId
            ? readCloudApiRuntimeStockpileStatus(statusUpdateStockpileId)
            : undefined;

        const response = await coreRoute(request);

        if (!isSuccessfulResponse(response)) {
            return response as Awaited<TResponse>;
        }

        const mutation = createMutationForRequest(requestRecord, response, previousStatus);

        if (!mutation) {
            return response as Awaited<TResponse>;
        }

        const auditEntry = createAuditMutationEntry({
            requestId: getRequestId(requestRecord),
            occurredAt: getRequestNow(requestRecord),
            mutation,
        });

        appendCloudApiAuditMutationEntryToRuntimeStore(auditEntry);

        return response as Awaited<TResponse>;
    };
}