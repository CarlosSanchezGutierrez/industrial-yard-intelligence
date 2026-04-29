import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  appendAuditEntry,
  verifyAuditChain,
  type AuditChainVerificationResult,
  type AuditEntry
} from "@iyi/audit";
import {
  asDeviceId,
  asEntityId,
  asEventId,
  asTenantId,
  asTerminalId,
  asUserId
} from "@iyi/kernel";
import type { ConflictResolutionRecord } from "./conflict-resolutions.js";

interface AuditStoreFile {
  readonly version: 1;
  entries: AuditEntry[];
}

export interface EdgeAuditSummary {
  readonly totalEntries: number;
  readonly chainValid: boolean;
  readonly verificationMessage: string;
}

let cachedAuditStore: AuditStoreFile | null = null;

function createEmptyAuditStore(): AuditStoreFile {
  return {
    version: 1,
    entries: []
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeAuditEntry(value: unknown): AuditEntry | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value["tenantId"] !== "string" ||
    typeof value["auditEventId"] !== "string" ||
    typeof value["actionType"] !== "string" ||
    typeof value["affectedEntityId"] !== "string" ||
    typeof value["affectedEntityType"] !== "string" ||
    typeof value["result"] !== "string" ||
    typeof value["sourceRuntime"] !== "string" ||
    typeof value["userId"] !== "string" ||
    typeof value["deviceId"] !== "string" ||
    typeof value["createdAt"] !== "string" ||
    typeof value["hashAlgorithm"] !== "string" ||
    typeof value["integrityHash"] !== "string"
  ) {
    return null;
  }

  const result =
    value["result"] === "success" || value["result"] === "failure" || value["result"] === "conflict"
      ? value["result"]
      : "success";

  const sourceRuntime =
    value["sourceRuntime"] === "mobile" ||
    value["sourceRuntime"] === "edge" ||
    value["sourceRuntime"] === "cloud" ||
    value["sourceRuntime"] === "external_ingestion"
      ? value["sourceRuntime"]
      : "edge";

  return {
    tenantId: asTenantId(value["tenantId"]),
    ...(typeof value["terminalId"] === "string"
      ? { terminalId: asTerminalId(value["terminalId"]) }
      : {}),
    auditEventId: asEventId(value["auditEventId"]),
    actionType: value["actionType"],
    affectedEntityId: asEntityId(value["affectedEntityId"]),
    affectedEntityType: value["affectedEntityType"],
    previousValue: isRecord(value["previousValue"]) || value["previousValue"] === null
      ? (value["previousValue"] as AuditEntry["previousValue"])
      : null,
    newValue: isRecord(value["newValue"]) || Array.isArray(value["newValue"])
      ? (value["newValue"] as AuditEntry["newValue"])
      : {},
    result,
    sourceRuntime,
    userId: asUserId(value["userId"]),
    deviceId: asDeviceId(value["deviceId"]),
    ...(typeof value["syncEventId"] === "string"
      ? { syncEventId: asEventId(value["syncEventId"]) }
      : {}),
    createdAt: value["createdAt"],
    hashAlgorithm: "sha256",
    previousHash:
      typeof value["previousHash"] === "string" || value["previousHash"] === null
        ? value["previousHash"]
        : null,
    integrityHash: value["integrityHash"]
  };
}

function normalizeAuditStoreFile(value: unknown): AuditStoreFile | null {
  if (!isRecord(value) || value["version"] !== 1 || !Array.isArray(value["entries"])) {
    return null;
  }

  const entries = value["entries"]
    .map((entry) => normalizeAuditEntry(entry))
    .filter((entry): entry is AuditEntry => entry !== null);

  return {
    version: 1,
    entries
  };
}

export function getAuditStoreFilePath(): string {
  const dataDirectory = process.env["IYI_EDGE_DATA_DIR"] ?? join(process.cwd(), ".edge-data");

  return join(dataDirectory, "audit-chain.json");
}

function loadAuditStore(): AuditStoreFile {
  if (cachedAuditStore !== null) {
    return cachedAuditStore;
  }

  const filePath = getAuditStoreFilePath();

  if (!existsSync(filePath)) {
    cachedAuditStore = createEmptyAuditStore();
    return cachedAuditStore;
  }

  const raw = readFileSync(filePath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  const normalized = normalizeAuditStoreFile(parsed);

  if (normalized === null) {
    throw new Error(`Invalid audit store file format: ${filePath}`);
  }

  cachedAuditStore = normalized;

  return cachedAuditStore;
}

function persistAuditStore(store: AuditStoreFile): void {
  const filePath = getAuditStoreFilePath();
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export function getAuditEntries(): readonly AuditEntry[] {
  const store = loadAuditStore();

  return [...store.entries].reverse();
}

export function verifyEdgeAuditChain(): AuditChainVerificationResult {
  const store = loadAuditStore();

  return verifyAuditChain(store.entries);
}

export function getAuditSummary(): EdgeAuditSummary {
  const store = loadAuditStore();
  const verification = verifyAuditChain(store.entries);

  return {
    totalEntries: store.entries.length,
    chainValid: verification.ok,
    verificationMessage: verification.message
  };
}

export function recordConflictResolutionAudit(input: {
  readonly resolution: ConflictResolutionRecord;
  readonly createdAt: string;
}): AuditEntry {
  const store = loadAuditStore();

  const updatedEntries = appendAuditEntry(store.entries, {
    tenantId: asTenantId("tenant_cooper_tsmith"),
    terminalId: asTerminalId("terminal_altamira"),
    auditEventId: asEventId(`audit_${randomUUID()}`),
    actionType: "SYNC_CONFLICT_REVIEWED",
    affectedEntityId: asEntityId(input.resolution.eventId),
    affectedEntityType: "sync_event",
    previousValue: null,
    newValue: {
      resolutionId: input.resolution.resolutionId,
      eventId: input.resolution.eventId,
      decision: input.resolution.decision,
      note: input.resolution.note,
      resolvedByUserId: input.resolution.resolvedByUserId,
      resolvedByDeviceId: input.resolution.resolvedByDeviceId,
      resolvedAt: input.resolution.resolvedAt
    },
    result: "success",
    sourceRuntime: "edge",
    userId: asUserId(input.resolution.resolvedByUserId),
    deviceId: asDeviceId(input.resolution.resolvedByDeviceId),
    syncEventId: asEventId(input.resolution.eventId),
    createdAt: input.createdAt
  });

  store.entries = [...updatedEntries];
  persistAuditStore(store);

  const lastEntry = store.entries[store.entries.length - 1];

  if (lastEntry === undefined) {
    throw new Error("Audit entry was not appended.");
  }

  return lastEntry;
}

export function exportAuditStore(): AuditStoreFile {
  const store = loadAuditStore();

  return {
    version: 1,
    entries: [...store.entries]
  };
}

export function importAuditStore(value: unknown, replaceExistingStore = true): {
  readonly importedAuditEntries: number;
  readonly replacedExistingStore: boolean;
} {
  const imported = normalizeAuditStoreFile(value);

  if (imported === null) {
    throw new Error("Invalid audit store import payload.");
  }

  if (replaceExistingStore) {
    cachedAuditStore = {
      version: 1,
      entries: [...imported.entries]
    };

    persistAuditStore(cachedAuditStore);

    return {
      importedAuditEntries: imported.entries.length,
      replacedExistingStore: true
    };
  }

  const store = loadAuditStore();
  const existingHashes = new Set(store.entries.map((entry) => entry.integrityHash));

  for (const entry of imported.entries) {
    if (!existingHashes.has(entry.integrityHash)) {
      store.entries.push(entry);
      existingHashes.add(entry.integrityHash);
    }
  }

  persistAuditStore(store);

  return {
    importedAuditEntries: imported.entries.length,
    replacedExistingStore: false
  };
}

export function resetAuditStore(): void {
  cachedAuditStore = createEmptyAuditStore();

  const filePath = getAuditStoreFilePath();

  if (existsSync(filePath)) {
    rmSync(filePath, { force: true });
  }
}