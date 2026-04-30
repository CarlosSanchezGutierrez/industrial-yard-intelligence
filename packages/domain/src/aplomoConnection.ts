import type { AplomoId, AplomoIsoDateTime } from "./aplomoDevice.js";

export const aplomoEmitterReceiverRoles = [
  "emitter",
  "receiver",
  "both",
] as const;

export type AplomoEmitterReceiverRole =
  (typeof aplomoEmitterReceiverRoles)[number];

export const aplomoConnectionTypes = [
  "browser",
  "mobile_app",
  "bluetooth",
  "usb_serial",
  "mqtt",
  "websocket",
  "http",
  "gateway",
  "manual",
  "nmea_stream",
  "drone_link",
  "rtk_link",
  "unknown",
] as const;

export type AplomoConnectionType = (typeof aplomoConnectionTypes)[number];

export const aplomoConnectionStatuses = [
  "opening",
  "online",
  "degraded",
  "offline",
  "closed",
  "failed",
] as const;

export type AplomoConnectionStatus =
  (typeof aplomoConnectionStatuses)[number];

export type AplomoDeviceSession = {
  id: AplomoId;
  companyId: AplomoId;
  deviceId: AplomoId;
  profileId?: AplomoId;
  status: "active" | "ended" | "expired" | "failed";
  startedAt: AplomoIsoDateTime;
  endedAt?: AplomoIsoDateTime;
  lastSeenAt: AplomoIsoDateTime;
  ipAddress?: string;
  userAgent?: string;
  appVersion?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
};

export type AplomoDeviceConnection = {
  id: AplomoId;
  companyId: AplomoId;
  deviceId: AplomoId;
  sessionId?: AplomoId;
  connectionType: AplomoConnectionType;
  role: AplomoEmitterReceiverRole;
  status: AplomoConnectionStatus;
  protocol?: string;
  remoteAddress?: string;
  localAddress?: string;
  startedAt: AplomoIsoDateTime;
  endedAt?: AplomoIsoDateTime;
  lastSeenAt: AplomoIsoDateTime;
  metadata?: Record<string, unknown>;
};

export const isAplomoEmitter = (role: AplomoEmitterReceiverRole): boolean => {
  return role === "emitter" || role === "both";
};

export const isAplomoReceiver = (role: AplomoEmitterReceiverRole): boolean => {
  return role === "receiver" || role === "both";
};
