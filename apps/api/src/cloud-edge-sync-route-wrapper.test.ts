import { describe, expect, it } from "vitest";

import { wrapCloudApiSyncRoutes } from "./cloud-edge-sync-route-wrapper.js";

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

function createSyncPackage(payloadRecordCount = 3) {
    return {
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
            payloadHash: "sha256:test",
            payloadRecordCount,
        },
        payload: {
            stockpiles: [],
        },
    };
}

describe("wrapCloudApiSyncRoutes", () => {
    it("returns Cloud Edge sync status", async () => {
        const route = wrapCloudApiSyncRoutes(async () => ({
            statusCode: 404,
            body: {
                ok: false,
            },
        }));

        const response = await route({
            method: "GET",
            pathname: "/sync/status",
        });

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

    it("previews sync packages without applying records", async () => {
        const route = wrapCloudApiSyncRoutes(async () => ({
            statusCode: 404,
            body: {
                ok: false,
            },
        }));

        const response = await route({
            method: "POST",
            pathname: "/sync/preview",
            body: {
                package: createSyncPackage(4),
                conflictPolicy: "manual_review",
            },
        });

        expect(getStatusCode(response)).toBe(200);
        expect(getData(response)).toEqual({
            packageId: "sync_pkg_001",
            accepted: true,
            ingestMode: "preview",
            conflictPolicy: "manual_review",
            detectedRecordCount: 4,
            detectedConflictCount: 0,
            warnings: [
                "Preview endpoint is active. Record application is intentionally disabled at this stage.",
            ],
        });
    });

    it("validates ingest apply mode but does not apply records yet", async () => {
        const route = wrapCloudApiSyncRoutes(async () => ({
            statusCode: 404,
            body: {
                ok: false,
            },
        }));

        const response = await route({
            method: "POST",
            pathname: "/sync/ingest",
            body: {
                package: createSyncPackage(2),
                ingestMode: "apply",
                conflictPolicy: "reject",
            },
        });

        expect(getStatusCode(response)).toBe(200);
        expect(getData(response)).toEqual({
            packageId: "sync_pkg_001",
            accepted: false,
            ingestMode: "apply",
            appliedRecordCount: 0,
            skippedRecordCount: 2,
            conflictCount: 0,
            auditEntryIds: [],
            warnings: [
                "Apply mode is not enabled yet. This endpoint currently validates the contract only.",
            ],
        });
    });

    it("passes through non-sync routes to the core route", async () => {
        const route = wrapCloudApiSyncRoutes(async () => ({
            statusCode: 200,
            body: {
                ok: true,
                data: {
                    passedThrough: true,
                },
            },
        }));

        const response = await route({
            method: "GET",
            pathname: "/health",
        });

        expect(getData(response)).toEqual({
            passedThrough: true,
        });
    });
});