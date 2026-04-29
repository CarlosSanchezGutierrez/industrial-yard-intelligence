import { describe, expect, it } from "vitest";

import { createAuditMutationEntry } from "./audit-mutation-service.js";

describe("createAuditMutationEntry", () => {
    it("creates deterministic stockpile created audit metadata", () => {
        const entry = createAuditMutationEntry({
            requestId: "request-create-001",
            occurredAt: new Date("2026-01-01T00:00:00.000Z"),
            mutation: {
                type: "stockpile.created",
                stockpileId: "stockpile_001",
                stockpileName: "Coke pile A",
                materialName: "Petroleum coke",
                status: "draft",
            },
        });

        expect(entry.id).toMatch(/^audit_stockpile.created_request-create-001_/u);
        expect(entry.context).toEqual({
            requestId: "request-create-001",
            occurredAt: "2026-01-01T00:00:00.000Z",
            source: "cloud_api",
            actor: {
                type: "service",
                id: "cloud_api",
                displayName: "Cloud API",
            },
        });
        expect(entry.mutation).toEqual({
            type: "stockpile.created",
            stockpileId: "stockpile_001",
            stockpileName: "Coke pile A",
            materialName: "Petroleum coke",
            status: "draft",
        });
    });

    it("creates stockpile status update audit metadata with explicit actor", () => {
        const entry = createAuditMutationEntry({
            requestId: "request-status-001",
            occurredAt: new Date("2026-01-01T00:05:00.000Z"),
            actor: {
                type: "supervisor",
                id: "supervisor_001",
                displayName: "Supervisor",
            },
            mutation: {
                type: "stockpile.status_updated",
                stockpileId: "stockpile_001",
                previousStatus: "operational",
                nextStatus: "validated",
            },
        });

        expect(entry.context.actor).toEqual({
            type: "supervisor",
            id: "supervisor_001",
            displayName: "Supervisor",
        });
        expect(entry.mutation).toEqual({
            type: "stockpile.status_updated",
            stockpileId: "stockpile_001",
            previousStatus: "operational",
            nextStatus: "validated",
        });
    });
});