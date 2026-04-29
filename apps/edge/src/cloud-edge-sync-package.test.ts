import { describe, expect, it } from "vitest";

import {
    createCloudEdgeSyncPackage,
    createEdgeDbProjectionSyncPackage,
} from "./cloud-edge-sync-package.js";

describe("Edge Cloud Edge sync package builder", () => {
    it("creates a db projection sync package with deterministic manifest metadata", () => {
        const payload = {
            stockpiles: [
                {
                    id: "stockpile_001",
                    status: "draft",
                },
                {
                    id: "stockpile_002",
                    status: "operational",
                },
            ],
            audit_entries: [
                {
                    id: "audit_001",
                },
            ],
        };

        const syncPackage = createEdgeDbProjectionSyncPackage({
            packageId: "sync_pkg_edge_projection_001",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
            payload,
        });

        expect(syncPackage.manifest).toEqual({
            packageId: "sync_pkg_edge_projection_001",
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
            payloadRecordCount: 3,
        });
        expect(syncPackage.payload).toBe(payload);
    });

    it("allows explicit payload record count for pre-counted snapshots", () => {
        const syncPackage = createEdgeDbProjectionSyncPackage({
            packageId: "sync_pkg_edge_projection_002",
            createdAt: new Date("2026-01-01T00:05:00.000Z"),
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
            payload: {
                snapshot: {
                    tables: 11,
                },
            },
            payloadRecordCount: 11,
        });

        expect(syncPackage.manifest.payloadRecordCount).toBe(11);
        expect(syncPackage.manifest.packageKind).toBe("db_projection_snapshot");
        expect(syncPackage.manifest.direction).toBe("edge_to_cloud");
    });

    it("generates a stable package id when one is not provided", () => {
        const payload = {
            stockpiles: [
                {
                    id: "stockpile_001",
                },
            ],
        };

        const firstPackage = createCloudEdgeSyncPackage({
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
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
            payload,
        });

        const secondPackage = createCloudEdgeSyncPackage({
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
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
            payload,
        });

        expect(firstPackage.manifest.packageId).toBe(secondPackage.manifest.packageId);
        expect(firstPackage.manifest.packageId).toMatch(
            /^sync_db_projection_snapshot_edge_to_cloud_[a-f0-9]{12}$/u,
        );
    });

    it("hashes payloads with stable key ordering", () => {
        const firstPackage = createEdgeDbProjectionSyncPackage({
            packageId: "sync_pkg_first",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
            payload: {
                b: 2,
                a: 1,
            },
        });

        const secondPackage = createEdgeDbProjectionSyncPackage({
            packageId: "sync_pkg_second",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
            payload: {
                a: 1,
                b: 2,
            },
        });

        expect(firstPackage.manifest.payloadHash).toBe(secondPackage.manifest.payloadHash);
    });
});