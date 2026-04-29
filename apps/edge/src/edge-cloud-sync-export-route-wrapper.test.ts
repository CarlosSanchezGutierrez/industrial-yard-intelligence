import { describe, expect, it } from "vitest";

import { wrapEdgeCloudSyncExportRoute } from "./edge-cloud-sync-export-route-wrapper.js";

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

describe("wrapEdgeCloudSyncExportRoute", () => {
    it("returns sync package for GET /sync/packages/db-projection using core /db/snapshot", () => {
        const route = wrapEdgeCloudSyncExportRoute((request: { readonly pathname: string }) => {
            if (request.pathname === "/db/snapshot") {
                return {
                    statusCode: 200,
                    headers: {
                        "content-type": "application/json; charset=utf-8",
                    },
                    body: JSON.stringify({
                        ok: true,
                        data: {
                            snapshot: {
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
                                ],
                                audit_entries: [
                                    {
                                        id: "audit_001",
                                    },
                                ],
                            },
                        },
                    }),
                };
            }

            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json; charset=utf-8",
                },
                body: JSON.stringify({
                    ok: false,
                }),
            };
        });

        const response = route({
            method: "GET",
            pathname: "/sync/packages/db-projection",
            now: new Date("2026-01-01T00:00:00.000Z"),
            packageId: "sync_pkg_edge_route_001",
            tenantId: "tenant_cooper_t_smith",
            terminalId: "terminal_altamira",
            edgeNodeId: "edge_altamira_yard_001",
            cloudNodeId: "cloud_primary",
        } as unknown as { readonly pathname: string });

        expect(getStatusCode(response)).toBe(200);

        const data = getData(response) as {
            readonly generatedAt: string;
            readonly recordCount: number;
            readonly package: {
                readonly manifest: {
                    readonly packageId: string;
                    readonly packageKind: string;
                    readonly direction: string;
                    readonly payloadRecordCount: number;
                };
            };
        };

        expect(data.generatedAt).toBe("2026-01-01T00:00:00.000Z");
        expect(data.recordCount).toBe(4);
        expect(data.package.manifest.packageId).toBe("sync_pkg_edge_route_001");
        expect(data.package.manifest.packageKind).toBe("db_projection_snapshot");
        expect(data.package.manifest.direction).toBe("edge_to_cloud");
        expect(data.package.manifest.payloadRecordCount).toBe(4);
    });

    it("passes through non-sync-export routes synchronously", () => {
        const route = wrapEdgeCloudSyncExportRoute(() => ({
            statusCode: 200,
            headers: {
                "content-type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({
                ok: true,
                data: {
                    passedThrough: true,
                },
            }),
        }));

        const response = route({
            method: "GET",
            pathname: "/health",
        });

        expect(getStatusCode(response)).toBe(200);
        expect(getData(response)).toEqual({
            passedThrough: true,
        });
    });

    it("returns failure when snapshot cannot be loaded", () => {
        const route = wrapEdgeCloudSyncExportRoute(() => ({
            statusCode: 404,
            headers: {
                "content-type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({
                ok: false,
            }),
        }));

        const response = route({
            method: "GET",
            pathname: "/sync/packages/db-projection",
        });

        expect(getStatusCode(response)).toBe(500);
        expect(getData(response)).toEqual({
            ok: false,
            error: {
                code: "edge_sync_export_failed",
                message: "Could not load edge DB projection snapshot.",
            },
        });
    });
});