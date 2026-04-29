export type CloudApiAuditActorTypeContract =
    | "system"
    | "operator"
    | "supervisor"
    | "service"
    | "unknown";

export type CloudApiAuditMutationTypeContract =
    | "stockpile.created"
    | "stockpile.status_updated";

export interface CloudApiAuditActorContract {
    readonly type: CloudApiAuditActorTypeContract;
    readonly id?: string;
    readonly displayName?: string;
}

export interface CloudApiAuditMutationContextContract {
    readonly requestId: string;
    readonly occurredAt: string;
    readonly source: "cloud_api";
    readonly actor: CloudApiAuditActorContract;
}

export interface CloudApiAuditStockpileCreatedContract {
    readonly type: "stockpile.created";
    readonly stockpileId: string;
    readonly stockpileName: string;
    readonly materialName?: string;
    readonly yardZoneName?: string;
    readonly status: string;
}

export interface CloudApiAuditStockpileStatusUpdatedContract {
    readonly type: "stockpile.status_updated";
    readonly stockpileId: string;
    readonly previousStatus: string;
    readonly nextStatus: string;
}

export type CloudApiAuditMutationPayloadContract =
    | CloudApiAuditStockpileCreatedContract
    | CloudApiAuditStockpileStatusUpdatedContract;

export interface CloudApiAuditMutationEntryContract {
    readonly id: string;
    readonly context: CloudApiAuditMutationContextContract;
    readonly mutation: CloudApiAuditMutationPayloadContract;
}

export interface CloudApiAuditMutationAppendPayloadContract {
    readonly auditEntry: CloudApiAuditMutationEntryContract;
}