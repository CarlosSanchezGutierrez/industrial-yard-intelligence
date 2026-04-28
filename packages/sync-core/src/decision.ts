import type {
  ConflictType,
  SyncResultStatus,
  TenantId
} from "@iyi/kernel";
import {
  validateSyncEventEnvelope,
  type SyncConflict,
  type SyncEventEnvelope,
  type SyncEventResult
} from "@iyi/sync-protocol";

export interface SyncCoreContext {
  readonly expectedTenantId: TenantId;
  readonly knownEventIds: ReadonlySet<string>;
  readonly knownIdempotencyKeys: ReadonlySet<string>;
  readonly aggregateVersions?: ReadonlyMap<string, number>;
}

export interface SyncReconciliationInput<TPayload = Record<string, unknown>> {
  readonly event: SyncEventEnvelope<TPayload>;
  readonly context: SyncCoreContext;
  readonly acceptedAtEdge: string;
}

function createConflict(
  conflictType: ConflictType,
  message: string,
  incomingEventId?: SyncEventEnvelope["eventId"],
  affectedAggregateId?: string
): SyncConflict {
  const conflict: {
    conflictType: ConflictType;
    message: string;
    incomingEventId?: SyncEventEnvelope["eventId"];
    affectedAggregateId?: string;
  } = {
    conflictType,
    message
  };

  if (incomingEventId !== undefined) {
    conflict.incomingEventId = incomingEventId;
  }

  if (affectedAggregateId !== undefined) {
    conflict.affectedAggregateId = affectedAggregateId;
  }

  return conflict;
}

function createResult<TPayload>(
  event: SyncEventEnvelope<TPayload>,
  status: SyncResultStatus,
  acceptedAtEdge?: string,
  message?: string,
  conflict?: SyncConflict
): SyncEventResult {
  const result: {
    eventId: SyncEventEnvelope<TPayload>["eventId"];
    tenantId: SyncEventEnvelope<TPayload>["tenantId"];
    terminalId?: SyncEventEnvelope<TPayload>["terminalId"];
    status: SyncResultStatus;
    message?: string;
    conflict?: SyncConflict;
    acceptedAtEdge?: string;
  } = {
    eventId: event.eventId,
    tenantId: event.tenantId,
    status
  };

  if (event.terminalId !== undefined) {
    result.terminalId = event.terminalId;
  }

  if (acceptedAtEdge !== undefined) {
    result.acceptedAtEdge = acceptedAtEdge;
  }

  if (message !== undefined) {
    result.message = message;
  }

  if (conflict !== undefined) {
    result.conflict = conflict;
  }

  return result;
}

function aggregateVersionKey(event: SyncEventEnvelope): string {
  return `${event.aggregateType}:${event.aggregateId}`;
}

function getExpectedAggregateVersion(payload: unknown): number | undefined {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  if (!("expectedAggregateVersion" in payload)) {
    return undefined;
  }

  const value = (payload as { expectedAggregateVersion?: unknown }).expectedAggregateVersion;

  return typeof value === "number" && Number.isInteger(value) ? value : undefined;
}

export function determineSyncEventStatus<TPayload>(
  event: SyncEventEnvelope<TPayload>,
  context: SyncCoreContext
): {
  readonly status: SyncResultStatus;
  readonly message?: string;
  readonly conflict?: SyncConflict;
} {
  const envelopeValidation = validateSyncEventEnvelope(event);

  if (!envelopeValidation.ok) {
    return {
      status: "invalid",
      message: envelopeValidation.message
    };
  }

  if (event.tenantId !== context.expectedTenantId) {
    return {
      status: "conflict",
      conflict: createConflict(
        "tenant_mismatch",
        "Incoming event tenant does not match the edge server tenant.",
        event.eventId,
        String(event.aggregateId)
      )
    };
  }

  if (
    context.knownEventIds.has(event.eventId) ||
    context.knownIdempotencyKeys.has(event.idempotencyKey)
  ) {
    return {
      status: "duplicate",
      message: "Event was already processed."
    };
  }

  const expectedAggregateVersion = getExpectedAggregateVersion(event.payload);

  if (expectedAggregateVersion !== undefined && context.aggregateVersions !== undefined) {
    const currentVersion = context.aggregateVersions.get(aggregateVersionKey(event));

    if (currentVersion !== undefined && currentVersion !== expectedAggregateVersion) {
      return {
        status: "conflict",
        conflict: createConflict(
          "status_conflict",
          `Expected aggregate version ${expectedAggregateVersion}, but current version is ${currentVersion}.`,
          event.eventId,
          String(event.aggregateId)
        )
      };
    }
  }

  return {
    status: "accepted"
  };
}

export function reconcileSyncEvent<TPayload>(
  input: SyncReconciliationInput<TPayload>
): SyncEventResult {
  const decision = determineSyncEventStatus(input.event, input.context);

  return createResult(
    input.event,
    decision.status,
    decision.status === "accepted" ? input.acceptedAtEdge : undefined,
    decision.message,
    decision.conflict
  );
}