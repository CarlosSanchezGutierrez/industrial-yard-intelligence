import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { CloudApiAuditMutationEntryContract } from "@iyi/api-contracts";

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

function getRuntimeDbCandidatePaths(): readonly string[] {
    const configuredDataDirectory = process.env["IYI_API_DATA_DIR"];

    const candidates = configuredDataDirectory
        ? [join(configuredDataDirectory, "api-db.json")]
        : [
              join(process.cwd(), ".api-data", "api-db.json"),
              join(process.cwd(), "apps", "api", ".api-data", "api-db.json"),
              join(process.cwd(), "apps", "api", ".api-data", "api.json"),
          ];

    return candidates;
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

export function readCloudApiRuntimeAuditEntryCount(): number {
    const runtimeSnapshot = readRuntimeSnapshot();

    if (!runtimeSnapshot) {
        return 0;
    }

    const auditEntries = runtimeSnapshot.snapshot["audit_entries"];

    if (!Array.isArray(auditEntries)) {
        return 0;
    }

    return auditEntries.length;
}