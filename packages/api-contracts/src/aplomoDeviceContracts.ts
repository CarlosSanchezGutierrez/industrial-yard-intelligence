import type {
  AplomoDeviceCapability,
  AplomoDeviceConnection,
  AplomoDeviceMetadata,
  AplomoDeviceSession,
  AplomoDeviceStatus,
  AplomoDeviceType,
  AplomoEmitterReceiverRole,
  AplomoRegisteredDevice,
} from "@iyi/domain";

import type {
  AplomoApiAuditContext,
  AplomoApiResult,
  AplomoPagedResult,
  AplomoPageRequest,
} from "./aplomoCommon.js";

export type AplomoRegisterDeviceRequest = {
  companyId: string;
  siteId?: string;
  name: string;
  type: AplomoDeviceType;
  capabilities?: AplomoDeviceCapability[];
  serialNumber?: string;
  externalIdentifier?: string;
  metadata?: AplomoDeviceMetadata;
  audit?: AplomoApiAuditContext;
};

export type AplomoRegisterDeviceResponse = AplomoApiResult<{
  device: AplomoRegisteredDevice;
}>;

export type AplomoUpdateDeviceRequest = {
  deviceId: string;
  name?: string;
  siteId?: string;
  status?: AplomoDeviceStatus;
  capabilities?: AplomoDeviceCapability[];
  serialNumber?: string;
  externalIdentifier?: string;
  metadata?: AplomoDeviceMetadata;
  audit?: AplomoApiAuditContext;
};

export type AplomoUpdateDeviceResponse = AplomoApiResult<{
  device: AplomoRegisteredDevice;
}>;

export type AplomoListDevicesRequest = AplomoPageRequest & {
  companyId: string;
  siteId?: string;
  status?: AplomoDeviceStatus;
  type?: AplomoDeviceType;
  capability?: AplomoDeviceCapability;
  search?: string;
};

export type AplomoListDevicesResponse = AplomoApiResult<
  AplomoPagedResult<AplomoRegisteredDevice>
>;

export type AplomoGetDeviceRequest = {
  deviceId: string;
  companyId: string;
};

export type AplomoGetDeviceResponse = AplomoApiResult<{
  device: AplomoRegisteredDevice;
}>;

export type AplomoStartDeviceSessionRequest = {
  companyId: string;
  deviceId: string;
  profileId?: string;
  ipAddress?: string;
  userAgent?: string;
  appVersion?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
  audit?: AplomoApiAuditContext;
};

export type AplomoStartDeviceSessionResponse = AplomoApiResult<{
  session: AplomoDeviceSession;
}>;

export type AplomoHeartbeatDeviceSessionRequest = {
  companyId: string;
  sessionId: string;
  deviceId: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  observedAt?: string;
};

export type AplomoHeartbeatDeviceSessionResponse = AplomoApiResult<{
  session: AplomoDeviceSession;
}>;

export type AplomoEndDeviceSessionRequest = {
  companyId: string;
  sessionId: string;
  deviceId: string;
  reason?: "manual" | "timeout" | "logout" | "replaced" | "error" | "unknown";
  audit?: AplomoApiAuditContext;
};

export type AplomoEndDeviceSessionResponse = AplomoApiResult<{
  session: AplomoDeviceSession;
}>;

export type AplomoOpenDeviceConnectionRequest = {
  companyId: string;
  deviceId: string;
  sessionId?: string;
  connectionType: AplomoDeviceConnection["connectionType"];
  role: AplomoEmitterReceiverRole;
  protocol?: string;
  remoteAddress?: string;
  localAddress?: string;
  metadata?: Record<string, unknown>;
  audit?: AplomoApiAuditContext;
};

export type AplomoOpenDeviceConnectionResponse = AplomoApiResult<{
  connection: AplomoDeviceConnection;
}>;

export type AplomoHeartbeatDeviceConnectionRequest = {
  companyId: string;
  connectionId: string;
  deviceId: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  observedAt?: string;
};

export type AplomoHeartbeatDeviceConnectionResponse = AplomoApiResult<{
  connection: AplomoDeviceConnection;
}>;

export type AplomoCloseDeviceConnectionRequest = {
  companyId: string;
  connectionId: string;
  deviceId: string;
  reason?: "manual" | "timeout" | "disconnect" | "error" | "unknown";
  audit?: AplomoApiAuditContext;
};

export type AplomoCloseDeviceConnectionResponse = AplomoApiResult<{
  connection: AplomoDeviceConnection;
}>;

export type AplomoListLiveConnectionsRequest = AplomoPageRequest & {
  companyId: string;
  siteId?: string;
  role?: AplomoEmitterReceiverRole;
  includeOffline?: boolean;
};

export type AplomoLiveDeviceConnectionView = {
  device: AplomoRegisteredDevice;
  session?: AplomoDeviceSession;
  connections: AplomoDeviceConnection[];
};

export type AplomoListLiveConnectionsResponse = AplomoApiResult<
  AplomoPagedResult<AplomoLiveDeviceConnectionView>
>;
