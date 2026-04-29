import { describe, expect, it } from "vitest";

import {
    cloudApiRouteDefinitions,
    isCloudApiRoutePath,
    type CloudApiStockpileLifecyclePayloadContract,
} from "./cloud-api.js";

describe("Cloud API stockpile lifecycle contract", () => {
    it("publishes the stockpile lifecycle route", () => {
        expect(isCloudApiRoutePath("/stockpiles/lifecycle")).toBe(true);

        expect(cloudApiRouteDefinitions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    method: "GET",
                    path: "/stockpiles/lifecycle",
                }),
            ]),
        );
    });

    it("models lifecycle statuses, transitions and allowed transitions by status", () => {
        const payload: CloudApiStockpileLifecyclePayloadContract = {
            statuses: ["draft", "operational", "pending_review", "validated", "archived"],
            transitions: [
                {
                    from: "draft",
                    to: "operational",
                },
                {
                    from: "operational",
                    to: "validated",
                },
            ],
            allowedTransitionsByStatus: {
                draft: ["operational", "pending_review", "validated", "archived"],
                operational: ["pending_review", "validated", "archived"],
                pending_review: ["operational", "validated", "archived"],
                validated: ["pending_review", "archived"],
                archived: [],
            },
        };

        expect(payload.statuses).toContain("draft");
        expect(payload.transitions).toContainEqual({
            from: "draft",
            to: "operational",
        });
        expect(payload.allowedTransitionsByStatus.archived).toEqual([]);
    });
});