import { createHash } from "node:crypto";

import type {
    CloudEdgeSyncDirectionContract,
    CloudEdgeSyncEndpointContract,
    CloudEdgeSyncPackageContract,
    CloudEdgeSyncPackageKindContract,
} from "@iyi/api-contracts";

export interface CreateCloudEdgeSyncPackageInput<TPayload> {
    readonly packageId?: string;
    readonly packageKind?: CloudEdgeSyncPackageKindContract;
    readonly direction?: CloudEdgeSyncDirectionContract;
    readonly createdAt?: Date;
    readonly source: CloudEdgeSyncEndpointContract;
    readonly target: CloudEdgeSyncEndpointContract;
    readonly payload: TPayload;
    readonly payloadRecordCount?: number;
}

export interface CreateEdgeDbProjectionSyncPackageInput<TPayload> {
    readonly packageId?: string;
    readonly createdAt?: Date;
    readonly tenantId: string;
    readonly terminalId: string;
    readonly edgeNodeId: string;
    readonly cloudNodeId: string;
    readonly payload: TPayload;
    readonly payloadRecordCount?: number;
}

function stableJson(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map(stableJson).join(",")}]`;
    }

    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        const keys = Object.keys(record).sort();

        return `{${keys
            .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
            .join(",")}}`;
    }

    return JSON.stringify(value);
}

function createPayloadHash(payload: unknown): string {
    const digest = createHash("sha256").update(stableJson(payload)).digest("hex");

    return `sha256:${digest}`;
}

function countArrayRecords(value: unknown): number {
    if (Array.isArray(value)) {
        return value.length;
    }

    if (!value || typeof value !== "object") {
        return 0;
    }

    return Object.values(value as Record<string, unknown>).reduce((total, nestedValue) => {
        if (Array.isArray(nestedValue)) {
            return total + nestedValue.length;
        }

        return total;
    }, 0);
}

function inferPayloadRecordCount(payload: unknown): number {
    const arrayRecordCount = countArrayRecords(payload);

    if (arrayRecordCount > 0) {
        return arrayRecordCount;
    }

    if (payload && typeof payload === "object") {
        return 1;
    }

    return 0;
}

function createPackageId(input: {
    readonly packageKind: CloudEdgeSyncPackageKindContract;
    readonly direction: CloudEdgeSyncDirectionContract;
    readonly createdAt: string;
    readonly sourceNodeId: string;
    readonly payloadHash: string;
}): string {
    const hashSegment = createHash("sha256")
        .update(
            stableJson({
                packageKind: input.packageKind,
                direction: input.direction,
                createdAt: input.createdAt,
                sourceNodeId: input.sourceNodeId,
                payloadHash: input.payloadHash,
            }),
        )
        .digest("hex")
        .slice(0, 12);

    return `sync_${input.packageKind}_${input.direction}_${hashSegment}`;
}

export function createCloudEdgeSyncPackage<TPayload>(
    input: CreateCloudEdgeSyncPackageInput<TPayload>,
): CloudEdgeSyncPackageContract<TPayload> {
    const packageKind = input.packageKind ?? "db_projection_snapshot";
    const direction = input.direction ?? "edge_to_cloud";
    const createdAt = input.createdAt ?? new Date();
    const createdAtIso = createdAt.toISOString();
    const payloadHash = createPayloadHash(input.payload);
    const payloadRecordCount = input.payloadRecordCount ?? inferPayloadRecordCount(input.payload);
    const packageId =
        input.packageId ??
        createPackageId({
            packageKind,
            direction,
            createdAt: createdAtIso,
            sourceNodeId: input.source.nodeId,
            payloadHash,
        });

    return {
        manifest: {
            packageId,
            packageKind,
            direction,
            createdAt: createdAtIso,
            source: input.source,
            target: input.target,
            schemaVersion: "cloud-edge-sync-v1",
            payloadHash,
            payloadRecordCount,
        },
        payload: input.payload,
    };
}

export function createEdgeDbProjectionSyncPackage<TPayload>(
    input: CreateEdgeDbProjectionSyncPackageInput<TPayload>,
): CloudEdgeSyncPackageContract<TPayload> {
    return createCloudEdgeSyncPackage({
        ...(input.packageId !== undefined ? { packageId: input.packageId } : {}),
        ...(input.createdAt !== undefined ? { createdAt: input.createdAt } : {}),
        packageKind: "db_projection_snapshot",
        direction: "edge_to_cloud",
        source: {
            tenantId: input.tenantId,
            terminalId: input.terminalId,
            nodeId: input.edgeNodeId,
            nodeRole: "edge",
        },
        target: {
            tenantId: input.tenantId,
            terminalId: input.terminalId,
            nodeId: input.cloudNodeId,
            nodeRole: "cloud",
        },
        payload: input.payload,
        ...(input.payloadRecordCount !== undefined
            ? { payloadRecordCount: input.payloadRecordCount }
            : {}),
    });
}