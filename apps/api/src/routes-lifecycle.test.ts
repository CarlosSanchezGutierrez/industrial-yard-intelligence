import { describe, expect, it } from "vitest";

import { routeApiRequest } from "./routes.js";

function getBody(response: unknown): unknown {
    if (response && typeof response === "object" && "body" in response) {
        return (response as { body: unknown }).body;
    }

    return response;
}

function getStatusCode(response: unknown): unknown {
    if (response && typeof response === "object" && "statusCode" in response) {
        return (response as { statusCode: unknown }).statusCode;
    }

    if (response && typeof response === "object" && "status" in response) {
        return (response as { status: unknown }).status;
    }

    return undefined;
}

function getData(body: unknown): unknown {
    if (typeof body === "string") {
        return getData(JSON.parse(body));
    }

    if (body && typeof body === "object" && "data" in body) {
        return (body as { data: unknown }).data;
    }

    return body;
}

describe("GET /stockpiles/lifecycle", () => {
    it("returns stockpile lifecycle metadata from routeApiRequest", async () => {
        const request = {
            method: "GET",
            pathname: "/stockpiles/lifecycle",
            requestId: "routes-lifecycle-test",
            now: new Date("2026-01-01T00:00:00.000Z"),
        } as unknown as Parameters<typeof routeApiRequest>[0];

        const response = await routeApiRequest(request);

        expect(getStatusCode(response)).toBe(200);

        const data = getData(getBody(response));

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