import { describe, expect, it } from "vitest";

import {
    countDbProjectionSnapshotRecords,
    createEdgeDbProjectionSyncPackageFromSnapshot,
} from "./db-projection-sync-package.js";

describe("Edge DB projection sync package adapter", () => {
    it("counts records from DB projection snapshot table arrays", () => {
        const snapshot = {
            app_tenants: [
                {
                    id: "tenant_cooper_t_smith",
                },
            ],
            terminals: [
                {
                    id: "terminal_altamira",
                },
            ],
            stockpiles: [
                {
                    id: "stockpile_001",
                },
                {
                    id: "stockpile_002",
                },
            ],
            metadata: {
                generatedAt: "2026-01-01T00:00:00.000Z",
            },
        };

        expect(countDbProjectionSnapshotRecords(snapshot)).toBe(4);
    });

    it("creates a Cloud Edge sync package from a DB projection snapshot", () => {
        const snapshot = {
            app_tenants: [
                {
                    id: "tenant_cooper_t_smith",
                },
            ],
            terminals: [
                {
                    id: "terminal_altamira",
                },
            ],
            stockpiles: [
                {
                    id: "stockpile_001",
                    status: "draft",
                },
            ],
            audit_entries: [
                {
                    id: "audit_001",
                },
            ],
        };

        const syncPackage = createEdgeDbProjectionSyncPackageFromSnapshot({
            packageId: "sync_pkg_edge_db_projection_001",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
            snapshot,
        });

        expect(syncPackage.manifest).toEqual({
            packageId: "sync_pkg_edge_db_projection_001",
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
            payloadHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
            payloadRecordCount: 4,
        });
        expect(syncPackage.payload).toBe(snapshot);
    });

    it("supports explicit precomputed record counts", () => {
        const syncPackage = createEdgeDbProjectionSyncPackageFromSnapshot({
            packageId: "sync_pkg_edge_db_projection_002",
            createdAt: new Date("2026-01-01T00:05:00.000Z"),
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
            snapshot: {
                stockpiles: [],
            },
            payloadRecordCount: 99,
        });

        expect(syncPackage.manifest.payloadRecordCount).toBe(99);
    });
});