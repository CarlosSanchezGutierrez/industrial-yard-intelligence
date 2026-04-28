import type {
  DeviceId,
  EventId,
  TenantId,
  TerminalId,
  UserId
} from "@iyi/kernel";
import type { SyncEventEnvelope } from "./envelope.js";

export const outboxStatuses = [
  "pending",
  "syncing",
  "accepted",
  "rejected",
  "conflict",
  "failed",
  "superseded"
] as const;

export type OutboxStatus = (typeof outboxStatuses)[number];

export interface OutboxRecord<TPayload = Record<string, unknown>> {
  readonly outboxId: string;
  readonly eventId: EventId;
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
  readonly deviceId: DeviceId;
  readonly userId: UserId;
  readonly envelope: SyncEventEnvelope<TPayload>;
  readonly localSequence: number;
  readonly status: OutboxStatus;
  readonly retryCount: number;
  readonly createdAtClient: string;
  readonly lastAttemptAt?: string;
  readonly lastError?: string;
}

export function canRetryOutboxRecord(record: OutboxRecord, maxRetries: number): boolean {
  return (
    record.status === "pending" ||
    record.status === "failed"
  ) && record.retryCount < maxRetries;
}

export function isTerminalOutboxStatus(status: OutboxStatus): boolean {
  return (
    status === "accepted" ||
    status === "rejected" ||
    status === "conflict" ||
    status === "superseded"
  );
}