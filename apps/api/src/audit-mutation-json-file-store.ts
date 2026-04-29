import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type {
    CloudApiAuditMutationEntryContract,
    CloudApiAuditMutationSummaryPayloadContract,
    CloudApiAuditMutationTypeContract,
} from "@iyi/api-contracts";

type MutableJsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is MutableJsonRecord {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(record: MutableJsonRecord, keys: readonly string[]): string | undefined {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "string" && value.trim().length > 0) {
            return value;
        }

        if (typeof value === "number") {
            return String(value);
        }
    }

    return undefined;
}

function isAuditMutationEntry(value: unknown): value is CloudApiAuditMutationEntryContract {
    if (!isRecord(value)) {
        return false;
    }

    if (typeof value["id"] !== "string") {
        return false;
    }

    if (!isRecord(value["context"])) {
        return false;
    }

    if (!isRecord(value["mutation"])) {
        return false;
    }

    return typeof value["mutation"]["type"] === "string";
}

function getRuntimeDbCandidatePaths(): readonly string[] {
    const configuredDataDirectory = process.env["IYI_API_DATA_DIR"];

    if (configuredDataDirectory) {
        return [join(configuredDataDirectory, "api-db.json")];
    }

    return [
        join(process.cwd(), ".api-data", "api-db.json"),
        join(process.cwd(), "apps", "api", ".api-data", "api-db.json"),
        join(process.cwd(), "apps", "api", ".api-data", "api.json"),
    ];
}

function findExistingRuntimeDbPath(): string | null {
    for (const candidatePath of getRuntimeDbCandidatePaths()) {
        if (existsSync(candidatePath)) {
            return candidatePath;
        }
    }

    return null;
}

function readRuntimeSnapshot(): { readonly path: string; readonly snapshot: MutableJsonRecord } | null {
    const runtimeDbPath = findExistingRuntimeDbPath();

    if (!runtimeDbPath) {
        return null;
    }

    const parsed = JSON.parse(readFileSync(runtimeDbPath, "utf8")) as unknown;

    if (!isRecord(parsed)) {
        return null;
    }

    return {
        path: runtimeDbPath,
        snapshot: parsed,
    };
}

export function appendCloudApiAuditMutationEntryToRuntimeStore(
    auditEntry: CloudApiAuditMutationEntryContract,
): void {
    const runtimeSnapshot = readRuntimeSnapshot();

    if (!runtimeSnapshot) {
        return;
    }

    const currentAuditEntries = Array.isArray(runtimeSnapshot.snapshot["audit_entries"])
        ? runtimeSnapshot.snapshot["audit_entries"]
        : [];

    runtimeSnapshot.snapshot["audit_entries"] = [...currentAuditEntries, auditEntry];

    writeFileSync(runtimeSnapshot.path, `${JSON.stringify(runtimeSnapshot.snapshot, null, 2)}\n`, "utf8");
}

export function readCloudApiRuntimeStockpileStatus(stockpileId: string): string | undefined {
    const runtimeSnapshot = readRuntimeSnapshot();

    if (!runtimeSnapshot) {
        return undefined;
    }

    const stockpiles = runtimeSnapshot.snapshot["stockpiles"];

    if (!Array.isArray(stockpiles)) {
        return undefined;
    }

    for (const stockpile of stockpiles) {
        if (!isRecord(stockpile)) {
            continue;
        }

        const candidateId = getString(stockpile, ["id", "stockpileId"]);

        if (candidateId !== stockpileId) {
            continue;
        }

        return getString(stockpile, ["status", "lifecycleStatus", "currentStatus"]);
    }

    return undefined;
}

export function readCloudApiRuntimeAuditEntries(): readonly CloudApiAuditMutationEntryContract[] {
    const runtimeSnapshot = readRuntimeSnapshot();

    if (!runtimeSnapshot) {
        return [];
    }

    const auditEntries = runtimeSnapshot.snapshot["audit_entries"];

    if (!Array.isArray(auditEntries)) {
        return [];
    }

    return auditEntries.filter(isAuditMutationEntry);
}

export function readCloudApiRuntimeAuditEntryCount(): number {
    return readCloudApiRuntimeAuditEntries().length;
}

export function readCloudApiRuntimeAuditSummary(): CloudApiAuditMutationSummaryPayloadContract {
    const entries = readCloudApiRuntimeAuditEntries();
    const mutationCountsByType: Partial<Record<CloudApiAuditMutationTypeContract, number>> = {};

    for (const entry of entries) {
        const mutationType = entry.mutation.type;
        mutationCountsByType[mutationType] = (mutationCountsByType[mutationType] ?? 0) + 1;
    }

    const latestEntry = entries.at(-1);

    return {
        auditEntryCount: entries.length,
        mutationCountsByType,
        ...(latestEntry !== undefined ? { latestEntry } : {}),
    };
}