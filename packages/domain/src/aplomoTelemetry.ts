import type { AplomoId, AplomoIsoDateTime } from "./aplomoDevice.js";

export const aplomoTelemetryEventTypes = [
  "gps_position",
  "heartbeat",
  "status_change",
  "battery",
  "signal_quality",
  "sensor_reading",
  "manual_marker",
  "route_point",
  "unknown",
] as const;

export type AplomoTelemetryEventType =
  (typeof aplomoTelemetryEventTypes)[number];

export const aplomoGpsFixTypes = [
  "none",
  "gps",
  "dgps",
  "rtk_float",
  "rtk_fixed",
  "estimated",
  "manual",
  "unknown",
] as const;

export type AplomoGpsFixType = (typeof aplomoGpsFixTypes)[number];

export const aplomoTelemetrySources = [
  "browser_geolocation",
  "mobile_native",
  "gnss_receiver",
  "rtk_rover",
  "rtk_base",
  "drone",
  "nmea",
  "mqtt",
  "gateway",
  "manual",
  "simulation",
  "unknown",
] as const;

export type AplomoTelemetrySource =
  (typeof aplomoTelemetrySources)[number];

export type AplomoGpsQuality = {
  accuracyMeters?: number;
  altitudeAccuracyMeters?: number;
  hdop?: number;
  vdop?: number;
  satelliteCount?: number;
  fixType: AplomoGpsFixType;
  rtkStatus?: "none" | "float" | "fixed" | "lost" | "unknown";
  correctionAgeSeconds?: number;
};

export type AplomoTelemetryPosition = {
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  headingDegrees?: number;
  speedMetersPerSecond?: number;
};

export type AplomoTelemetryEvent = {
  id: AplomoId;
  companyId: AplomoId;
  deviceId: AplomoId;
  sessionId?: AplomoId;
  eventType: AplomoTelemetryEventType;
  source: AplomoTelemetrySource;
  position?: AplomoTelemetryPosition;
  quality?: AplomoGpsQuality;
  capturedAt: AplomoIsoDateTime;
  receivedAt: AplomoIsoDateTime;
  rawPayload?: Record<string, unknown>;
};

export type AplomoLatestDevicePosition = {
  companyId: AplomoId;
  deviceId: AplomoId;
  sessionId?: AplomoId;
  eventId?: AplomoId;
  source: AplomoTelemetrySource;
  position: AplomoTelemetryPosition;
  quality?: AplomoGpsQuality;
  status: "online" | "stale" | "offline" | "unknown";
  updatedAt: AplomoIsoDateTime;
};

export const isHighAccuracyGps = (quality: AplomoGpsQuality): boolean => {
  if (quality.fixType === "rtk_fixed") {
    return true;
  }

  if (typeof quality.accuracyMeters === "number") {
    return quality.accuracyMeters <= 1;
  }

  return false;
};

export const isUsableGpsPosition = (
  position: AplomoTelemetryPosition,
): boolean => {
  return (
    Number.isFinite(position.latitude) &&
    Number.isFinite(position.longitude) &&
    position.latitude >= -90 &&
    position.latitude <= 90 &&
    position.longitude >= -180 &&
    position.longitude <= 180
  );
};
