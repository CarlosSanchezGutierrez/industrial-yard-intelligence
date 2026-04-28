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

interface EdgeStoreFile {
  readonly version: 1;
  readonly batches: StoredSyncBatch[];
  readonly events: StoredSyncEvent[];
}

let cachedStore: EdgeStoreFile | null = null;

function createEmptyStore(): EdgeStoreFile {
  return {
    version: 1,
    batches: [],
    events: []
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEdgeStoreFile(value: unknown): value is EdgeStoreFile {
  return (
    isRecord(value) &&
    value["version"] === 1 &&
    Array.isArray(value["batches"]) &&
    Array.isArray(value["events"])
  );
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

  if (!isEdgeStoreFile(parsed)) {
    throw new Error(`Invalid edge store file format: ${storeFilePath}`);
  }

  cachedStore = {
    version: 1,
    batches: [...parsed.batches],
    events: [...parsed.events]
  };

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

export function resetEdgeMemoryStore(): void {
  cachedStore = createEmptyStore();

  const storeFilePath = getEdgeStoreFilePath();

  if (existsSync(storeFilePath)) {
    rmSync(storeFilePath, { force: true });
  }
}