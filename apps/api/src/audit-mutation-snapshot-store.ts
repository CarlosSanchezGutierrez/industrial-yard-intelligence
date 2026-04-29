import type { CloudApiAuditMutationEntryContract } from "@iyi/api-contracts";

export interface CloudApiAuditMutationSnapshot {
    readonly audit_entries: readonly CloudApiAuditMutationEntryContract[];
}

export interface AppendCloudApiAuditMutationEntryInput {
    readonly snapshot: CloudApiAuditMutationSnapshot;
    readonly auditEntry: CloudApiAuditMutationEntryContract;
}

export function appendCloudApiAuditMutationEntry<
    TSnapshot extends CloudApiAuditMutationSnapshot,
>(input: AppendCloudApiAuditMutationEntryInput & { readonly snapshot: TSnapshot }): TSnapshot {
    return {
        ...input.snapshot,
        audit_entries: [...input.snapshot.audit_entries, input.auditEntry],
    };
}

export function getCloudApiAuditMutationEntryCount(
    snapshot: CloudApiAuditMutationSnapshot,
): number {
    return snapshot.audit_entries.length;
}

export function findCloudApiAuditMutationEntriesByStockpileId(
    snapshot: CloudApiAuditMutationSnapshot,
    stockpileId: string,
): readonly CloudApiAuditMutationEntryContract[] {
    return snapshot.audit_entries.filter((entry) => {
        const mutation = entry.mutation;

        if ("stockpileId" in mutation) {
            return mutation.stockpileId === stockpileId;
        }

        return false;
    });
}