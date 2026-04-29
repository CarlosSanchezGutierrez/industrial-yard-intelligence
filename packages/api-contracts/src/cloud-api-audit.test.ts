import { describe, expect, it } from "vitest";

import type {
    CloudApiAuditMutationAppendPayloadContract,
    CloudApiAuditMutationEntryContract,
    CloudApiAuditMutationListPayloadContract,
    CloudApiAuditMutationSummaryPayloadContract,
    CloudApiAuditStockpileHistoryPayloadContract,
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

    it("models audit mutation list and summary payloads", () => {
        const entry: CloudApiAuditMutationEntryContract = {
            id: "audit_stockpile_status_001",
            context: {
                requestId: "request_002",
                occurredAt: "2026-01-01T00:05:00.000Z",
                source: "cloud_api",
                actor: {
                    type: "service",
                    id: "cloud_api",
                },
            },
            mutation: {
                type: "stockpile.status_updated",
                stockpileId: "stockpile_001",
                previousStatus: "draft",
                nextStatus: "operational",
            },
        };

        const listPayload: CloudApiAuditMutationListPayloadContract = {
            entries: [entry],
        };

        const summaryPayload: CloudApiAuditMutationSummaryPayloadContract = {
            auditEntryCount: 1,
            mutationCountsByType: {
                "stockpile.status_updated": 1,
            },
            latestEntry: entry,
        };

        expect(listPayload.entries).toHaveLength(1);
        expect(summaryPayload.auditEntryCount).toBe(1);
        expect(summaryPayload.latestEntry?.id).toBe("audit_stockpile_status_001");
    });

    it("models stockpile-specific audit history payloads", () => {
        const entry: CloudApiAuditMutationEntryContract = {
            id: "audit_stockpile_history_001",
            context: {
                requestId: "request_003",
                occurredAt: "2026-01-01T00:10:00.000Z",
                source: "cloud_api",
                actor: {
                    type: "service",
                    id: "cloud_api",
                },
            },
            mutation: {
                type: "stockpile.status_updated",
                stockpileId: "stockpile_001",
                previousStatus: "draft",
                nextStatus: "operational",
            },
        };

        const payload: CloudApiAuditStockpileHistoryPayloadContract = {
            stockpileId: "stockpile_001",
            entries: [entry],
        };

        expect(payload.stockpileId).toBe("stockpile_001");
        expect(payload.entries).toEqual([entry]);
    });
});