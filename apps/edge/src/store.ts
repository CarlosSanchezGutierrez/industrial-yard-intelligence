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

interface EdgeMemoryStore {
  readonly batches: StoredSyncBatch[];
  readonly events: StoredSyncEvent[];
}

const edgeMemoryStore: EdgeMemoryStore = {
  batches: [],
  events: []
};

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
  edgeMemoryStore.batches.push(toStoredSyncBatch(batch, result));

  for (const event of batch.events) {
    const eventResult = result.results.find((candidate) => candidate.eventId === event.eventId);

    if (eventResult === undefined) {
      continue;
    }

    edgeMemoryStore.events.push(toStoredSyncEvent(event, eventResult, result.receivedAtEdge));
  }
}

export function getSyncEventHistory(): readonly StoredSyncEvent[] {
  return [...edgeMemoryStore.events].reverse();
}

export function getSyncBatchHistory(): readonly StoredSyncBatch[] {
  return [...edgeMemoryStore.batches].reverse();
}

export function getSyncSummary(): EdgeSyncSummary {
  const events = edgeMemoryStore.events;

  return {
    totalBatches: edgeMemoryStore.batches.length,
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
  edgeMemoryStore.batches.length = 0;
  edgeMemoryStore.events.length = 0;
}