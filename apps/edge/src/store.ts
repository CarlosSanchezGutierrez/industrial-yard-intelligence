import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type {
  SyncBatch,
  SyncBatchResult,
  SyncEventEnvelope,
  SyncEventResult
} from "@iyi/sync-protocol";

export interface StoredSyncEvent {
  readonly eventId: string;
  readonly idempotencyKey: string;
  readonly localSequence: number;
  readonly eventType: string;
  readonly eventVersion: number;
  readonly tenantId: string;
  readonly terminalId?: string;
  readonly userId: string;
  readonly deviceId: string;
  readonly sourceRuntime: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly validationState: string;
  readonly confidenceLevel?: string;
  readonly createdAtClient: string;
  readonly receivedAtEdge: string;
  readonly status: string;
  readonly message?: string;
  readonly conflictType?: string;
}

export interface StoredSyncBatch {
  readonly batchId: string;
  readonly tenantId: string;
  readonly terminalId?: string;
  readonly deviceId: string;
  readonly createdAtClient: string;
  readonly receivedAtEdge: string;
  readonly eventCount: number;
  readonly acceptedCount: number;
  readonly conflictCount: number;
  readonly rejectedCount: number;
  readonly invalidCount: number;
  readonly duplicateCount: number;
}

export interface EdgeSyncSummary {
  readonly totalBatches: number;
  readonly totalEvents: number;
  readonly accepted: number;
  readonly conflicts: number;
  readonly rejected: number;
  readonly invalid: number;
  readonly duplicates: number;
  readonly pendingReview: number;
  readonly superseded: number;
}

export interface EdgeStoreFile {
  readonly version: 1;
  readonly exportedAt?: string;
  readonly batches: StoredSyncBatch[];
  readonly events: StoredSyncEvent[];
  readonly aggregateVersions: Record<string, number>;
}

export interface EdgeStoreImportResult {
  readonly importedBatches: number;
  readonly importedEvents: number;
  readonly replacedExistingStore: boolean;
}

let cachedStore: EdgeStoreFile | null = null;

function createEmptyStore(): EdgeStoreFile {
  return {
    version: 1,
    batches: [],
    events: [],
    aggregateVersions: {}
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeAggregateVersions(value: unknown): Record<string, number> {
  if (!isRecord(value)) {
    return {};
  }

  const aggregateVersions: Record<string, number> = {};

  for (const [key, rawVersion] of Object.entries(value)) {
    if (typeof rawVersion === "number" && Number.isInteger(rawVersion) && rawVersion >= 0) {
      aggregateVersions[key] = rawVersion;
    }
  }

  return aggregateVersions;
}

function normalizeStoredBatch(value: unknown): StoredSyncBatch | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value["batchId"] !== "string" ||
    typeof value["tenantId"] !== "string" ||
    typeof value["deviceId"] !== "string" ||
    typeof value["createdAtClient"] !== "string" ||
    typeof value["receivedAtEdge"] !== "string"
  ) {
    return null;
  }

  return {
    batchId: value["batchId"],
    tenantId: value["tenantId"],
    ...(typeof value["terminalId"] === "string" ? { terminalId: value["terminalId"] } : {}),
    deviceId: value["deviceId"],
    createdAtClient: value["createdAtClient"],
    receivedAtEdge: value["receivedAtEdge"],
    eventCount:
      typeof value["eventCount"] === "number" && Number.isInteger(value["eventCount"])
        ? value["eventCount"]
        : 0,
    acceptedCount:
      typeof value["acceptedCount"] === "number" && Number.isInteger(value["acceptedCount"])
        ? value["acceptedCount"]
        : 0,
    conflictCount:
      typeof value["conflictCount"] === "number" && Number.isInteger(value["conflictCount"])
        ? value["conflictCount"]
        : 0,
    rejectedCount:
      typeof value["rejectedCount"] === "number" && Number.isInteger(value["rejectedCount"])
        ? value["rejectedCount"]
        : 0,
    invalidCount:
      typeof value["invalidCount"] === "number" && Number.isInteger(value["invalidCount"])
        ? value["invalidCount"]
        : 0,
    duplicateCount:
      typeof value["duplicateCount"] === "number" && Number.isInteger(value["duplicateCount"])
        ? value["duplicateCount"]
        : 0
  };
}

function normalizeStoredEvent(value: unknown): StoredSyncEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value["eventId"] !== "string" ||
    typeof value["eventType"] !== "string" ||
    typeof value["tenantId"] !== "string" ||
    typeof value["userId"] !== "string" ||
    typeof value["deviceId"] !== "string" ||
    typeof value["aggregateType"] !== "string" ||
    typeof value["aggregateId"] !== "string" ||
    typeof value["createdAtClient"] !== "string" ||
    typeof value["receivedAtEdge"] !== "string" ||
    typeof value["status"] !== "string"
  ) {
    return null;
  }

  const localSequence =
    typeof value["localSequence"] === "number" && Number.isInteger(value["localSequence"])
      ? value["localSequence"]
      : 0;

  const eventVersion =
    typeof value["eventVersion"] === "number" && Number.isInteger(value["eventVersion"])
      ? value["eventVersion"]
      : 1;

  const idempotencyKey =
    typeof value["idempotencyKey"] === "string" && value["idempotencyKey"].length > 0
      ? value["idempotencyKey"]
      : `${value["tenantId"]}:${value["deviceId"]}:${localSequence}:${value["eventId"]}`;

  return {
    eventId: value["eventId"],
    idempotencyKey,
    localSequence,
    eventType: value["eventType"],
    eventVersion,
    tenantId: value["tenantId"],
    ...(typeof value["terminalId"] === "string" ? { terminalId: value["terminalId"] } : {}),
    userId: value["userId"],
    deviceId: value["deviceId"],
    sourceRuntime:
      typeof value["sourceRuntime"] === "string" ? value["sourceRuntime"] : "unknown",
    aggregateType: value["aggregateType"],
    aggregateId: value["aggregateId"],
    validationState:
      typeof value["validationState"] === "string" ? value["validationState"] : "operational",
    ...(typeof value["confidenceLevel"] === "string"
      ? { confidenceLevel: value["confidenceLevel"] }
      : {}),
    createdAtClient: value["createdAtClient"],
    receivedAtEdge: value["receivedAtEdge"],
    status: value["status"],
    ...(typeof value["message"] === "string" ? { message: value["message"] } : {}),
    ...(typeof value["conflictType"] === "string" ? { conflictType: value["conflictType"] } : {})
  };
}

function normalizeStoreFile(value: unknown): EdgeStoreFile | null {
  if (!isRecord(value) || value["version"] !== 1) {
    return null;
  }

  if (!Array.isArray(value["batches"]) || !Array.isArray(value["events"])) {
    return null;
  }

  const batches = value["batches"]
    .map((batch) => normalizeStoredBatch(batch))
    .filter((batch): batch is StoredSyncBatch => batch !== null);

  const events = value["events"]
    .map((event) => normalizeStoredEvent(event))
    .filter((event): event is StoredSyncEvent => event !== null);

  return {
    version: 1,
    ...(typeof value["exportedAt"] === "string" ? { exportedAt: value["exportedAt"] } : {}),
    batches,
    events,
    aggregateVersions: normalizeAggregateVersions(value["aggregateVersions"])
  };
}

function getAggregateVersionKey(event: SyncEventEnvelope): string {
  return `${event.aggregateType}:${String(event.aggregateId)}`;
}

export function getEdgeDataDirectory(): string {
  return process.env["IYI_EDGE_DATA_DIR"] ?? join(process.cwd(), ".edge-data");
}

export function getEdgeStoreFilePath(): string {
  return join(getEdgeDataDirectory(), "sync-store.json");
}

function loadStore(): EdgeStoreFile {
  if (cachedStore !== null) {
    return cachedStore;
  }

  const storeFilePath = getEdgeStoreFilePath();

  if (!existsSync(storeFilePath)) {
    cachedStore = createEmptyStore();
    return cachedStore;
  }

  const raw = readFileSync(storeFilePath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  const normalized = normalizeStoreFile(parsed);

  if (normalized === null) {
    throw new Error(`Invalid edge store file format: ${storeFilePath}`);
  }

  cachedStore = normalized;

  return cachedStore;
}

function persistStore(store: EdgeStoreFile): void {
  const storeFilePath = getEdgeStoreFilePath();
  mkdirSync(dirname(storeFilePath), { recursive: true });
  writeFileSync(storeFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function countResultsByStatus(
  results: readonly SyncEventResult[],
  status: SyncEventResult["status"]
): number {
  return results.filter((result) => result.status === status).length;
}

function toStoredSyncEvent(
  event: SyncEventEnvelope,
  result: SyncEventResult,
  receivedAtEdge: string
): StoredSyncEvent {
  return {
    eventId: String(event.eventId),
    idempotencyKey: event.idempotencyKey,
    localSequence: event.localSequence,
    eventType: event.eventType,
    eventVersion: event.eventVersion,
    tenantId: String(event.tenantId),
    ...(event.terminalId !== undefined ? { terminalId: String(event.terminalId) } : {}),
    userId: String(event.userId),
    deviceId: String(event.deviceId),
    sourceRuntime: event.sourceRuntime,
    aggregateType: event.aggregateType,
    aggregateId: String(event.aggregateId),
    validationState: event.validationState,
    ...(event.confidenceLevel !== undefined ? { confidenceLevel: event.confidenceLevel } : {}),
    createdAtClient: event.createdAtClient,
    receivedAtEdge,
    status: result.status,
    ...(result.message !== undefined ? { message: result.message } : {}),
    ...(result.conflict?.conflictType !== undefined
      ? { conflictType: result.conflict.conflictType }
      : {})
  };
}

function toStoredSyncBatch(batch: SyncBatch, result: SyncBatchResult): StoredSyncBatch {
  return {
    batchId: batch.batchId,
    tenantId: String(batch.tenantId),
    ...(batch.terminalId !== undefined ? { terminalId: String(batch.terminalId) } : {}),
    deviceId: batch.deviceId,
    createdAtClient: batch.createdAtClient,
    receivedAtEdge: result.receivedAtEdge,
    eventCount: batch.events.length,
    acceptedCount: countResultsByStatus(result.results, "accepted"),
    conflictCount: countResultsByStatus(result.results, "conflict"),
    rejectedCount: countResultsByStatus(result.results, "rejected"),
    invalidCount: countResultsByStatus(result.results, "invalid"),
    duplicateCount: countResultsByStatus(result.results, "duplicate")
  };
}

function updateAggregateVersions(store: EdgeStoreFile, batch: SyncBatch, result: SyncBatchResult): void {
  for (const event of batch.events) {
    const eventResult = result.results.find(
      (candidate) => String(candidate.eventId) === String(event.eventId)
    );

    if (eventResult?.status !== "accepted") {
      continue;
    }

    const key = getAggregateVersionKey(event);
    const currentVersion = store.aggregateVersions[key] ?? 0;

    store.aggregateVersions[key] = currentVersion + 1;
  }
}

export function recordSyncBatch(batch: SyncBatch, result: SyncBatchResult): void {
  const store = loadStore();

  store.batches.push(toStoredSyncBatch(batch, result));

  for (const event of batch.events) {
    const eventResult = result.results.find(
      (candidate) => String(candidate.eventId) === String(event.eventId)
    );

    if (eventResult === undefined) {
      continue;
    }

    store.events.push(toStoredSyncEvent(event, eventResult, result.receivedAtEdge));
  }

  updateAggregateVersions(store, batch, result);
  persistStore(store);
}

export function getSyncEventHistory(): readonly StoredSyncEvent[] {
  const store = loadStore();

  return [...store.events].reverse();
}

export function getSyncBatchHistory(): readonly StoredSyncBatch[] {
  const store = loadStore();

  return [...store.batches].reverse();
}

export function getKnownSyncEventIds(): ReadonlySet<string> {
  const store = loadStore();

  return new Set(store.events.map((event) => event.eventId));
}

export function getKnownSyncIdempotencyKeys(): ReadonlySet<string> {
  const store = loadStore();

  return new Set(store.events.map((event) => event.idempotencyKey));
}

export function getAggregateVersions(): ReadonlyMap<string, number> {
  const store = loadStore();

  return new Map(Object.entries(store.aggregateVersions));
}

export function getSyncSummary(): EdgeSyncSummary {
  const store = loadStore();
  const events = store.events;

  return {
    totalBatches: store.batches.length,
    totalEvents: events.length,
    accepted: events.filter((event) => event.status === "accepted").length,
    conflicts: events.filter((event) => event.status === "conflict").length,
    rejected: events.filter((event) => event.status === "rejected").length,
    invalid: events.filter((event) => event.status === "invalid").length,
    duplicates: events.filter((event) => event.status === "duplicate").length,
    pendingReview: events.filter((event) => event.status === "pending_review").length,
    superseded: events.filter((event) => event.status === "superseded").length
  };
}

export function exportEdgeStore(now: string): EdgeStoreFile {
  const store = loadStore();

  return {
    version: 1,
    exportedAt: now,
    batches: [...store.batches],
    events: [...store.events],
    aggregateVersions: { ...store.aggregateVersions }
  };
}

export function importEdgeStore(value: unknown, replaceExistingStore = true): EdgeStoreImportResult {
  const imported = normalizeStoreFile(value);

  if (imported === null) {
    throw new Error("Invalid edge store import payload.");
  }

  if (replaceExistingStore) {
    cachedStore = {
      version: 1,
      batches: [...imported.batches],
      events: [...imported.events],
      aggregateVersions: { ...imported.aggregateVersions }
    };

    persistStore(cachedStore);

    return {
      importedBatches: imported.batches.length,
      importedEvents: imported.events.length,
      replacedExistingStore: true
    };
  }

  const store = loadStore();
  const existingBatchIds = new Set(store.batches.map((batch) => batch.batchId));
  const existingEventIds = new Set(store.events.map((event) => event.eventId));
  const existingIdempotencyKeys = new Set(store.events.map((event) => event.idempotencyKey));

  for (const batch of imported.batches) {
    if (!existingBatchIds.has(batch.batchId)) {
      store.batches.push(batch);
      existingBatchIds.add(batch.batchId);
    }
  }

  for (const event of imported.events) {
    if (!existingEventIds.has(event.eventId) && !existingIdempotencyKeys.has(event.idempotencyKey)) {
      store.events.push(event);
      existingEventIds.add(event.eventId);
      existingIdempotencyKeys.add(event.idempotencyKey);
    }
  }

  for (const [key, version] of Object.entries(imported.aggregateVersions)) {
    const currentVersion = store.aggregateVersions[key] ?? 0;
    store.aggregateVersions[key] = Math.max(currentVersion, version);
  }

  persistStore(store);

  return {
    importedBatches: imported.batches.length,
    importedEvents: imported.events.length,
    replacedExistingStore: false
  };
}

export function resetEdgeMemoryStore(): void {
  cachedStore = createEmptyStore();

  const storeFilePath = getEdgeStoreFilePath();

  if (existsSync(storeFilePath)) {
    rmSync(storeFilePath, { force: true });
  }
}