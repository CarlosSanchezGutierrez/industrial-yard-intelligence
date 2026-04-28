import type {
  DeviceId,
  TenantId,
  TerminalId,
  UserId
} from "@iyi/kernel";

export interface ApiTenantContext {
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
  readonly userId?: UserId;
  readonly deviceId?: DeviceId;
}

export function toTenantHeaders(context: ApiTenantContext): Record<string, string> {
  return {
    "x-tenant-id": context.tenantId,
    ...(context.terminalId !== undefined ? { "x-terminal-id": context.terminalId } : {}),
    ...(context.userId !== undefined ? { "x-user-id": context.userId } : {}),
    ...(context.deviceId !== undefined ? { "x-device-id": context.deviceId } : {})
  };
}