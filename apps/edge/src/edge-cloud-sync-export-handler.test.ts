import { describe, expect, it } from "vitest";

import {
    createEdgeCloudSyncExportPayload,
    createEdgeCloudSyncExportResponse,
    handleEdgeCloudSyncExportRoute,
} from "./edge-cloud-sync-export-handler.js";

describe("Edge Cloud sync export handler", () => {
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
        metadata: {
            generatedAt: "2026-01-01T00:00:00.000Z",
        },
    };

    it("creates an export payload with DB projection sync package", () => {
        const payload = createEdgeCloudSyncExportPayload({
            packageId: "sync_pkg_edge_export_001",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
            snapshot,
        });

        expect(payload.generatedAt).toBe("2026-01-01T00:00:00.000Z");
        expect(payload.recordCount).toBe(5);
        expect(payload.package.manifest).toEqual({
            packageId: "sync_pkg_edge_export_001",
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
            payloadRecordCount: 5,
        });
        expect(payload.package.payload).toBe(snapshot);
    });

    it("creates a route response for export payloads", () => {
        const response = createEdgeCloudSyncExportResponse({
            packageId: "sync_pkg_edge_export_002",
            createdAt: new Date("2026-01-01T00:05:00.000Z"),
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
            snapshot,
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(response.body.data.package.manifest.packageId).toBe("sync_pkg_edge_export_002");
        expect(response.body.data.recordCount).toBe(5);
    });

    it("handles GET /sync/packages/db-projection", () => {
        const response = handleEdgeCloudSyncExportRoute({
            method: "GET",
            pathname: "/sync/packages/db-projection",
            packageId: "sync_pkg_edge_export_003",
            now: new Date("2026-01-01T00:10:00.000Z"),
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
            snapshot,
        });

        expect(response).not.toBeNull();
        expect(response?.statusCode).toBe(200);
        expect(response?.body.data.package.manifest.packageId).toBe("sync_pkg_edge_export_003");
        expect(response?.body.data.package.manifest.payloadRecordCount).toBe(5);
    });

    it("returns null for non-export routes", () => {
        const response = handleEdgeCloudSyncExportRoute({
            method: "GET",
            pathname: "/health",
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
            snapshot,
        });

        expect(response).toBeNull();
    });

    it("normalizes HTTP method casing", () => {
        const response = handleEdgeCloudSyncExportRoute({
            method: "get",
            pathname: "/sync/packages/db-projection",
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
            snapshot,
        });

        expect(response?.statusCode).toBe(200);
    });
});