import type { CloudEdgeSyncPackageContract } from "@iyi/api-contracts";

import {
    countDbProjectionSnapshotRecords,
    createEdgeDbProjectionSyncPackageFromSnapshot,
    type EdgeDbProjectionSyncSnapshot,
} from "./db-projection-sync-package.js";

export interface CreateEdgeCloudSyncExportPayloadInput<
    TSnapshot extends EdgeDbProjectionSyncSnapshot,
> {
    readonly packageId?: string;
    readonly createdAt?: Date;
    readonly tenantId: string;
    readonly terminalId: string;
    readonly edgeNodeId: string;
    readonly cloudNodeId: string;
    readonly snapshot: TSnapshot;
}

export interface EdgeCloudSyncExportPayloadContract<
    TSnapshot extends EdgeDbProjectionSyncSnapshot = EdgeDbProjectionSyncSnapshot,
> {
    readonly generatedAt: string;
    readonly recordCount: number;
    readonly package: CloudEdgeSyncPackageContract<TSnapshot>;
}

export interface EdgeCloudSyncExportRouteRequest<
    TSnapshot extends EdgeDbProjectionSyncSnapshot,
> {
    readonly method: string;
    readonly pathname: string;
    readonly packageId?: string;
    readonly now?: Date;
    readonly tenantId: string;
    readonly terminalId: string;
    readonly edgeNodeId: string;
    readonly cloudNodeId: string;
    readonly snapshot: TSnapshot;
}

export interface EdgeCloudSyncExportRouteResponse<
    TSnapshot extends EdgeDbProjectionSyncSnapshot = EdgeDbProjectionSyncSnapshot,
> {
    readonly statusCode: number;
    readonly body: {
        readonly ok: true;
        readonly data: EdgeCloudSyncExportPayloadContract<TSnapshot>;
    };
}

function normalizeMethod(method: string): string {
    return method.trim().toUpperCase();
}

export function createEdgeCloudSyncExportPayload<
    TSnapshot extends EdgeDbProjectionSyncSnapshot,
>(
    input: CreateEdgeCloudSyncExportPayloadInput<TSnapshot>,
): EdgeCloudSyncExportPayloadContract<TSnapshot> {
    const createdAt = input.createdAt ?? new Date();
    const recordCount = countDbProjectionSnapshotRecords(input.snapshot);

    const syncPackage = createEdgeDbProjectionSyncPackageFromSnapshot({
        ...(input.packageId !== undefined ? { packageId: input.packageId } : {}),
        createdAt,
        tenantId: input.tenantId,
        terminalId: input.terminalId,
        edgeNodeId: input.edgeNodeId,
        cloudNodeId: input.cloudNodeId,
        snapshot: input.snapshot,
        payloadRecordCount: recordCount,
    });

    return {
        generatedAt: createdAt.toISOString(),
        recordCount,
        package: syncPackage,
    };
}

export function createEdgeCloudSyncExportResponse<
    TSnapshot extends EdgeDbProjectionSyncSnapshot,
>(
    input: CreateEdgeCloudSyncExportPayloadInput<TSnapshot>,
): EdgeCloudSyncExportRouteResponse<TSnapshot> {
    return {
        statusCode: 200,
        body: {
            ok: true,
            data: createEdgeCloudSyncExportPayload(input),
        },
    };
}

export function handleEdgeCloudSyncExportRoute<
    TSnapshot extends EdgeDbProjectionSyncSnapshot,
>(
    request: EdgeCloudSyncExportRouteRequest<TSnapshot>,
): EdgeCloudSyncExportRouteResponse<TSnapshot> | null {
    if (
        normalizeMethod(request.method) !== "GET" ||
        request.pathname !== "/sync/packages/db-projection"
    ) {
        return null;
    }

    return createEdgeCloudSyncExportResponse({
        ...(request.packageId !== undefined ? { packageId: request.packageId } : {}),
        ...(request.now !== undefined ? { createdAt: request.now } : {}),
        tenantId: request.tenantId,
        terminalId: request.terminalId,
        edgeNodeId: request.edgeNodeId,
        cloudNodeId: request.cloudNodeId,
        snapshot: request.snapshot,
    });
}