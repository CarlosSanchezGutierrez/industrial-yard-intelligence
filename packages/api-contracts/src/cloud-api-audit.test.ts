import { describe, expect, it } from "vitest";

import type {
    CloudApiAuditMutationAppendPayloadContract,
    CloudApiAuditMutationEntryContract,
} from "./cloud-api-audit.js";

describe("Cloud API audit contracts", () => {
    it("models a stockpile created mutation audit entry", () => {
        const entry: CloudApiAuditMutationEntryContract = {
            id: "audit_stockpile_created_001",
            context: {
                requestId: "request_001",
                occurredAt: "2026-01-01T00:00:00.000Z",
                source: "cloud_api",
                actor: {
                    type: "service",
                    id: "api",
                    displayName: "Cloud API",
                },
            },
            mutation: {
                type: "stockpile.created",
                stockpileId: "stockpile_001",
                stockpileName: "Coke pile A",
                materialName: "Petroleum coke",
                yardZoneName: "Zone A",
                status: "draft",
            },
        };

        const payload: CloudApiAuditMutationAppendPayloadContract = {
            auditEntry: entry,
        };

        expect(payload.auditEntry.mutation.type).toBe("stockpile.created");
        expect(payload.auditEntry.context.source).toBe("cloud_api");
    });

    it("models a stockpile status update mutation audit entry", () => {
        const entry: CloudApiAuditMutationEntryContract = {
            id: "audit_stockpile_status_001",
            context: {
                requestId: "request_002",
                occurredAt: "2026-01-01T00:05:00.000Z",
                source: "cloud_api",
                actor: {
                    type: "supervisor",
                    id: "user_001",
                },
            },
            mutation: {
                type: "stockpile.status_updated",
                stockpileId: "stockpile_001",
                previousStatus: "operational",
                nextStatus: "validated",
            },
        };

        expect(entry.mutation).toEqual({
            type: "stockpile.status_updated",
            stockpileId: "stockpile_001",
            previousStatus: "operational",
            nextStatus: "validated",
        });
    });
});