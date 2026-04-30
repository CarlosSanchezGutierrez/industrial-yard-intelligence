import {
  isUsableGpsPosition,
  type AplomoDeviceConnection,
  type AplomoDeviceSession,
  type AplomoLatestDevicePosition,
  type AplomoRegisteredDevice,
  type AplomoTelemetryEvent,
} from "@iyi/domain";

import type {
  AplomoApiResult,
  AplomoCloseDeviceConnectionRequest,
  AplomoCloseDeviceConnectionResponse,
  AplomoEndDeviceSessionRequest,
  AplomoEndDeviceSessionResponse,
  AplomoGetDeviceRequest,
  AplomoGetDeviceResponse,
  AplomoHeartbeatDeviceConnectionRequest,
  AplomoHeartbeatDeviceConnectionResponse,
  AplomoHeartbeatDeviceSessionRequest,
  AplomoHeartbeatDeviceSessionResponse,
  AplomoListDevicesRequest,
  AplomoListDevicesResponse,
  AplomoListLatestDevicePositionsRequest,
  AplomoListLatestDevicePositionsResponse,
  AplomoListLiveConnectionsRequest,
  AplomoListLiveConnectionsResponse,
  AplomoLiveMapSnapshotRequest,
  AplomoLiveMapSnapshotResponse,
  AplomoOpenDeviceConnectionRequest,
  AplomoOpenDeviceConnectionResponse,
  AplomoRegisterDeviceRequest,
  AplomoRegisterDeviceResponse,
  AplomoStartDeviceSessionRequest,
  AplomoStartDeviceSessionResponse,
  AplomoSubmitGpsTelemetryBatchRequest,
  AplomoSubmitGpsTelemetryBatchResponse,
  AplomoSubmitGpsTelemetryRequest,
  AplomoSubmitGpsTelemetryResponse,
  AplomoSubmitHeartbeatTelemetryRequest,
  AplomoSubmitHeartbeatTelemetryResponse,
  AplomoTelemetryHistoryRequest,
  AplomoTelemetryHistoryResponse,
  AplomoUpdateDeviceRequest,
  AplomoUpdateDeviceResponse,
} from "@iyi/api-contracts";

type PageRequest = {
  limit?: number;
  cursor?: string;
};

const nowIso = (): string => new Date().toISOString();

const createId = (prefix: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 12);

  return `${prefix}_${timestamp}_${random}`;
};

const cleanText = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

const ok = <T>(data: T): AplomoApiResult<T> => ({
  ok: true,
  data,
});

const fail = <T>(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): AplomoApiResult<T> => {
  const error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } = {
    code,
    message,
  };

  if (details) {
    error.details = details;
  }

  return {
    ok: false,
    error,
  };
};

const safeLimit = (limit: number | undefined): number => {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return 50;
  }

  return Math.max(1, Math.min(Math.floor(limit), 250));
};

const pageItems = <T>(items: T[], request: PageRequest) => {
  const limit = safeLimit(request.limit);
  const start = Math.max(0, Number.parseInt(request.cursor ?? "0", 10) || 0);
  const end = start + limit;
  const sliced = items.slice(start, end);
  const hasMore = end < items.length;

  const page: {
    limit: number;
    nextCursor?: string;
    hasMore: boolean;
  } = {
    limit,
    hasMore,
  };

  if (hasMore) {
    page.nextCursor = String(end);
  }

  return {
    items: sliced,
    page,
  };
};

export type AplomoInMemoryDeviceTelemetrySnapshot = {
  devices: AplomoRegisteredDevice[];
  sessions: AplomoDeviceSession[];
  connections: AplomoDeviceConnection[];
  telemetryEvents: AplomoTelemetryEvent[];
  latestPositions: AplomoLatestDevicePosition[];
};

export class AplomoInMemoryDeviceTelemetryStore {
  private readonly devices = new Map<string, AplomoRegisteredDevice>();
  private readonly sessions = new Map<string, AplomoDeviceSession>();
  private readonly connections = new Map<string, AplomoDeviceConnection>();
  private readonly telemetryEvents = new Map<string, AplomoTelemetryEvent>();
  private readonly latestPositions = new Map<string, AplomoLatestDevicePosition>();

  registerDevice(
    request: AplomoRegisterDeviceRequest,
  ): AplomoRegisterDeviceResponse {
    const companyId = cleanText(request.companyId);
    const name = cleanText(request.name);

    if (!companyId) {
      return fail("missing_company_id", "companyId is required.");
    }

    if (!name) {
      return fail("missing_device_name", "Device name is required.");
    }

    const timestamp = nowIso();

    const device: AplomoRegisteredDevice = {
      id: createId("dev"),
      companyId,
      name,
      type: request.type,
      status: "registered",
      capabilities: request.capabilities ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const siteId = cleanText(request.siteId);
    if (siteId) {
      device.siteId = siteId;
    }

    const serialNumber = cleanText(request.serialNumber);
    if (serialNumber) {
      device.serialNumber = serialNumber;
    }

    const externalIdentifier = cleanText(request.externalIdentifier);
    if (externalIdentifier) {
      device.externalIdentifier = externalIdentifier;
    }

    const registeredByProfileId = cleanText(request.audit?.actor?.profileId);
    if (registeredByProfileId) {
      device.registeredByProfileId = registeredByProfileId;
    }

    if (request.metadata) {
      device.metadata = request.metadata;
    }

    this.devices.set(device.id, device);

    return ok({ device });
  }

  updateDevice(request: AplomoUpdateDeviceRequest): AplomoUpdateDeviceResponse {
    const device = this.devices.get(request.deviceId);

    if (!device) {
      return fail("device_not_found", "Device was not found.");
    }

    const updated: AplomoRegisteredDevice = {
      ...device,
      updatedAt: nowIso(),
    };

    const name = cleanText(request.name);
    if (name) {
      updated.name = name;
    }

    const siteId = cleanText(request.siteId);
    if (siteId) {
      updated.siteId = siteId;
    }

    if (request.status) {
      updated.status = request.status;
    }

    if (request.capabilities) {
      updated.capabilities = request.capabilities;
    }

    const serialNumber = cleanText(request.serialNumber);
    if (serialNumber) {
      updated.serialNumber = serialNumber;
    }

    const externalIdentifier = cleanText(request.externalIdentifier);
    if (externalIdentifier) {
      updated.externalIdentifier = externalIdentifier;
    }

    if (request.metadata) {
      updated.metadata = request.metadata;
    }

    this.devices.set(updated.id, updated);

    return ok({ device: updated });
  }

  listDevices(request: AplomoListDevicesRequest): AplomoListDevicesResponse {
    const search = cleanText(request.search)?.toLowerCase();

    const items = [...this.devices.values()]
      .filter((device) => device.companyId === request.companyId)
      .filter((device) => !request.siteId || device.siteId === request.siteId)
      .filter((device) => !request.status || device.status === request.status)
      .filter((device) => !request.type || device.type === request.type)
      .filter(
        (device) =>
          !request.capability || device.capabilities.includes(request.capability),
      )
      .filter((device) => {
        if (!search) {
          return true;
        }

        return (
          device.name.toLowerCase().includes(search) ||
          device.id.toLowerCase().includes(search) ||
          (device.serialNumber?.toLowerCase().includes(search) ?? false) ||
          (device.externalIdentifier?.toLowerCase().includes(search) ?? false)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return ok(pageItems(items, request));
  }

  getDevice(request: AplomoGetDeviceRequest): AplomoGetDeviceResponse {
    const device = this.devices.get(request.deviceId);

    if (!device || device.companyId !== request.companyId) {
      return fail("device_not_found", "Device was not found.");
    }

    return ok({ device });
  }

  startSession(
    request: AplomoStartDeviceSessionRequest,
  ): AplomoStartDeviceSessionResponse {
    const device = this.devices.get(request.deviceId);

    if (!device || device.companyId !== request.companyId) {
      return fail("device_not_found", "Device was not found.");
    }

    const timestamp = nowIso();

    const session: AplomoDeviceSession = {
      id: createId("ses"),
      companyId: request.companyId,
      deviceId: request.deviceId,
      status: "active",
      startedAt: timestamp,
      lastSeenAt: timestamp,
    };

    const profileId = cleanText(request.profileId);
    if (profileId) {
      session.profileId = profileId;
    }

    const ipAddress = cleanText(request.ipAddress);
    if (ipAddress) {
      session.ipAddress = ipAddress;
    }

    const userAgent = cleanText(request.userAgent);
    if (userAgent) {
      session.userAgent = userAgent;
    }

    const appVersion = cleanText(request.appVersion);
    if (appVersion) {
      session.appVersion = appVersion;
    }

    const platform = cleanText(request.platform);
    if (platform) {
      session.platform = platform;
    }

    if (request.metadata) {
      session.metadata = request.metadata;
    }

    this.sessions.set(session.id, session);

    return ok({ session });
  }

  heartbeatSession(
    request: AplomoHeartbeatDeviceSessionRequest,
  ): AplomoHeartbeatDeviceSessionResponse {
    const session = this.sessions.get(request.sessionId);

    if (
      !session ||
      session.companyId !== request.companyId ||
      session.deviceId !== request.deviceId
    ) {
      return fail("session_not_found", "Device session was not found.");
    }

    const updated: AplomoDeviceSession = {
      ...session,
      lastSeenAt: request.observedAt ?? nowIso(),
    };

    const ipAddress = cleanText(request.ipAddress);
    if (ipAddress) {
      updated.ipAddress = ipAddress;
    }

    const userAgent = cleanText(request.userAgent);
    if (userAgent) {
      updated.userAgent = userAgent;
    }

    if (request.metadata) {
      updated.metadata = request.metadata;
    }

    this.sessions.set(updated.id, updated);

    return ok({ session: updated });
  }

  endSession(request: AplomoEndDeviceSessionRequest): AplomoEndDeviceSessionResponse {
    const session = this.sessions.get(request.sessionId);

    if (
      !session ||
      session.companyId !== request.companyId ||
      session.deviceId !== request.deviceId
    ) {
      return fail("session_not_found", "Device session was not found.");
    }

    const timestamp = nowIso();

    const updated: AplomoDeviceSession = {
      ...session,
      status: "ended",
      endedAt: timestamp,
      lastSeenAt: timestamp,
    };

    this.sessions.set(updated.id, updated);

    return ok({ session: updated });
  }

  openConnection(
    request: AplomoOpenDeviceConnectionRequest,
  ): AplomoOpenDeviceConnectionResponse {
    const device = this.devices.get(request.deviceId);

    if (!device || device.companyId !== request.companyId) {
      return fail("device_not_found", "Device was not found.");
    }

    const timestamp = nowIso();

    const connection: AplomoDeviceConnection = {
      id: createId("con"),
      companyId: request.companyId,
      deviceId: request.deviceId,
      connectionType: request.connectionType,
      role: request.role,
      status: "online",
      startedAt: timestamp,
      lastSeenAt: timestamp,
    };

    const sessionId = cleanText(request.sessionId);
    if (sessionId) {
      connection.sessionId = sessionId;
    }

    const protocol = cleanText(request.protocol);
    if (protocol) {
      connection.protocol = protocol;
    }

    const remoteAddress = cleanText(request.remoteAddress);
    if (remoteAddress) {
      connection.remoteAddress = remoteAddress;
    }

    const localAddress = cleanText(request.localAddress);
    if (localAddress) {
      connection.localAddress = localAddress;
    }

    if (request.metadata) {
      connection.metadata = request.metadata;
    }

    this.connections.set(connection.id, connection);

    return ok({ connection });
  }

  heartbeatConnection(
    request: AplomoHeartbeatDeviceConnectionRequest,
  ): AplomoHeartbeatDeviceConnectionResponse {
    const connection = this.connections.get(request.connectionId);

    if (
      !connection ||
      connection.companyId !== request.companyId ||
      connection.deviceId !== request.deviceId
    ) {
      return fail("connection_not_found", "Device connection was not found.");
    }

    const updated: AplomoDeviceConnection = {
      ...connection,
      status: "online",
      lastSeenAt: request.observedAt ?? nowIso(),
    };

    if (request.metadata) {
      updated.metadata = request.metadata;
    }

    this.connections.set(updated.id, updated);

    return ok({ connection: updated });
  }

  closeConnection(
    request: AplomoCloseDeviceConnectionRequest,
  ): AplomoCloseDeviceConnectionResponse {
    const connection = this.connections.get(request.connectionId);

    if (
      !connection ||
      connection.companyId !== request.companyId ||
      connection.deviceId !== request.deviceId
    ) {
      return fail("connection_not_found", "Device connection was not found.");
    }

    const timestamp = nowIso();

    const updated: AplomoDeviceConnection = {
      ...connection,
      status: "closed",
      endedAt: timestamp,
      lastSeenAt: timestamp,
    };

    this.connections.set(updated.id, updated);

    return ok({ connection: updated });
  }

  listLiveConnections(
    request: AplomoListLiveConnectionsRequest,
  ): AplomoListLiveConnectionsResponse {
    const companyDevices = [...this.devices.values()].filter(
      (device) =>
        device.companyId === request.companyId &&
        (!request.siteId || device.siteId === request.siteId),
    );

    const views = companyDevices.map((device) => {
      const session = [...this.sessions.values()]
        .filter(
          (item) =>
            item.companyId === request.companyId &&
            item.deviceId === device.id &&
            item.status === "active",
        )
        .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))[0];

      const connections = [...this.connections.values()].filter((connection) => {
        if (connection.companyId !== request.companyId) {
          return false;
        }

        if (connection.deviceId !== device.id) {
          return false;
        }

        if (request.role && connection.role !== request.role) {
          return false;
        }

        if (!request.includeOffline && connection.status !== "online") {
          return false;
        }

        return true;
      });

      if (session) {
        return {
          device,
          session,
          connections,
        };
      }

      return {
        device,
        connections,
      };
    });

    return ok(pageItems(views, request));
  }

  submitGpsTelemetry(
    request: AplomoSubmitGpsTelemetryRequest,
  ): AplomoSubmitGpsTelemetryResponse {
    const device = this.devices.get(request.deviceId);

    if (!device || device.companyId !== request.companyId) {
      return fail("device_not_found", "Device was not found.");
    }

    if (!isUsableGpsPosition(request.position)) {
      return fail("invalid_gps_position", "GPS position is invalid.");
    }

    const timestamp = nowIso();
    const capturedAt = request.capturedAt ?? timestamp;

    const event: AplomoTelemetryEvent = {
      id: createId("tel"),
      companyId: request.companyId,
      deviceId: request.deviceId,
      eventType: "gps_position",
      source: request.source,
      position: request.position,
      capturedAt,
      receivedAt: timestamp,
    };

    const sessionId = cleanText(request.sessionId);
    if (sessionId) {
      event.sessionId = sessionId;
    }

    if (request.quality) {
      event.quality = request.quality;
    }

    if (request.rawPayload) {
      event.rawPayload = request.rawPayload;
    }

    this.telemetryEvents.set(event.id, event);

    const latestPosition: AplomoLatestDevicePosition = {
      companyId: request.companyId,
      deviceId: request.deviceId,
      eventId: event.id,
      source: request.source,
      position: request.position,
      status: "online",
      updatedAt: timestamp,
    };

    if (sessionId) {
      latestPosition.sessionId = sessionId;
    }

    if (request.quality) {
      latestPosition.quality = request.quality;
    }

    this.latestPositions.set(request.deviceId, latestPosition);

    return ok({
      event,
      latestPosition,
    });
  }

  submitGpsTelemetryBatch(
    request: AplomoSubmitGpsTelemetryBatchRequest,
  ): AplomoSubmitGpsTelemetryBatchResponse {
    const events: AplomoTelemetryEvent[] = [];
    let rejected = 0;
    let latestPosition: AplomoLatestDevicePosition | undefined;

    for (const item of request.events) {
      const singleRequest: AplomoSubmitGpsTelemetryRequest = {
        companyId: request.companyId,
        deviceId: request.deviceId,
        source: request.source,
        position: item.position,
      };

      if (request.sessionId) {
        singleRequest.sessionId = request.sessionId;
      }

      if (item.quality) {
        singleRequest.quality = item.quality;
      }

      if (item.capturedAt) {
        singleRequest.capturedAt = item.capturedAt;
      }

      if (item.rawPayload) {
        singleRequest.rawPayload = item.rawPayload;
      }

      if (request.audit) {
        singleRequest.audit = request.audit;
      }

      const result = this.submitGpsTelemetry(singleRequest);

      if (result.ok) {
        events.push(result.data.event);
        latestPosition = result.data.latestPosition;
      } else {
        rejected += 1;
      }
    }

    const data: {
      accepted: number;
      rejected: number;
      events: AplomoTelemetryEvent[];
      latestPosition?: AplomoLatestDevicePosition;
    } = {
      accepted: events.length,
      rejected,
      events,
    };

    if (latestPosition) {
      data.latestPosition = latestPosition;
    }

    return ok(data);
  }

  submitHeartbeatTelemetry(
    request: AplomoSubmitHeartbeatTelemetryRequest,
  ): AplomoSubmitHeartbeatTelemetryResponse {
    const device = this.devices.get(request.deviceId);

    if (!device || device.companyId !== request.companyId) {
      return fail("device_not_found", "Device was not found.");
    }

    const timestamp = nowIso();

    const rawPayload: Record<string, unknown> = {
      status: request.status ?? "online",
    };

    if (typeof request.batteryPercent === "number") {
      rawPayload.batteryPercent = request.batteryPercent;
    }

    if (typeof request.signalPercent === "number") {
      rawPayload.signalPercent = request.signalPercent;
    }

    if (request.rawPayload) {
      rawPayload.raw = request.rawPayload;
    }

    const event: AplomoTelemetryEvent = {
      id: createId("tel"),
      companyId: request.companyId,
      deviceId: request.deviceId,
      eventType: "heartbeat",
      source: request.source ?? "unknown",
      capturedAt: request.capturedAt ?? timestamp,
      receivedAt: timestamp,
      rawPayload,
    };

    const sessionId = cleanText(request.sessionId);
    if (sessionId) {
      event.sessionId = sessionId;
    }

    this.telemetryEvents.set(event.id, event);

    return ok({ event });
  }

  listLatestDevicePositions(
    request: AplomoListLatestDevicePositionsRequest,
  ): AplomoListLatestDevicePositionsResponse {
    const maxAgeMs =
      typeof request.maxAgeSeconds === "number" && Number.isFinite(request.maxAgeSeconds)
        ? request.maxAgeSeconds * 1000
        : undefined;

    const now = Date.now();

    const items = [...this.latestPositions.values()]
      .filter((position) => position.companyId === request.companyId)
      .filter((position) => !request.deviceId || position.deviceId === request.deviceId)
      .filter((position) => !request.source || position.source === request.source)
      .filter((position) => !request.status || position.status === request.status)
      .filter((position) => {
        if (!request.siteId) {
          return true;
        }

        const device = this.devices.get(position.deviceId);

        return device?.siteId === request.siteId;
      })
      .filter((position) => {
        if (!maxAgeMs) {
          return true;
        }

        return now - new Date(position.updatedAt).getTime() <= maxAgeMs;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return ok(pageItems(items, request));
  }

  telemetryHistory(
    request: AplomoTelemetryHistoryRequest,
  ): AplomoTelemetryHistoryResponse {
    const items = [...this.telemetryEvents.values()]
      .filter((event) => event.companyId === request.companyId)
      .filter((event) => !request.deviceId || event.deviceId === request.deviceId)
      .filter((event) => !request.sessionId || event.sessionId === request.sessionId)
      .filter((event) => !request.eventType || event.eventType === request.eventType)
      .filter((event) => !request.source || event.source === request.source)
      .filter(
        (event) =>
          !request.fromCapturedAt || event.capturedAt >= request.fromCapturedAt,
      )
      .filter(
        (event) => !request.toCapturedAt || event.capturedAt <= request.toCapturedAt,
      )
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));

    return ok(pageItems(items, request));
  }

  liveMapSnapshot(
    request: AplomoLiveMapSnapshotRequest,
  ): AplomoLiveMapSnapshotResponse {
    const latestPositions = [...this.latestPositions.values()]
      .filter((position) => position.companyId === request.companyId)
      .filter((position) => {
        if (!request.siteId) {
          return true;
        }

        const device = this.devices.get(position.deviceId);

        return device?.siteId === request.siteId;
      })
      .filter((position) => request.includeStale || position.status === "online")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return ok({
      companyId: request.companyId,
      generatedAt: nowIso(),
      latestPositions,
    });
  }

  snapshot(): AplomoInMemoryDeviceTelemetrySnapshot {
    return {
      devices: [...this.devices.values()],
      sessions: [...this.sessions.values()],
      connections: [...this.connections.values()],
      telemetryEvents: [...this.telemetryEvents.values()],
      latestPositions: [...this.latestPositions.values()],
    };
  }

  clear(): void {
    this.devices.clear();
    this.sessions.clear();
    this.connections.clear();
    this.telemetryEvents.clear();
    this.latestPositions.clear();
  }
}

export const createAplomoInMemoryDeviceTelemetryStore = () => {
  return new AplomoInMemoryDeviceTelemetryStore();
};
