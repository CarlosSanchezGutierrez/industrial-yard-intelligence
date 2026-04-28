import type {
  ConflictType,
  EventId,
  SyncResultStatus,
  TenantId,
  TerminalId
} from "@iyi/kernel";

export interface SyncConflict {
  readonly conflictType: ConflictType;
  readonly message: string;
  readonly affectedAggregateId?: string;
  readonly currentEventId?: EventId;
  readonly incomingEventId?: EventId;
}

export interface SyncEventResult {
  readonly eventId: EventId;
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
  readonly status: SyncResultStatus;
  readonly message?: string;
  readonly conflict?: SyncConflict;
  readonly acceptedAtEdge?: string;
}

export interface SyncBatchResult {
  readonly batchId: string;
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
  readonly receivedAtEdge: string;
  readonly results: readonly SyncEventResult[];
}

export function hasConflicts(batch: SyncBatchResult): boolean {
  return batch.results.some((result) => result.status === "conflict");
}

export function getAcceptedEventCount(batch: SyncBatchResult): number {
  return batch.results.filter((result) => result.status === "accepted").length;
}