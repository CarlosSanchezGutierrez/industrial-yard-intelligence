import { describe, expect, it } from "vitest";

import type {
    CloudEdgeSyncIngestPayloadContract,
    CloudEdgeSyncIngestRequestContract,
    CloudEdgeSyncPreviewPayloadContract,
    CloudEdgeSyncPreviewRequestContract,
    CloudEdgeSyncStatusPayloadContract,
} from "./cloud-edge-sync.js";

describe("Cloud edge sync contracts", () => {
    it("models preview requests without applying records", () => {
        const request: CloudEdgeSyncPreviewRequestContract = {
            package: {
                manifest: {
                    packageId: "sync_pkg_001",
                    packageKind: "db_projection_snapshot",
                    direction: "edge_to_cloud",
                    createdAt: "2026-01-01T00:00:00.000Z",
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
                    payloadHash: "sha256:preview",
                    payloadRecordCount: 3,
                },
                payload: {
                    stockpiles: [],
                },
            },
            conflictPolicy: "manual_review",
        };

        const payload: CloudEdgeSyncPreviewPayloadContract = {
            packageId: request.package.manifest.packageId,
            accepted: true,
            ingestMode: "preview",
            conflictPolicy: request.conflictPolicy,
            detectedRecordCount: 3,
            detectedConflictCount: 0,
            warnings: [],
        };

        expect(payload).toEqual({
            packageId: "sync_pkg_001",
            accepted: true,
            ingestMode: "preview",
            conflictPolicy: "manual_review",
            detectedRecordCount: 3,
            detectedConflictCount: 0,
            warnings: [],
        });
    });

    it("models ingest requests and results", () => {
        const request: CloudEdgeSyncIngestRequestContract = {
            package: {
                manifest: {
                    packageId: "sync_pkg_002",
                    packageKind: "audit_mutation_delta",
                    direction: "edge_to_cloud",
                    createdAt: "2026-01-01T00:05:00.000Z",
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
                    payloadHash: "sha256:ingest",
                    payloadRecordCount: 2,
                },
                payload: {
                    audit_entries: [],
                },
            },
            ingestMode: "apply",
            conflictPolicy: "reject",
        };

        const payload: CloudEdgeSyncIngestPayloadContract = {
            packageId: request.package.manifest.packageId,
            accepted: true,
            ingestMode: request.ingestMode,
            appliedRecordCount: 2,
            skippedRecordCount: 0,
            conflictCount: 0,
            auditEntryIds: ["audit_sync_001"],
            warnings: [],
        };

        expect(payload.appliedRecordCount).toBe(2);
        expect(payload.auditEntryIds).toEqual(["audit_sync_001"]);
    });

    it("models Cloud Edge sync capability status", () => {
        const payload: CloudEdgeSyncStatusPayloadContract = {
            enabled: false,
            supportedPackageKinds: [
                "db_projection_snapshot",
                "audit_mutation_delta",
                "evidence_manifest",
                "full_demo_package",
            ],
            supportedConflictPolicies: ["reject", "prefer_cloud", "prefer_edge", "manual_review"],
            supportedDirections: ["edge_to_cloud", "cloud_to_edge"],
        };

        expect(payload.enabled).toBe(false);
        expect(payload.supportedPackageKinds).toContain("db_projection_snapshot");
        expect(payload.supportedConflictPolicies).toContain("manual_review");
    });
});