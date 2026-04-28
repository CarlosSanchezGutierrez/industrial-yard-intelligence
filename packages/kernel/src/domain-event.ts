import type {
  AggregateId,
  DeviceId,
  EventId,
  TenantId,
  TerminalId,
  UserId
} from "./ids.js";
import type {
  ConfidenceLevel,
  SourceRuntime,
  ValidationState
} from "./states.js";

export interface DomainEvent<TPayload = unknown> {
  readonly eventId: EventId;
  readonly eventType: string;
  readonly eventVersion: number;
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
  readonly aggregateType: string;
  readonly aggregateId: AggregateId;
  readonly userId: UserId;
  readonly deviceId: DeviceId;
  readonly sourceRuntime: SourceRuntime;
  readonly createdAtClient: string;
  readonly validationState: ValidationState;
  readonly confidenceLevel?: ConfidenceLevel;
  readonly payload: TPayload;
}
