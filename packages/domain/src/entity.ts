import type {
  DeviceId,
  EntityId,
  TenantId,
  TerminalId,
  UserId,
  ValidationState
} from "@iyi/kernel";

export interface TenantAwareEntity {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
}

export interface EntityProvenance {
  readonly createdByUserId: UserId;
  readonly createdByDeviceId: DeviceId;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

export interface OperationalEntity extends TenantAwareEntity, EntityProvenance {
  readonly validationState: ValidationState;
}