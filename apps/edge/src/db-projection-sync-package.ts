import type { CloudEdgeSyncPackageContract } from "@iyi/api-contracts";

import { createEdgeDbProjectionSyncPackage } from "./cloud-edge-sync-package.js";

export type EdgeDbProjectionSyncSnapshot = Record<string, unknown>;

export interface CreateEdgeDbProjectionSyncPackageFromSnapshotInput<
    TSnapshot extends EdgeDbProjectionSyncSnapshot,
> {
    readonly packageId?: string;
    readonly createdAt?: Date;
    readonly tenantId: string;
    readonly terminalId: string;
    readonly edgeNodeId: string;
    readonly cloudNodeId: string;
    readonly snapshot: TSnapshot;
    readonly payloadRecordCount?: number;
}

export function countDbProjectionSnapshotRecords(snapshot: EdgeDbProjectionSyncSnapshot): number {
    let total = 0;

    for (const value of Object.values(snapshot)) {
        if (Array.isArray(value)) {
            total += value.length;
        }
    }

    return total;
}

export function createEdgeDbProjectionSyncPackageFromSnapshot<
    TSnapshot extends EdgeDbProjectionSyncSnapshot,
>(
    input: CreateEdgeDbProjectionSyncPackageFromSnapshotInput<TSnapshot>,
): CloudEdgeSyncPackageContract<TSnapshot> {
    const payloadRecordCount =
        input.payloadRecordCount ?? countDbProjectionSnapshotRecords(input.snapshot);

    return createEdgeDbProjectionSyncPackage({
        ...(input.packageId !== undefined ? { packageId: input.packageId } : {}),
        ...(input.createdAt !== undefined ? { createdAt: input.createdAt } : {}),
        tenantId: input.tenantId,
        terminalId: input.terminalId,
        edgeNodeId: input.edgeNodeId,
        cloudNodeId: input.cloudNodeId,
        payload: input.snapshot,
        payloadRecordCount,
    });
}