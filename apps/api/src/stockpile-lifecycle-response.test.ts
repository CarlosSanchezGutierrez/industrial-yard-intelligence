import { describe, expect, it } from "vitest";

import { createStockpileLifecyclePayload } from "./stockpile-lifecycle-response.js";

describe("createStockpileLifecyclePayload", () => {
    it("exposes stockpile lifecycle statuses in domain order", () => {
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

        expect(payload.allowedTransitionsByStatus.draft).toEqual([
            "operational",
            "pending_review",
            "validated",
            "archived",
        ]);
        expect(payload.allowedTransitionsByStatus.operational).toEqual([
            "pending_review",
            "validated",
            "archived",
        ]);
        expect(payload.allowedTransitionsByStatus.pending_review).toEqual([
            "operational",
            "validated",
            "archived",
        ]);
        expect(payload.allowedTransitionsByStatus.validated).toEqual([
            "pending_review",
            "archived",
        ]);
        expect(payload.allowedTransitionsByStatus.archived).toEqual([]);
    });

    it("derives explicit transitions without archived outgoing transitions", () => {
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
    });
});