export type AplomoId = string;
export type AplomoIsoDateTime = string;

export const aplomoDeviceTypes = [
  "phone",
  "tablet",
  "drone",
  "gnss_receiver",
  "rtk_base",
  "rtk_rover",
  "total_station",
  "iot_gateway",
  "truck",
  "machine",
  "antenna",
  "survey_pole",
  "browser_console",
  "unknown",
] as const;

export type AplomoDeviceType = (typeof aplomoDeviceTypes)[number];

export const aplomoDeviceStatuses = [
  "draft",
  "registered",
  "active",
  "inactive",
  "maintenance",
  "blocked",
  "retired",
] as const;

export type AplomoDeviceStatus = (typeof aplomoDeviceStatuses)[number];

export const aplomoDeviceCapabilities = [
  "gps",
  "high_accuracy_gps",
  "rtk",
  "camera",
  "video",
  "bluetooth",
  "wifi",
  "cellular",
  "usb_serial",
  "nmea",
  "mqtt",
  "websocket",
  "offline_storage",
  "realtime_streaming",
  "telemetry_batching",
  "evidence_capture",
] as const;

export type AplomoDeviceCapability = (typeof aplomoDeviceCapabilities)[number];

export type AplomoDeviceIdentity = {
  id: AplomoId;
  companyId: AplomoId;
  siteId?: AplomoId;
  name: string;
  type: AplomoDeviceType;
  status: AplomoDeviceStatus;
  capabilities: AplomoDeviceCapability[];
  serialNumber?: string;
  externalIdentifier?: string;
  registeredByProfileId?: AplomoId;
  createdAt: AplomoIsoDateTime;
  updatedAt: AplomoIsoDateTime;
};

export type AplomoDeviceMetadata = {
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  appVersion?: string;
  platform?: string;
  operatingSystem?: string;
  browserName?: string;
  browserVersion?: string;
  userAgent?: string;
  notes?: string;
  raw?: Record<string, unknown>;
};

export type AplomoRegisteredDevice = AplomoDeviceIdentity & {
  metadata?: AplomoDeviceMetadata;
};

export const isAplomoDeviceType = (value: string): value is AplomoDeviceType => {
  return aplomoDeviceTypes.includes(value as AplomoDeviceType);
};

export const isAplomoDeviceCapability = (
  value: string,
): value is AplomoDeviceCapability => {
  return aplomoDeviceCapabilities.includes(value as AplomoDeviceCapability);
};
