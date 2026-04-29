import { describe, expect, it } from "vitest";

import { createStockpileLifecyclePayload } from "./stockpile-lifecycle-response.js";

describe("createStockpileLifecyclePayload", () => {
    it("exposes lifecycle statuses in canonical domain order", () => {
        const payload = createStockpileLifecyclePayload();

        expect(payload.statuses).toEqual([
            "draft",
            "operational",
            "pending_review",
            "validated",
            "archived",
        ]);
    });

    it("exposes allowed transitions by current status", () => {
        const payload = createStockpileLifecyclePayload();

        expect(payload.allowedTransitionsByStatus).toEqual({
            draft: ["operational", "pending_review", "validated", "archived"],
            operational: ["pending_review", "validated", "archived"],
            pending_review: ["operational", "validated", "archived"],
            validated: ["pending_review", "archived"],
            archived: [],
        });
    });

    it("derives explicit non-idempotent transitions", () => {
        const payload = createStockpileLifecyclePayload();

        expect(payload.transitions).toContainEqual({
            from: "draft",
            to: "operational",
        });
        expect(payload.transitions).toContainEqual({
            from: "validated",
            to: "archived",
        });
        expect(payload.transitions).not.toContainEqual({
            from: "archived",
            to: "draft",
        });
        expect(payload.transitions).not.toContainEqual({
            from: "draft",
            to: "draft",
        });
    });
});