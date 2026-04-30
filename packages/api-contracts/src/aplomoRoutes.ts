export const aplomoDeviceApiRoutes = {
  registerDevice: "POST /devices/register",
  listDevices: "GET /devices",
  getDevice: "GET /devices/:deviceId",
  updateDevice: "PATCH /devices/:deviceId",
  startSession: "POST /devices/:deviceId/sessions",
  heartbeatSession: "PATCH /device-sessions/:sessionId/heartbeat",
  endSession: "POST /device-sessions/:sessionId/end",
  openConnection: "POST /device-connections",
  heartbeatConnection: "PATCH /device-connections/:connectionId/heartbeat",
  closeConnection: "PATCH /device-connections/:connectionId/close",
  listLiveConnections: "GET /device-connections/live",
} as const;

export const aplomoTelemetryApiRoutes = {
  submitGps: "POST /telemetry/gps",
  submitGpsBatch: "POST /telemetry/gps/batch",
  submitHeartbeat: "POST /telemetry/heartbeat",
  listLatestPositions: "GET /telemetry/latest",
  telemetryHistory: "GET /telemetry/history",
  liveMapSnapshot: "GET /telemetry/live-map-snapshot",
} as const;

export type AplomoDeviceApiRoute =
  (typeof aplomoDeviceApiRoutes)[keyof typeof aplomoDeviceApiRoutes];

export type AplomoTelemetryApiRoute =
  (typeof aplomoTelemetryApiRoutes)[keyof typeof aplomoTelemetryApiRoutes];
