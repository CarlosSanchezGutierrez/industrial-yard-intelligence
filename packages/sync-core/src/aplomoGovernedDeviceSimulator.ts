import {
  createAplomoDataContractId,
  type AplomoDataContract,
  type AplomoDeviceCapability,
  type AplomoDeviceType,
  type AplomoEmitterReceiverRole,
  type AplomoGovernanceEnvelope,
  type AplomoGpsQuality,
  type AplomoRegisteredDevice,
  type AplomoTelemetryEvent,
  type AplomoTelemetryPosition,
  type AplomoTelemetrySource,
} from "@iyi/domain";

import {
  AplomoInMemoryDeviceTelemetryStore,
  type AplomoInMemoryDeviceTelemetrySnapshot,
} from "./aplomoInMemoryDeviceTelemetryStore.js";

export type AplomoDemoDevicePlan = {
  key: string;
  name: string;
  type: AplomoDeviceType;
  role: AplomoEmitterReceiverRole;
  source: AplomoTelemetrySource;
  capabilities: AplomoDeviceCapability[];
  basePosition: AplomoTelemetryPosition;
  accuracyMeters: number;
  movementScale: number;
  metadata: Record<string, unknown>;
};

export type AplomoGovernedTelemetryOutput = {
  event: AplomoTelemetryEvent;
  envelope: AplomoGovernanceEnvelope<AplomoTelemetryEvent>;
};

export type AplomoDemoSimulationState = {
  companyId: string;
  siteId: string;
  profileId: string;
  devices: AplomoRegisteredDevice[];
  governedEvents: AplomoGovernedTelemetryOutput[];
  snapshot: AplomoInMemoryDeviceTelemetrySnapshot;
};

export type AplomoDemoSimulationTickResult = {
  tick: number;
  generatedAt: string;
  governedEvents: AplomoGovernedTelemetryOutput[];
  snapshot: AplomoInMemoryDeviceTelemetrySnapshot;
};

const telemetryContractId = createAplomoDataContractId(
  "telemetry",
  "gps_telemetry_event",
  "1.0.0",
);

const latestPositionContractId = createAplomoDataContractId(
  "telemetry",
  "latest_device_position",
  "1.0.0",
);

const nowIso = (): string => new Date().toISOString();

const round = (value: number, digits: number): number => {
  const factor = 10 ** digits;

  return Math.round(value * factor) / factor;
};

const createQuality = (
  accuracyMeters: number,
  source: AplomoTelemetrySource,
): AplomoGpsQuality => {
  const quality: AplomoGpsQuality = {
    accuracyMeters,
    fixType: source === "rtk_rover" ? "rtk_fixed" : "gps",
  };

  if (source === "rtk_rover") {
    quality.rtkStatus = "fixed";
    quality.satelliteCount = 18;
    quality.hdop = 0.6;
    quality.vdop = 0.9;
    quality.correctionAgeSeconds = 1;
  } else if (source === "gnss_receiver") {
    quality.satelliteCount = 14;
    quality.hdop = 0.9;
    quality.vdop = 1.2;
  } else if (source === "drone") {
    quality.satelliteCount = 12;
    quality.hdop = 1.3;
    quality.vdop = 1.7;
  } else {
    quality.satelliteCount = 8;
    quality.hdop = 2.2;
    quality.vdop = 2.8;
  }

  return quality;
};

const createMovedPosition = (
  base: AplomoTelemetryPosition,
  tick: number,
  index: number,
  movementScale: number,
): AplomoTelemetryPosition => {
  const angle = tick * 0.37 + index * 0.91;
  const latOffset = Math.sin(angle) * movementScale;
  const lngOffset = Math.cos(angle) * movementScale;

  const position: AplomoTelemetryPosition = {
    latitude: round(base.latitude + latOffset, 7),
    longitude: round(base.longitude + lngOffset, 7),
  };

  if (typeof base.altitudeMeters === "number") {
    position.altitudeMeters = round(base.altitudeMeters + Math.sin(angle) * 2, 2);
  }

  position.headingDegrees = round((angle * 57.2958) % 360, 2);
  position.speedMetersPerSecond = round(Math.abs(Math.sin(angle)) * 4 + 0.2, 2);

  return position;
};

export const createAplomoTelemetryDataContract = (): AplomoDataContract => {
  const timestamp = nowIso();

  return {
    id: telemetryContractId,
    name: "GPS telemetry event",
    domain: "telemetry",
    entityName: "gps_telemetry_event",
    version: "1.0.0",
    tier: "bronze",
    owner: {
      team: "Aplomo Data Platform",
      ownerName: "Aplomo Systems",
    },
    sensitivity: "confidential",
    aiUsagePolicy: "allowed_with_redaction",
    retention: {
      retentionDays: 730,
      archiveAfterDays: 180,
      deleteAfterDays: 2555,
      legalHoldAllowed: true,
    },
    fields: [
      {
        name: "companyId",
        type: "string",
        required: true,
        sensitivity: "confidential",
        description: "Tenant/company owner.",
      },
      {
        name: "deviceId",
        type: "string",
        required: true,
        sensitivity: "confidential",
        description: "Registered device identifier.",
      },
      {
        name: "position.latitude",
        type: "number",
        required: true,
        sensitivity: "confidential",
        description: "GPS latitude.",
      },
      {
        name: "position.longitude",
        type: "number",
        required: true,
        sensitivity: "confidential",
        description: "GPS longitude.",
      },
      {
        name: "quality.accuracyMeters",
        type: "number",
        required: false,
        sensitivity: "internal",
        description: "Estimated GPS accuracy.",
      },
      {
        name: "source",
        type: "AplomoTelemetrySource",
        required: true,
        sensitivity: "internal",
        description: "Telemetry source adapter.",
      },
    ],
    qualityRules: [
      "latitude must be between -90 and 90",
      "longitude must be between -180 and 180",
      "capturedAt must be present",
      "deviceId must map to a registered device",
      "accuracyMeters should be present when available",
      "source must identify the adapter or hardware family",
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const createAplomoLatestPositionDataContract = (): AplomoDataContract => {
  const timestamp = nowIso();

  return {
    id: latestPositionContractId,
    name: "Latest device position",
    domain: "telemetry",
    entityName: "latest_device_position",
    version: "1.0.0",
    tier: "silver",
    owner: {
      team: "Aplomo Data Platform",
      ownerName: "Aplomo Systems",
    },
    sensitivity: "confidential",
    aiUsagePolicy: "allowed_with_redaction",
    retention: {
      retentionDays: 365,
      archiveAfterDays: 90,
      deleteAfterDays: 1825,
      legalHoldAllowed: true,
    },
    fields: [
      {
        name: "companyId",
        type: "string",
        required: true,
        sensitivity: "confidential",
      },
      {
        name: "deviceId",
        type: "string",
        required: true,
        sensitivity: "confidential",
      },
      {
        name: "position",
        type: "AplomoTelemetryPosition",
        required: true,
        sensitivity: "confidential",
      },
      {
        name: "updatedAt",
        type: "string",
        required: true,
        sensitivity: "internal",
      },
    ],
    qualityRules: [
      "latest position must reference a valid device",
      "position must be usable",
      "updatedAt must be recent for online devices",
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const aplomoIndustrialDemoDevicePlans: AplomoDemoDevicePlan[] = [
  {
    key: "operator-phone-01",
    name: "Operador patio norte",
    type: "phone",
    role: "emitter",
    source: "browser_geolocation",
    capabilities: ["gps", "camera", "cellular", "evidence_capture"],
    basePosition: {
      latitude: 22.407,
      longitude: -97.9385,
      altitudeMeters: 8,
    },
    accuracyMeters: 7.5,
    movementScale: 0.00018,
    metadata: {
      lane: "patio_norte",
      businessUse: "field_capture",
    },
  },
  {
    key: "supervisor-tablet-01",
    name: "Tablet supervisor",
    type: "tablet",
    role: "receiver",
    source: "browser_geolocation",
    capabilities: ["gps", "wifi", "realtime_streaming"],
    basePosition: {
      latitude: 22.4067,
      longitude: -97.9381,
      altitudeMeters: 9,
    },
    accuracyMeters: 10,
    movementScale: 0.00005,
    metadata: {
      businessUse: "control_room_mobile",
    },
  },
  {
    key: "drone-01",
    name: "Dron inspección pila",
    type: "drone",
    role: "emitter",
    source: "drone",
    capabilities: ["gps", "camera", "video", "realtime_streaming"],
    basePosition: {
      latitude: 22.4073,
      longitude: -97.9387,
      altitudeMeters: 52,
    },
    accuracyMeters: 2.5,
    movementScale: 0.00032,
    metadata: {
      businessUse: "aerial_inspection",
      payload: "camera",
    },
  },
  {
    key: "gnss-rover-01",
    name: "Bastón GNSS RTK",
    type: "rtk_rover",
    role: "emitter",
    source: "rtk_rover",
    capabilities: ["gps", "high_accuracy_gps", "rtk", "nmea", "offline_storage"],
    basePosition: {
      latitude: 22.4065,
      longitude: -97.9389,
      altitudeMeters: 7,
    },
    accuracyMeters: 0.03,
    movementScale: 0.00012,
    metadata: {
      businessUse: "survey_grade_capture",
      correction: "rtk_fixed",
    },
  },
  {
    key: "rtk-base-01",
    name: "Antena RTK base",
    type: "rtk_base",
    role: "both",
    source: "rtk_base",
    capabilities: ["gps", "high_accuracy_gps", "rtk", "nmea", "mqtt"],
    basePosition: {
      latitude: 22.40755,
      longitude: -97.93795,
      altitudeMeters: 15,
    },
    accuracyMeters: 0.02,
    movementScale: 0,
    metadata: {
      businessUse: "correction_station",
      fixedAsset: true,
    },
  },
  {
    key: "truck-01",
    name: "Camión interno 01",
    type: "truck",
    role: "emitter",
    source: "gateway",
    capabilities: ["gps", "cellular", "mqtt", "telemetry_batching"],
    basePosition: {
      latitude: 22.4069,
      longitude: -97.9377,
      altitudeMeters: 6,
    },
    accuracyMeters: 4,
    movementScale: 0.00028,
    metadata: {
      businessUse: "internal_transport",
      material: "bulk_material",
    },
  },
];

const createGovernedTelemetryEnvelope = (
  event: AplomoTelemetryEvent,
  producer: string,
): AplomoGovernanceEnvelope<AplomoTelemetryEvent> => {
  const measuredAt = nowIso();
  const accuracy = event.quality?.accuracyMeters;

  const qualityScore =
    typeof accuracy === "number"
      ? Math.max(0.1, Math.min(1, 1 - accuracy / 50))
      : 0.65;

  return {
    eventId: event.id,
    eventName: "aplomo.telemetry.gps_position.created",
    eventVersion: "1.0.0",
    domain: "telemetry",
    producer,
    occurredAt: event.capturedAt,
    ingestedAt: event.receivedAt,
    companyId: event.companyId,
    subjectId: event.deviceId,
    payload: event,
    governance: {
      dataContractId: telemetryContractId,
      sensitivity: "confidential",
      tier: "bronze",
      aiUsagePolicy: "allowed_with_redaction",
      quality: [
        {
          dimension: "validity",
          status: "pass",
          score: 1,
          message: "Position shape is valid.",
          measuredAt,
        },
        {
          dimension: "accuracy",
          status:
            typeof accuracy === "number" && accuracy <= 10 ? "pass" : "warning",
          score: round(qualityScore, 2),
          message:
            typeof accuracy === "number"
              ? `Accuracy reported: ${accuracy} meters.`
              : "Accuracy not reported.",
          measuredAt,
        },
        {
          dimension: "lineage",
          status: "pass",
          score: 1,
          message: "Generated by governed Aplomo simulator.",
          measuredAt,
        },
      ],
      lineage: [
        {
          sourceSystem: "aplomo-local-simulator",
          sourceEntity: "AplomoDemoDevicePlan",
          sourceEventId: event.id,
          sourceRecordId: event.deviceId,
          transformName: "createGovernedTelemetryEnvelope",
          transformVersion: "1.0.0",
        },
      ],
      retentionDays: 730,
      tags: ["simulated", "gps", "industrial-yard", "ai-ready"],
    },
  };
};

export const seedAplomoGovernedIndustrialDemo = (
  store: AplomoInMemoryDeviceTelemetryStore,
  companyId = "company_demo_cooper_t_smith",
  siteId = "site_demo_altamira",
  profileId = "profile_demo_operator",
): AplomoDemoSimulationState => {
  const devices: AplomoRegisteredDevice[] = [];
  const governedEvents: AplomoGovernedTelemetryOutput[] = [];

  aplomoIndustrialDemoDevicePlans.forEach((plan, index) => {
    const deviceResult = store.registerDevice({
      companyId,
      siteId,
      name: plan.name,
      type: plan.type,
      capabilities: plan.capabilities,
      externalIdentifier: plan.key,
      metadata: plan.metadata,
      audit: {
        source: "simulation",
        actor: {
          companyId,
          profileId,
          role: "technician",
        },
      },
    });

    if (!deviceResult.ok) {
      throw new Error(deviceResult.error.message);
    }

    const device = deviceResult.data.device;
    devices.push(device);

    const sessionResult = store.startSession({
      companyId,
      deviceId: device.id,
      profileId,
      ipAddress: `10.10.0.${index + 10}`,
      userAgent: "AplomoLocalSimulator/1.0",
      appVersion: "simulator-1.0.0",
      platform: "local-simulation",
      metadata: {
        planKey: plan.key,
      },
    });

    if (!sessionResult.ok) {
      throw new Error(sessionResult.error.message);
    }

    const session = sessionResult.data.session;

    const connectionResult = store.openConnection({
      companyId,
      deviceId: device.id,
      sessionId: session.id,
      connectionType:
        plan.source === "drone"
          ? "drone_link"
          : plan.source === "rtk_rover" || plan.source === "rtk_base"
            ? "rtk_link"
            : plan.source === "gateway"
              ? "mqtt"
              : "browser",
      role: plan.role,
      protocol:
        plan.source === "gateway"
          ? "mqtt"
          : plan.source === "drone"
            ? "drone-link"
            : "https",
      remoteAddress: `simulated://${plan.key}`,
      metadata: {
        source: plan.source,
        governed: true,
      },
    });

    if (!connectionResult.ok) {
      throw new Error(connectionResult.error.message);
    }

    if (plan.role === "emitter" || plan.role === "both") {
      const telemetryResult = store.submitGpsTelemetry({
        companyId,
        deviceId: device.id,
        sessionId: session.id,
        source: plan.source,
        position: plan.basePosition,
        quality: createQuality(plan.accuracyMeters, plan.source),
        rawPayload: {
          simulated: true,
          planKey: plan.key,
          tick: 0,
        },
      });

      if (!telemetryResult.ok) {
        throw new Error(telemetryResult.error.message);
      }

      governedEvents.push({
        event: telemetryResult.data.event,
        envelope: createGovernedTelemetryEnvelope(
          telemetryResult.data.event,
          "aplomo-local-simulator",
        ),
      });
    }
  });

  return {
    companyId,
    siteId,
    profileId,
    devices,
    governedEvents,
    snapshot: store.snapshot(),
  };
};

export const advanceAplomoGovernedIndustrialDemo = (
  store: AplomoInMemoryDeviceTelemetryStore,
  tick: number,
  companyId = "company_demo_cooper_t_smith",
): AplomoDemoSimulationTickResult => {
  const governedEvents: AplomoGovernedTelemetryOutput[] = [];
  const snapshot = store.snapshot();

  aplomoIndustrialDemoDevicePlans.forEach((plan, index) => {
    if (plan.role !== "emitter" && plan.role !== "both") {
      return;
    }

    const device = snapshot.devices.find(
      (item) => item.externalIdentifier === plan.key && item.companyId === companyId,
    );

    if (!device) {
      return;
    }

    const session = snapshot.sessions
      .filter((item) => item.deviceId === device.id && item.status === "active")
      .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))[0];

    const position = createMovedPosition(
      plan.basePosition,
      tick,
      index,
      plan.movementScale,
    );

    const telemetryRequest = {
      companyId,
      deviceId: device.id,
      source: plan.source,
      position,
      quality: createQuality(plan.accuracyMeters, plan.source),
      rawPayload: {
        simulated: true,
        planKey: plan.key,
        tick,
      },
    };

    const requestWithSession = session
      ? {
          ...telemetryRequest,
          sessionId: session.id,
        }
      : telemetryRequest;

    const result = store.submitGpsTelemetry(requestWithSession);

    if (!result.ok) {
      return;
    }

    governedEvents.push({
      event: result.data.event,
      envelope: createGovernedTelemetryEnvelope(
        result.data.event,
        "aplomo-local-simulator",
      ),
    });
  });

  return {
    tick,
    generatedAt: nowIso(),
    governedEvents,
    snapshot: store.snapshot(),
  };
};

export const createAplomoGovernedIndustrialDemoStore = () => {
  const store = new AplomoInMemoryDeviceTelemetryStore();
  const initialState = seedAplomoGovernedIndustrialDemo(store);

  return {
    store,
    initialState,
    telemetryContract: createAplomoTelemetryDataContract(),
    latestPositionContract: createAplomoLatestPositionDataContract(),
  };
};
