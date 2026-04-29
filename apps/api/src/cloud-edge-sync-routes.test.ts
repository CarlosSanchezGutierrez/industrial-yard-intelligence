import { describe, expect, it } from "vitest";

import { routeApiRequest } from "./routes.js";

function getStatusCode(response: unknown): unknown {
    if (response && typeof response === "object" && "statusCode" in response) {
        return (response as { statusCode: unknown }).statusCode;
    }

    if (response && typeof response === "object" && "status" in response) {
        return (response as { status: unknown }).status;
    }

    return undefined;
}

function getData(response: unknown): unknown {
    if (response && typeof response === "object" && "body" in response) {
        const body = (response as { body: unknown }).body;

        if (typeof body === "string") {
            return getData({
                body: JSON.parse(body) as unknown,
            });
        }

        if (body && typeof body === "object" && "data" in body) {
            return (body as { data: unknown }).data;
        }

        return body;
    }

    return response;
}

function createSyncPackage(payloadRecordCount = 1) {
    return {
        manifest: {
            packageId: "sync_pkg_route_001",
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
            payloadHash: "sha256:route",
            payloadRecordCount,
        },
        payload: {
            stockpiles: [],
        },
    };
}

describe("Cloud Edge sync API routes", () => {
    it("exposes GET /sync/status through routeApiRequest", async () => {
        const response = await routeApiRequest({
            method: "GET",
            pathname: "/sync/status",
            requestId: "sync-status-test",
            now: new Date("2026-01-01T00:00:00.000Z"),
        } as unknown as Parameters<typeof routeApiRequest>[0]);

        expect(getStatusCode(response)).toBe(200);
        expect(getData(response)).toEqual({
            enabled: false,
            supportedPackageKinds: [
                "db_projection_snapshot",
                "audit_mutation_delta",
                "evidence_manifest",
                "full_demo_package",
            ],
            supportedConflictPolicies: ["reject", "prefer_cloud", "prefer_edge", "manual_review"],
            supportedDirections: ["edge_to_cloud", "cloud_to_edge"],
        });
    });

    it("exposes POST /sync/preview through routeApiRequest", async () => {
        const response = await routeApiRequest({
            method: "POST",
            pathname: "/sync/preview",
            requestId: "sync-preview-test",
            now: new Date("2026-01-01T00:00:00.000Z"),
            body: {
                package: createSyncPackage(2),
                conflictPolicy: "manual_review",
            },
        } as unknown as Parameters<typeof routeApiRequest>[0]);

        expect(getStatusCode(response)).toBe(200);
        expect(getData(response)).toEqual({
            packageId: "sync_pkg_route_001",
            accepted: true,
            ingestMode: "preview",
            conflictPolicy: "manual_review",
            detectedRecordCount: 2,
            detectedConflictCount: 0,
            warnings: [
                "Preview endpoint is active. Record application is intentionally disabled at this stage.",
            ],
        });
    });

    it("exposes POST /sync/ingest through routeApiRequest", async () => {
        const response = await routeApiRequest({
            method: "POST",
            pathname: "/sync/ingest",
            requestId: "sync-ingest-test",
            now: new Date("2026-01-01T00:00:00.000Z"),
            body: {
                package: createSyncPackage(3),
                ingestMode: "apply",
                conflictPolicy: "reject",
            },
        } as unknown as Parameters<typeof routeApiRequest>[0]);

        expect(getStatusCode(response)).toBe(200);
        expect(getData(response)).toEqual({
            packageId: "sync_pkg_route_001",
            accepted: false,
            ingestMode: "apply",
            appliedRecordCount: 0,
            skippedRecordCount: 3,
            conflictCount: 0,
            auditEntryIds: [],
            warnings: [
                "Apply mode is not enabled yet. This endpoint currently validates the contract only.",
            ],
        });
    });
});