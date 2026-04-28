import type {
  DeviceId,
  TenantId,
  TerminalId,
  UserId
} from "./ids.js";
import type { SourceRuntime } from "./states.js";

export interface TenantContext {
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
}

export interface ActorContext {
  readonly userId: UserId;
  readonly deviceId: DeviceId;
  readonly sourceRuntime: SourceRuntime;
}

export interface ProvenanceMetadata extends TenantContext, ActorContext {
  readonly createdAt: string;
}

export interface AuditableChange<TSnapshot> {
  readonly previousValue: TSnapshot | null;
  readonly newValue: TSnapshot;
}
