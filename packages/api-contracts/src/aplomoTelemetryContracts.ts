import type {
  AplomoGpsQuality,
  AplomoLatestDevicePosition,
  AplomoTelemetryEvent,
  AplomoTelemetryEventType,
  AplomoTelemetryPosition,
  AplomoTelemetrySource,
} from "@iyi/domain";

import type {
  AplomoApiAuditContext,
  AplomoApiResult,
  AplomoPagedResult,
  AplomoPageRequest,
} from "./aplomoCommon.js";

export type AplomoGpsTelemetryPayload = {
  companyId: string;
  deviceId: string;
  sessionId?: string;
  source: AplomoTelemetrySource;
  position: AplomoTelemetryPosition;
  quality?: AplomoGpsQuality;
  capturedAt?: string;
  rawPayload?: Record<string, unknown>;
  audit?: AplomoApiAuditContext;
};

export type AplomoSubmitGpsTelemetryRequest = AplomoGpsTelemetryPayload;

export type AplomoSubmitGpsTelemetryResponse = AplomoApiResult<{
  event: AplomoTelemetryEvent;
  latestPosition: AplomoLatestDevicePosition;
}>;

export type AplomoSubmitGpsTelemetryBatchRequest = {
  companyId: string;
  deviceId: string;
  sessionId?: string;
  source: AplomoTelemetrySource;
  events: Array<{
    position: AplomoTelemetryPosition;
    quality?: AplomoGpsQuality;
    capturedAt?: string;
    rawPayload?: Record<string, unknown>;
  }>;
  audit?: AplomoApiAuditContext;
};

export type AplomoSubmitGpsTelemetryBatchResponse = AplomoApiResult<{
  accepted: number;
  rejected: number;
  events: AplomoTelemetryEvent[];
  latestPosition?: AplomoLatestDevicePosition;
}>;

export type AplomoSubmitHeartbeatTelemetryRequest = {
  companyId: string;
  deviceId: string;
  sessionId?: string;
  source?: AplomoTelemetrySource;
  status?: "online" | "degraded" | "offline" | "unknown";
  batteryPercent?: number;
  signalPercent?: number;
  capturedAt?: string;
  rawPayload?: Record<string, unknown>;
};

export type AplomoSubmitHeartbeatTelemetryResponse = AplomoApiResult<{
  event: AplomoTelemetryEvent;
}>;

export type AplomoListLatestDevicePositionsRequest = AplomoPageRequest & {
  companyId: string;
  siteId?: string;
  deviceId?: string;
  source?: AplomoTelemetrySource;
  status?: AplomoLatestDevicePosition["status"];
  maxAgeSeconds?: number;
};

export type AplomoListLatestDevicePositionsResponse = AplomoApiResult<
  AplomoPagedResult<AplomoLatestDevicePosition>
>;

export type AplomoTelemetryHistoryRequest = AplomoPageRequest & {
  companyId: string;
  deviceId?: string;
  sessionId?: string;
  eventType?: AplomoTelemetryEventType;
  source?: AplomoTelemetrySource;
  fromCapturedAt?: string;
  toCapturedAt?: string;
};

export type AplomoTelemetryHistoryResponse = AplomoApiResult<
  AplomoPagedResult<AplomoTelemetryEvent>
>;

export type AplomoLiveMapSnapshotRequest = {
  companyId: string;
  siteId?: string;
  includeDevices?: boolean;
  includeLatestPositions?: boolean;
  includeConnections?: boolean;
  includeStale?: boolean;
};

export type AplomoLiveMapSnapshotResponse = AplomoApiResult<{
  companyId: string;
  siteId?: string;
  generatedAt: string;
  latestPositions: AplomoLatestDevicePosition[];
}>;
