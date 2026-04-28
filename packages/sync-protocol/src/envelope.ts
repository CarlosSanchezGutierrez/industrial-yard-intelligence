import {
  err,
  ok,
  type AggregateId,
  type ConfidenceLevel,
  type DeviceId,
  type EventId,
  type EvidenceId,
  type Result,
  type SourceRuntime,
  type SyncEnvelopeId,
  type TenantId,
  type TerminalId,
  type UserId,
  type ValidationState
} from "@iyi/kernel";

export interface SyncEventEnvelope<TPayload = Record<string, unknown>> {
  readonly syncEnvelopeId: SyncEnvelopeId;
  readonly eventId: EventId;
  readonly eventType: string;
  readonly eventVersion: number;
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
  readonly userId: UserId;
  readonly deviceId: DeviceId;
  readonly sourceRuntime: SourceRuntime;
  readonly createdAtClient: string;
  readonly receivedAtEdge?: string;
  readonly logicalTimestamp?: string;
  readonly localSequence: number;
  readonly idempotencyKey: string;
  readonly aggregateType: string;
  readonly aggregateId: AggregateId;
  readonly validationState: ValidationState;
  readonly confidenceLevel?: ConfidenceLevel;
  readonly payload: TPayload;
  readonly evidenceRefs?: readonly EvidenceId[];
  readonly previousEventRefs?: readonly EventId[];
}

export type SyncEnvelopeValidationError =
  | "missing_event_type"
  | "invalid_event_version"
  | "missing_created_at_client"
  | "invalid_local_sequence"
  | "missing_idempotency_key"
  | "missing_aggregate_type";

export function validateSyncEventEnvelope<TPayload>(
  envelope: SyncEventEnvelope<TPayload>
): Result<true, SyncEnvelopeValidationError> {
  if (envelope.eventType.trim().length === 0) {
    return err("missing_event_type", "Sync event envelope must include an event type.");
  }

  if (!Number.isInteger(envelope.eventVersion) || envelope.eventVersion < 1) {
    return err("invalid_event_version", "Sync event version must be an integer greater than zero.");
  }

  if (envelope.createdAtClient.trim().length === 0) {
    return err("missing_created_at_client", "Sync event must include createdAtClient.");
  }

  if (!Number.isInteger(envelope.localSequence) || envelope.localSequence < 0) {
    return err("invalid_local_sequence", "Local sequence must be a non-negative integer.");
  }

  if (envelope.idempotencyKey.trim().length === 0) {
    return err("missing_idempotency_key", "Sync event must include an idempotency key.");
  }

  if (envelope.aggregateType.trim().length === 0) {
    return err("missing_aggregate_type", "Sync event must include an aggregate type.");
  }

  return ok(true);
}

export function buildIdempotencyKey(input: {
  readonly tenantId: TenantId;
  readonly deviceId: DeviceId;
  readonly localSequence: number;
  readonly eventId: EventId;
}): string {
  return `${input.tenantId}:${input.deviceId}:${input.localSequence}:${input.eventId}`;
}