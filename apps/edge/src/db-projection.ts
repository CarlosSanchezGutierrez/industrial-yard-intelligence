import { join } from "node:path";
import {
  createEmptyJsonFileDbSnapshot,
  createJsonFileDbStore,
  type DbAuditEntryRecord,
  type DbConflictResolutionRecord,
  type DbDeviceRecord,
  type DbEvidenceItemRecord,
  type DbJsonValue,
  type DbStockpileRecord,
  type DbSyncEventRecord,
  type DbTenantRecord,
  type DbTerminalRecord,
  type DbUserRecord,
  type JsonFileDbSnapshot
} from "@iyi/db";
import { cooperSmokeSeed } from "@iyi/seed-data";
import { getAuditEntries } from "./audit-store.js";
import { getConflictResolutions } from "./conflict-resolutions.js";
import { getEvidenceItems } from "./evidence-store.js";
import { getSyncEventHistory } from "./store.js";

export interface EdgeDbProjectionSummary {
  readonly version: 1;
  readonly exportedAt: string;
  readonly storeFile: string;
  readonly tableCounts: Record<string, number>;
  readonly totalRows: number;
}

interface RecordLike {
  readonly [key: string]: unknown;
}

function isRecord(value: unknown): value is RecordLike {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function nullableString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function toDbJsonValue(value: unknown): DbJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as DbJsonValue;
}

function normalizeSyncStatus(value: unknown): DbSyncEventRecord["status"] {
  if (
    value === "accepted" ||
    value === "conflict" ||
    value === "rejected" ||
    value === "invalid" ||
    value === "duplicate" ||
    value === "pending_review" ||
    value === "superseded"
  ) {
    return value;
  }

  return "invalid";
}

function normalizeConflictDecision(value: unknown): DbConflictResolutionRecord["decision"] {
  if (
    value === "accepted_after_review" ||
    value === "rejected_after_review" ||
    value === "manual_action_required"
  ) {
    return value;
  }

  return "manual_action_required";
}

function normalizeAuditResult(value: unknown): DbAuditEntryRecord["result"] {
  if (value === "success" || value === "failure" || value === "conflict") {
    return value;
  }

  return "success";
}

function normalizeStockpileStatus(value: unknown): DbStockpileRecord["status"] {
  if (
    value === "draft" ||
    value === "operational" ||
    value === "pending_review" ||
    value === "validated" ||
    value === "archived"
  ) {
    return value;
  }

  return "operational";
}

export function getEdgeDbStoreFilePath(): string {
  const dataDirectory = process.env["IYI_EDGE_DATA_DIR"] ?? join(process.cwd(), ".edge-data");

  return join(dataDirectory, "edge-db-snapshot.json");
}

function createSeedTenants(now: string): readonly DbTenantRecord[] {
  return [
    {
      id: "tenant_cooper_tsmith",
      name: cooperSmokeSeed.tenantName,
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ];
}

function createSeedTerminals(now: string): readonly DbTerminalRecord[] {
  return [
    {
      id: "terminal_altamira",
      tenantId: "tenant_cooper_tsmith",
      name: cooperSmokeSeed.terminalName,
      timezone: "America/Monterrey",
      locationLabel: "Altamira, Tamaulipas",
      createdAt: now,
      updatedAt: now
    }
  ];
}

function createSeedUsers(now: string): readonly DbUserRecord[] {
  return [
    {
      id: "user_demo_operator",
      tenantId: "tenant_cooper_tsmith",
      displayName: "Demo Operator",
      role: "operator",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "user_supervisor_demo",
      tenantId: "tenant_cooper_tsmith",
      displayName: "Demo Supervisor",
      role: "supervisor",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "user_operator_001",
      tenantId: "tenant_cooper_tsmith",
      displayName: "Operator 001",
      role: "operator",
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ];
}

function createSeedDevices(now: string): readonly DbDeviceRecord[] {
  return [
    {
      id: "device_edge_local",
      tenantId: "tenant_cooper_tsmith",
      terminalId: "terminal_altamira",
      label: "Local Edge",
      deviceKind: "edge",
      status: "active",
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "device_web_demo",
      tenantId: "tenant_cooper_tsmith",
      terminalId: "terminal_altamira",
      label: "Web Demo Client",
      deviceKind: "web",
      status: "active",
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "device_web_supervisor",
      tenantId: "tenant_cooper_tsmith",
      terminalId: "terminal_altamira",
      label: "Web Supervisor Client",
      deviceKind: "web",
      status: "active",
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now
    }
  ];
}

function createSeedStockpiles(now: string): readonly DbStockpileRecord[] {
  return cooperSmokeSeed.stockpiles.map((stockpile) => {
    const source = stockpile as unknown as RecordLike;

    return {
      id: stringValue(source["id"], `stockpile_${String(source["name"] ?? "unknown")}`),
      tenantId: "tenant_cooper_tsmith",
      terminalId: "terminal_altamira",
      name: stringValue(source["name"], "Unnamed stockpile"),
      material: stringValue(source["material"], "unknown"),
      category: stringValue(source["category"], "bulk"),
      estimatedTons: numberValue(source["estimatedTons"], 0),
      validationState: normalizeStockpileStatus(source["status"]),
      confidenceLevel: "simulated",
      status: normalizeStockpileStatus(source["status"]),
      createdAt: now,
      updatedAt: now
    };
  });
}

function createSyncEventRecords(now: string): readonly DbSyncEventRecord[] {
  return getSyncEventHistory().map((event, index) => {
    const source = event as unknown as RecordLike;
    const eventId = stringValue(source["eventId"], `sync_event_${index + 1}`);
    const terminalId = nullableString(source["terminalId"]);
    const conflictType = nullableString(source["conflictType"]);
    const confidenceLevel = nullableString(source["confidenceLevel"]);

    return {
      id: eventId,
      tenantId: stringValue(source["tenantId"], "tenant_cooper_tsmith"),
      eventType: stringValue(source["eventType"], "UNKNOWN_EVENT"),
      aggregateType: stringValue(source["aggregateType"], "unknown"),
      aggregateId: stringValue(source["aggregateId"], "unknown"),
      status: normalizeSyncStatus(source["status"]),
      idempotencyKey: stringValue(source["idempotencyKey"], eventId),
      sourceRuntime: stringValue(source["sourceRuntime"], "edge"),
      userId: stringValue(source["userId"], "user_demo_operator"),
      deviceId: stringValue(source["deviceId"], "device_web_demo"),
      validationState: stringValue(source["validationState"], "operational"),
      payload: toDbJsonValue(source["payload"] ?? source),
      createdAtClient: stringValue(source["createdAtClient"], now),
      receivedAtEdge: stringValue(source["receivedAtEdge"], now),
      createdAt: now,
      ...(terminalId !== undefined ? { terminalId } : {}),
      ...(conflictType !== undefined ? { conflictType } : {}),
      ...(confidenceLevel !== undefined ? { confidenceLevel } : {})
    };
  });
}

function createConflictResolutionRecords(now: string): readonly DbConflictResolutionRecord[] {
  return getConflictResolutions().map((resolution, index) => {
    const source = resolution as unknown as RecordLike;
    const eventId = stringValue(source["eventId"], `sync_event_missing_${index + 1}`);

    return {
      id: stringValue(source["resolutionId"], `resolution_${index + 1}`),
      tenantId: "tenant_cooper_tsmith",
      syncEventId: eventId,
      decision: normalizeConflictDecision(source["decision"]),
      note: stringValue(source["note"], "No note."),
      resolvedByUserId: stringValue(source["resolvedByUserId"], "user_supervisor_demo"),
      resolvedByDeviceId: stringValue(source["resolvedByDeviceId"], "device_web_supervisor"),
      resolvedAt: stringValue(source["resolvedAt"], now),
      createdAt: now
    };
  });
}

function createAuditEntryRecords(now: string): readonly DbAuditEntryRecord[] {
  return getAuditEntries().map((entry, index) => {
    const source = entry as unknown as RecordLike;
    const terminalId = nullableString(source["terminalId"]);

    return {
      id: stringValue(source["auditEventId"], `audit_${index + 1}`),
      tenantId: stringValue(source["tenantId"], "tenant_cooper_tsmith"),
      actionType: stringValue(source["actionType"], "UNKNOWN_ACTION"),
      affectedEntityType: stringValue(source["affectedEntityType"], "unknown"),
      affectedEntityId: stringValue(source["affectedEntityId"], "unknown"),
      result: normalizeAuditResult(source["result"]),
      sourceRuntime: stringValue(source["sourceRuntime"], "edge"),
      userId: stringValue(source["userId"], "user_operator_001"),
      deviceId: stringValue(source["deviceId"], "device_edge_local"),
      previousHash: typeof source["previousHash"] === "string" ? source["previousHash"] : null,
      integrityHash: stringValue(source["integrityHash"], "0".repeat(64)),
      hashAlgorithm: "sha256",
      payload: toDbJsonValue(source),
      createdAt: stringValue(source["createdAt"], now),
      ...(terminalId !== undefined ? { terminalId } : {})
    };
  });
}

function createEvidenceItemRecords(now: string): readonly DbEvidenceItemRecord[] {
  return getEvidenceItems().map((item, index) => {
    const itemSource = item as unknown as RecordLike;
    const metadata = isRecord(itemSource["metadata"]) ? itemSource["metadata"] : {};
    const integrity = isRecord(metadata["integrity"]) ? metadata["integrity"] : {};
    const contentText = typeof itemSource["contentText"] === "string" ? itemSource["contentText"] : undefined;
    const terminalId = nullableString(metadata["terminalId"]);
    const fileName = nullableString(metadata["fileName"]);
    const mimeType = nullableString(metadata["mimeType"]);
    const relatedEntityId = nullableString(metadata["relatedEntityId"]);
    const relatedEventId = nullableString(metadata["relatedEventId"]);
    const contentPreview = contentText !== undefined ? contentText.slice(0, 500) : undefined;

    return {
      id: stringValue(metadata["evidenceId"], `evidence_${index + 1}`),
      tenantId: stringValue(metadata["tenantId"], "tenant_cooper_tsmith"),
      evidenceKind: stringValue(metadata["evidenceKind"], "other"),
      storageProvider: stringValue(metadata["storageProvider"], "edge_filesystem"),
      storageKey: stringValue(metadata["storageKey"], `evidence/unknown/${index + 1}`),
      ownerUserId: stringValue(metadata["ownerUserId"], "user_operator_001"),
      ownerDeviceId: stringValue(metadata["ownerDeviceId"], "device_web_demo"),
      sourceRuntime: stringValue(metadata["sourceRuntime"], "edge"),
      hashAlgorithm: "sha256",
      hashValue: stringValue(integrity["hashValue"], "0".repeat(64)),
      byteSize: numberValue(integrity["byteSize"], 0),
      immutable: metadata["immutable"] === true,
      registeredAt: stringValue(itemSource["registeredAt"], now),
      createdAt: stringValue(metadata["createdAt"], now),
      ...(terminalId !== undefined ? { terminalId } : {}),
      ...(fileName !== undefined ? { fileName } : {}),
      ...(mimeType !== undefined ? { mimeType } : {}),
      ...(relatedEntityId !== undefined ? { relatedEntityId } : {}),
      ...(relatedEventId !== undefined ? { relatedEventId } : {}),
      ...(contentPreview !== undefined ? { contentPreview } : {})
    };
  });
}

export function getEdgeDbSnapshot(now = new Date().toISOString()): JsonFileDbSnapshot {
  const snapshot = createEmptyJsonFileDbSnapshot(now);

  return {
    ...snapshot,
    tables: {
      ...snapshot.tables,
      app_tenants: createSeedTenants(now),
      terminals: createSeedTerminals(now),
      app_users: createSeedUsers(now),
      devices: createSeedDevices(now),
      stockpiles: createSeedStockpiles(now),
      sync_events: createSyncEventRecords(now),
      conflict_resolutions: createConflictResolutionRecords(now),
      audit_entries: createAuditEntryRecords(now),
      evidence_items: createEvidenceItemRecords(now)
    }
  };
}

export function getEdgeDbSummary(now = new Date().toISOString()): EdgeDbProjectionSummary {
  const snapshot = getEdgeDbSnapshot(now);
  const entries = Object.entries(snapshot.tables);
  const tableCounts: Record<string, number> = {};

  for (const [tableName, rows] of entries) {
    tableCounts[tableName] = rows.length;
  }

  return {
    version: 1,
    exportedAt: now,
    storeFile: getEdgeDbStoreFilePath(),
    tableCounts,
    totalRows: Object.values(tableCounts).reduce((total, count) => total + count, 0)
  };
}

export function saveEdgeDbSnapshot(now = new Date().toISOString()): JsonFileDbSnapshot {
  const snapshot = getEdgeDbSnapshot(now);
  const store = createJsonFileDbStore({
    filePath: getEdgeDbStoreFilePath(),
    initialSnapshot: snapshot
  });

  return store.saveToDisk(now);
}