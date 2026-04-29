import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { wrapCloudApiRouteRequestWithAudit } from "./audit-mutation-route-wrapper.js";

let tempDirectory: string | undefined;

function createTempApiDataDir(snapshot: unknown): void {
    tempDirectory = join(tmpdir(), `iyi-api-audit-${crypto.randomUUID()}`);
    mkdirSync(tempDirectory, { recursive: true });
    process.env["IYI_API_DATA_DIR"] = tempDirectory;
    writeFileSync(join(tempDirectory, "api-db.json"), `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

function readSnapshot(): Record<string, unknown> {
    if (!tempDirectory) {
        throw new Error("Missing temp directory.");
    }

    return JSON.parse(readFileSync(join(tempDirectory, "api-db.json"), "utf8")) as Record<string, unknown>;
}

afterEach(() => {
    if (tempDirectory) {
        rmSync(tempDirectory, {
            recursive: true,
            force: true,
        });
    }

    tempDirectory = undefined;
    delete process.env["IYI_API_DATA_DIR"];
});

describe("wrapCloudApiRouteRequestWithAudit", () => {
    it("appends stockpile.created audit entries after successful creates", async () => {
        createTempApiDataDir({
            audit_entries: [],
            stockpiles: [],
        });

        const route = wrapCloudApiRouteRequestWithAudit(async () => ({
            statusCode: 201,
            body: {
                ok: true,
                data: {
                    id: "stockpile_001",
                    name: "Coke pile A",
                    status: "draft",
                    materialName: "Petroleum coke",
                    zoneName: "Zone A",
                },
            },
        }));

        await route({
            method: "POST",
            pathname: "/stockpiles",
            requestId: "request-create-001",
            now: new Date("2026-01-01T00:00:00.000Z"),
            body: {
                name: "Coke pile A",
            },
        });

        const snapshot = readSnapshot();
        const auditEntries = snapshot["audit_entries"];

        expect(Array.isArray(auditEntries)).toBe(true);
        expect(auditEntries).toHaveLength(1);
        expect(auditEntries).toEqual([
            expect.objectContaining({
                context: expect.objectContaining({
                    requestId: "request-create-001",
                    source: "cloud_api",
                }),
                mutation: {
                    type: "stockpile.created",
                    stockpileId: "stockpile_001",
                    stockpileName: "Coke pile A",
                    materialName: "Petroleum coke",
                    yardZoneName: "Zone A",
                    status: "draft",
                },
            }),
        ]);
    });

    it("appends stockpile.status_updated audit entries with previous status", async () => {
        createTempApiDataDir({
            audit_entries: [],
            stockpiles: [
                {
                    id: "stockpile_001",
                    status: "draft",
                },
            ],
        });

        const route = wrapCloudApiRouteRequestWithAudit(async () => ({
            statusCode: 200,
            body: {
                ok: true,
                data: {
                    id: "stockpile_001",
                    status: "operational",
                },
            },
        }));

        await route({
            method: "PATCH",
            pathname: "/stockpiles/stockpile_001/status",
            requestId: "request-status-001",
            now: new Date("2026-01-01T00:05:00.000Z"),
            body: {
                status: "operational",
            },
        });

        const snapshot = readSnapshot();
        const auditEntries = snapshot["audit_entries"];

        expect(Array.isArray(auditEntries)).toBe(true);
        expect(auditEntries).toHaveLength(1);
        expect(auditEntries).toEqual([
            expect.objectContaining({
                context: expect.objectContaining({
                    requestId: "request-status-001",
                    source: "cloud_api",
                }),
                mutation: {
                    type: "stockpile.status_updated",
                    stockpileId: "stockpile_001",
                    previousStatus: "draft",
                    nextStatus: "operational",
                },
            }),
        ]);
    });

    it("does not append audit entries for failed route responses", async () => {
        createTempApiDataDir({
            audit_entries: [],
            stockpiles: [],
        });

        const route = wrapCloudApiRouteRequestWithAudit(async () => ({
            statusCode: 400,
            body: {
                ok: false,
                error: {
                    code: "bad_request",
                },
            },
        }));

        await route({
            method: "POST",
            pathname: "/stockpiles",
            requestId: "request-failed-001",
            now: new Date("2026-01-01T00:00:00.000Z"),
            body: {
                name: "Invalid pile",
            },
        });

        const snapshot = readSnapshot();

        expect(snapshot["audit_entries"]).toEqual([]);
    });
});