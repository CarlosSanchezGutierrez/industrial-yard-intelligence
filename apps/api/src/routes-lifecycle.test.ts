import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createApiRequestHandler } from "./routes.js";

let tempDirectory: string | undefined;

function createTempDataDir(): void {
    tempDirectory = mkdtempSync(join(tmpdir(), "iyi-api-lifecycle-"));
    process.env["IYI_API_DATA_DIR"] = tempDirectory;
}

function cleanupTempDataDir(): void {
    if (tempDirectory) {
        rmSync(tempDirectory, {
            recursive: true,
            force: true,
        });
    }

    tempDirectory = undefined;
    delete process.env["IYI_API_DATA_DIR"];
}

function getResponseData(body: unknown): unknown {
    if (body && typeof body === "object" && "data" in body) {
        return (body as { data: unknown }).data;
    }

    return body;
}

afterEach(() => {
    cleanupTempDataDir();
});

describe("GET /stockpiles/lifecycle", () => {
    it("returns stockpile lifecycle metadata from the API handler", async () => {
        createTempDataDir();

        const handler = createApiRequestHandler();
        const response = await handler(
            new Request("http://localhost:8788/stockpiles/lifecycle", {
                method: "GET",
            }),
        );

        expect(response.status).toBe(200);

        const body = await response.json();
        const data = getResponseData(body);

        expect(data).toEqual({
            statuses: ["draft", "operational", "pending_review", "validated", "archived"],
            transitions: expect.arrayContaining([
                {
                    from: "draft",
                    to: "operational",
                },
                {
                    from: "validated",
                    to: "archived",
                },
            ]),
            allowedTransitionsByStatus: {
                draft: ["operational", "pending_review", "validated", "archived"],
                operational: ["pending_review", "validated", "archived"],
                pending_review: ["operational", "validated", "archived"],
                validated: ["pending_review", "archived"],
                archived: [],
            },
        });
    });
});