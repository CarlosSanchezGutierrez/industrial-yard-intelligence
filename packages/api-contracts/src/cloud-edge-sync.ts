export type CloudEdgeSyncDirectionContract =
    | "edge_to_cloud"
    | "cloud_to_edge";

export type CloudEdgeSyncPackageKindContract =
    | "db_projection_snapshot"
    | "audit_mutation_delta"
    | "evidence_manifest"
    | "full_demo_package";

export type CloudEdgeSyncIngestModeContract =
    | "preview"
    | "apply";

export type CloudEdgeSyncConflictPolicyContract =
    | "reject"
    | "prefer_cloud"
    | "prefer_edge"
    | "manual_review";

export interface CloudEdgeSyncEndpointContract {
    readonly tenantId: string;
    readonly terminalId: string;
    readonly nodeId: string;
    readonly nodeRole: "cloud" | "edge";
}

export interface CloudEdgeSyncPackageManifestContract {
    readonly packageId: string;
    readonly packageKind: CloudEdgeSyncPackageKindContract;
    readonly direction: CloudEdgeSyncDirectionContract;
    readonly createdAt: string;
    readonly source: CloudEdgeSyncEndpointContract;
    readonly target: CloudEdgeSyncEndpointContract;
    readonly schemaVersion: "cloud-edge-sync-v1";
    readonly payloadHash: string;
    readonly payloadRecordCount: number;
}

export interface CloudEdgeSyncPackageContract<TPayload = unknown> {
    readonly manifest: CloudEdgeSyncPackageManifestContract;
    readonly payload: TPayload;
}

export interface CloudEdgeSyncPreviewRequestContract {
    readonly package: CloudEdgeSyncPackageContract;
    readonly conflictPolicy: CloudEdgeSyncConflictPolicyContract;
}

export interface CloudEdgeSyncPreviewPayloadContract {
    readonly packageId: string;
    readonly accepted: boolean;
    readonly ingestMode: "preview";
    readonly conflictPolicy: CloudEdgeSyncConflictPolicyContract;
    readonly detectedRecordCount: number;
    readonly detectedConflictCount: number;
    readonly warnings: readonly string[];
}

export interface CloudEdgeSyncIngestRequestContract {
    readonly package: CloudEdgeSyncPackageContract;
    readonly ingestMode: CloudEdgeSyncIngestModeContract;
    readonly conflictPolicy: CloudEdgeSyncConflictPolicyContract;
}

export interface CloudEdgeSyncIngestPayloadContract {
    readonly packageId: string;
    readonly accepted: boolean;
    readonly ingestMode: CloudEdgeSyncIngestModeContract;
    readonly appliedRecordCount: number;
    readonly skippedRecordCount: number;
    readonly conflictCount: number;
    readonly auditEntryIds: readonly string[];
    readonly warnings: readonly string[];
}

export interface CloudEdgeSyncStatusPayloadContract {
    readonly enabled: boolean;
    readonly supportedPackageKinds: readonly CloudEdgeSyncPackageKindContract[];
    readonly supportedConflictPolicies: readonly CloudEdgeSyncConflictPolicyContract[];
    readonly supportedDirections: readonly CloudEdgeSyncDirectionContract[];
}