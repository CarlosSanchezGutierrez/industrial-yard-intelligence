import { describe, expect, it } from "vitest";

import { createAuditMutationEntry } from "./audit-mutation-service.js";
import {
    appendCloudApiAuditMutationEntry,
    findCloudApiAuditMutationEntriesByStockpileId,
    getCloudApiAuditMutationEntryCount,
    type CloudApiAuditMutationSnapshot,
} from "./audit-mutation-snapshot-store.js";

describe("Cloud API audit mutation snapshot store", () => {
    it("appends stockpile created audit entries without mutating the original snapshot", () => {
        const snapshot: CloudApiAuditMutationSnapshot = {
            audit_entries: [],
        };

        const auditEntry = createAuditMutationEntry({
            requestId: "request-create-001",
            occurredAt: new Date("2026-01-01T00:00:00.000Z"),
            mutation: {
                type: "stockpile.created",
                stockpileId: "stockpile_001",
                stockpileName: "Coke pile A",
                status: "draft",
            },
        });

        const nextSnapshot = appendCloudApiAuditMutationEntry({
            snapshot,
            auditEntry,
        });

        expect(snapshot.audit_entries).toEqual([]);
        expect(nextSnapshot.audit_entries).toEqual([auditEntry]);
        expect(getCloudApiAuditMutationEntryCount(nextSnapshot)).toBe(1);
    });

    it("finds audit entries by stockpile id", () => {
        const firstEntry = createAuditMutationEntry({
            requestId: "request-create-001",
            occurredAt: new Date("2026-01-01T00:00:00.000Z"),
            mutation: {
                type: "stockpile.created",
                stockpileId: "stockpile_001",
                stockpileName: "Coke pile A",
                status: "draft",
            },
        });

        const secondEntry = createAuditMutationEntry({
            requestId: "request-status-001",
            occurredAt: new Date("2026-01-01T00:05:00.000Z"),
            mutation: {
                type: "stockpile.status_updated",
                stockpileId: "stockpile_001",
                previousStatus: "draft",
                nextStatus: "operational",
            },
        });

        const thirdEntry = createAuditMutationEntry({
            requestId: "request-create-002",
            occurredAt: new Date("2026-01-01T00:10:00.000Z"),
            mutation: {
                type: "stockpile.created",
                stockpileId: "stockpile_002",
                stockpileName: "Coal pile B",
                status: "draft",
            },
        });

        const snapshot: CloudApiAuditMutationSnapshot = {
            audit_entries: [firstEntry, secondEntry, thirdEntry],
        };

        expect(findCloudApiAuditMutationEntriesByStockpileId(snapshot, "stockpile_001")).toEqual([
            firstEntry,
            secondEntry,
        ]);
    });
});