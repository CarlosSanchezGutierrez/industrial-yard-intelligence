import type { AplomoDeviceType } from "./aplomoDevice.js";

export const aplomoDeviceComputeClasses = [
  "no_os_sensor",
  "embedded_firmware",
  "mobile_os",
  "desktop_os",
  "edge_gateway",
  "vendor_cloud",
  "browser_runtime",
  "unknown",
] as const;

export type AplomoDeviceComputeClass =
  (typeof aplomoDeviceComputeClasses)[number];

export const aplomoPhysicalLinks = [
  "none",
  "usb",
  "usb_serial",
  "rs232",
  "rs485",
  "bluetooth_classic",
  "bluetooth_ble",
  "wifi",
  "ethernet",
  "cellular",
  "radio_900mhz",
  "lora",
  "satellite",
  "manual_import",
  "vendor_cloud",
  "unknown",
] as const;

export type AplomoPhysicalLink = (typeof aplomoPhysicalLinks)[number];

export const aplomoProtocolFamilies = [
  "browser_geolocation",
  "mobile_native_location",
  "nmea_0183",
  "nmea_2000",
  "rtcm",
  "ntrip",
  "mavlink",
  "mqtt",
  "http_rest",
  "websocket",
  "tcp_socket",
  "udp_datagram",
  "bluetooth_gatt",
  "serial_text",
  "serial_binary",
  "vendor_sdk",
  "vendor_cloud_api",
  "csv_import",
  "geojson_import",
  "manual",
  "unknown",
] as const;

export type AplomoProtocolFamily = (typeof aplomoProtocolFamilies)[number];

export const aplomoIntegrationPatterns = [
  "direct_browser",
  "native_mobile_app",
  "desktop_agent",
  "edge_gateway",
  "iot_broker",
  "vendor_cloud_bridge",
  "file_import",
  "manual_entry",
  "simulation",
] as const;

export type AplomoIntegrationPattern =
  (typeof aplomoIntegrationPatterns)[number];

export const aplomoPayloadFormats = [
  "json",
  "geojson",
  "nmea_sentence",
  "rtcm_binary",
  "mavlink_packet",
  "mqtt_json",
  "csv",
  "binary",
  "text",
  "vendor_specific",
  "unknown",
] as const;

export type AplomoPayloadFormat = (typeof aplomoPayloadFormats)[number];

export const aplomoAdapterDirections = [
  "ingest_only",
  "command_only",
  "bidirectional",
] as const;

export type AplomoAdapterDirection = (typeof aplomoAdapterDirections)[number];

export type AplomoIndustrialAdapterCapability = {
  protocol: AplomoProtocolFamily;
  physicalLinks: AplomoPhysicalLink[];
  payloadFormats: AplomoPayloadFormat[];
  direction: AplomoAdapterDirection;
  supportsRealtime: boolean;
  supportsBatch: boolean;
  supportsCommands: boolean;
  supportsHighAccuracy: boolean;
  requiresGateway: boolean;
  requiresVendorSdk: boolean;
  requiresCredentials: boolean;
};

export type AplomoIndustrialDeviceIntegrationProfile = {
  id: string;
  deviceType: AplomoDeviceType;
  computeClass: AplomoDeviceComputeClass;
  recommendedPattern: AplomoIntegrationPattern;
  primaryAdapter: AplomoIndustrialAdapterCapability;
  fallbackAdapters: AplomoIndustrialAdapterCapability[];
  expectedData: {
    gpsPosition: boolean;
    altitude: boolean;
    heading: boolean;
    speed: boolean;
    accuracy: boolean;
    satelliteCount: boolean;
    hdopVdop: boolean;
    rtkStatus: boolean;
    rawPayload: boolean;
    mediaEvidence: boolean;
  };
  operationalNotes: string[];
  aiReadinessNotes: string[];
};

export type AplomoIndustrialRawIngestEnvelope = {
  adapterId: string;
  companyId: string;
  deviceId?: string;
  externalDeviceId?: string;
  protocol: AplomoProtocolFamily;
  physicalLink: AplomoPhysicalLink;
  payloadFormat: AplomoPayloadFormat;
  receivedAt: string;
  payload: string | ArrayBuffer | Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

const makeAdapter = (
  protocol: AplomoProtocolFamily,
  physicalLinks: AplomoPhysicalLink[],
  payloadFormats: AplomoPayloadFormat[],
  options: {
    direction?: AplomoAdapterDirection;
    supportsRealtime?: boolean;
    supportsBatch?: boolean;
    supportsCommands?: boolean;
    supportsHighAccuracy?: boolean;
    requiresGateway?: boolean;
    requiresVendorSdk?: boolean;
    requiresCredentials?: boolean;
  } = {},
): AplomoIndustrialAdapterCapability => {
  return {
    protocol,
    physicalLinks,
    payloadFormats,
    direction: options.direction ?? "ingest_only",
    supportsRealtime: options.supportsRealtime ?? true,
    supportsBatch: options.supportsBatch ?? false,
    supportsCommands: options.supportsCommands ?? false,
    supportsHighAccuracy: options.supportsHighAccuracy ?? false,
    requiresGateway: options.requiresGateway ?? false,
    requiresVendorSdk: options.requiresVendorSdk ?? false,
    requiresCredentials: options.requiresCredentials ?? false,
  };
};

export const createAplomoIndustrialIntegrationProfile = (
  deviceType: AplomoDeviceType,
): AplomoIndustrialDeviceIntegrationProfile => {
  if (deviceType === "phone" || deviceType === "tablet") {
    return {
      id: `aplomo.integration.${deviceType}.browser_mobile.v1`,
      deviceType,
      computeClass: "mobile_os",
      recommendedPattern: "native_mobile_app",
      primaryAdapter: makeAdapter(
        "mobile_native_location",
        ["cellular", "wifi"],
        ["json"],
        {
          direction: "bidirectional",
          supportsCommands: true,
          requiresCredentials: true,
        },
      ),
      fallbackAdapters: [
        makeAdapter("browser_geolocation", ["wifi", "cellular"], ["json"], {
          direction: "ingest_only",
        }),
      ],
      expectedData: {
        gpsPosition: true,
        altitude: true,
        heading: true,
        speed: true,
        accuracy: true,
        satelliteCount: false,
        hdopVdop: false,
        rtkStatus: false,
        rawPayload: true,
        mediaEvidence: true,
      },
      operationalNotes: [
        "Browser geolocation is fast for pilots but limited for device identity.",
        "Native mobile app is preferred for durable device registration.",
      ],
      aiReadinessNotes: [
        "Good for operator behavior analytics.",
        "Not enough for survey-grade precision without external GNSS.",
      ],
    };
  }

  if (
    deviceType === "gnss_receiver" ||
    deviceType === "rtk_rover" ||
    deviceType === "survey_pole"
  ) {
    return {
      id: `aplomo.integration.${deviceType}.gnss_rover.v1`,
      deviceType,
      computeClass: "embedded_firmware",
      recommendedPattern: "edge_gateway",
      primaryAdapter: makeAdapter(
        "nmea_0183",
        ["bluetooth_classic", "bluetooth_ble", "usb_serial", "rs232", "wifi"],
        ["nmea_sentence"],
        {
          supportsHighAccuracy: true,
          requiresGateway: true,
        },
      ),
      fallbackAdapters: [
        makeAdapter("tcp_socket", ["wifi", "ethernet"], ["nmea_sentence"], {
          supportsHighAccuracy: true,
          requiresGateway: true,
        }),
        makeAdapter("vendor_sdk", ["bluetooth_ble", "wifi"], ["vendor_specific"], {
          supportsCommands: true,
          supportsHighAccuracy: true,
          requiresGateway: true,
          requiresVendorSdk: true,
          requiresCredentials: true,
        }),
      ],
      expectedData: {
        gpsPosition: true,
        altitude: true,
        heading: true,
        speed: true,
        accuracy: true,
        satelliteCount: true,
        hdopVdop: true,
        rtkStatus: true,
        rawPayload: true,
        mediaEvidence: false,
      },
      operationalNotes: [
        "Usually needs a gateway, mobile app, or desktop agent to read serial/Bluetooth/network streams.",
        "RTK quality depends on correction stream availability.",
      ],
      aiReadinessNotes: [
        "Excellent for high-quality spatial datasets.",
        "Raw payloads should be retained for future model validation.",
      ],
    };
  }

  if (deviceType === "rtk_base" || deviceType === "antenna") {
    return {
      id: `aplomo.integration.${deviceType}.rtk_base.v1`,
      deviceType,
      computeClass: "embedded_firmware",
      recommendedPattern: "edge_gateway",
      primaryAdapter: makeAdapter(
        "ntrip",
        ["ethernet", "wifi", "cellular", "radio_900mhz"],
        ["rtcm_binary"],
        {
          direction: "bidirectional",
          supportsRealtime: true,
          supportsCommands: true,
          supportsHighAccuracy: true,
          requiresGateway: true,
          requiresCredentials: true,
        },
      ),
      fallbackAdapters: [
        makeAdapter("rtcm", ["radio_900mhz", "wifi", "ethernet", "cellular"], ["rtcm_binary"], {
          supportsRealtime: true,
          supportsHighAccuracy: true,
          requiresGateway: true,
        }),
      ],
      expectedData: {
        gpsPosition: true,
        altitude: true,
        heading: false,
        speed: false,
        accuracy: true,
        satelliteCount: true,
        hdopVdop: true,
        rtkStatus: true,
        rawPayload: true,
        mediaEvidence: false,
      },
      operationalNotes: [
        "Base stations are infrastructure, not normal moving assets.",
        "They can provide correction streams for rovers.",
      ],
      aiReadinessNotes: [
        "Critical for confidence scoring of high-precision captures.",
        "Correction availability should be logged for quality audits.",
      ],
    };
  }

  if (deviceType === "drone") {
    return {
      id: "aplomo.integration.drone.mavlink_vendor.v1",
      deviceType,
      computeClass: "embedded_firmware",
      recommendedPattern: "edge_gateway",
      primaryAdapter: makeAdapter(
        "mavlink",
        ["radio_900mhz", "wifi", "usb_serial"],
        ["mavlink_packet"],
        {
          direction: "bidirectional",
          supportsRealtime: true,
          supportsCommands: true,
          requiresGateway: true,
        },
      ),
      fallbackAdapters: [
        makeAdapter("vendor_sdk", ["wifi", "cellular", "vendor_cloud"], ["vendor_specific"], {
          direction: "bidirectional",
          supportsCommands: true,
          requiresVendorSdk: true,
          requiresCredentials: true,
        }),
        makeAdapter("vendor_cloud_api", ["vendor_cloud"], ["json"], {
          supportsBatch: true,
          requiresCredentials: true,
        }),
      ],
      expectedData: {
        gpsPosition: true,
        altitude: true,
        heading: true,
        speed: true,
        accuracy: true,
        satelliteCount: true,
        hdopVdop: false,
        rtkStatus: true,
        rawPayload: true,
        mediaEvidence: true,
      },
      operationalNotes: [
        "Drone integration depends heavily on autopilot/vendor ecosystem.",
        "Command/control must be treated separately from passive telemetry ingest.",
      ],
      aiReadinessNotes: [
        "Strong candidate for computer vision and volumetric estimation.",
        "Flight logs and imagery should be linked to telemetry lineage.",
      ],
    };
  }

  if (deviceType === "iot_gateway" || deviceType === "truck" || deviceType === "machine") {
    return {
      id: `aplomo.integration.${deviceType}.mqtt_gateway.v1`,
      deviceType,
      computeClass: deviceType === "iot_gateway" ? "edge_gateway" : "embedded_firmware",
      recommendedPattern: "iot_broker",
      primaryAdapter: makeAdapter(
        "mqtt",
        ["cellular", "wifi", "ethernet"],
        ["mqtt_json", "json"],
        {
          direction: "bidirectional",
          supportsRealtime: true,
          supportsBatch: true,
          supportsCommands: true,
          requiresCredentials: true,
        },
      ),
      fallbackAdapters: [
        makeAdapter("http_rest", ["cellular", "wifi", "ethernet"], ["json"], {
          supportsBatch: true,
          requiresCredentials: true,
        }),
      ],
      expectedData: {
        gpsPosition: true,
        altitude: false,
        heading: true,
        speed: true,
        accuracy: true,
        satelliteCount: false,
        hdopVdop: false,
        rtkStatus: false,
        rawPayload: true,
        mediaEvidence: false,
      },
      operationalNotes: [
        "Gateway pattern is preferred for fleets and equipment telemetry.",
        "MQTT topics must be tenant-scoped and device-scoped.",
      ],
      aiReadinessNotes: [
        "Good for operations optimization and anomaly detection.",
        "Needs strict event schemas to avoid data lake pollution.",
      ],
    };
  }

  return {
    id: `aplomo.integration.${deviceType}.generic.v1`,
    deviceType,
    computeClass: "unknown",
    recommendedPattern: "manual_entry",
    primaryAdapter: makeAdapter("manual", ["manual_import"], ["json"], {
      supportsRealtime: false,
    }),
    fallbackAdapters: [
      makeAdapter("csv_import", ["manual_import"], ["csv"], {
        supportsRealtime: false,
        supportsBatch: true,
      }),
    ],
    expectedData: {
      gpsPosition: false,
      altitude: false,
      heading: false,
      speed: false,
      accuracy: false,
      satelliteCount: false,
      hdopVdop: false,
      rtkStatus: false,
      rawPayload: true,
      mediaEvidence: false,
    },
    operationalNotes: [
      "Generic integration profile. Needs discovery before production use.",
    ],
    aiReadinessNotes: [
      "Not enough structure for advanced automation until classified.",
    ],
  };
};

export const createAplomoDefaultIndustrialIntegrationProfiles = () => {
  const deviceTypes: AplomoDeviceType[] = [
    "phone",
    "tablet",
    "drone",
    "gnss_receiver",
    "rtk_base",
    "rtk_rover",
    "iot_gateway",
    "truck",
    "machine",
    "antenna",
    "survey_pole",
  ];

  return deviceTypes.map((deviceType) =>
    createAplomoIndustrialIntegrationProfile(deviceType),
  );
};

export const requiresAplomoGateway = (
  profile: AplomoIndustrialDeviceIntegrationProfile,
): boolean => {
  return (
    profile.primaryAdapter.requiresGateway ||
    profile.fallbackAdapters.some((adapter) => adapter.requiresGateway)
  );
};

export const supportsAplomoHighAccuracy = (
  profile: AplomoIndustrialDeviceIntegrationProfile,
): boolean => {
  return (
    profile.primaryAdapter.supportsHighAccuracy ||
    profile.fallbackAdapters.some((adapter) => adapter.supportsHighAccuracy)
  );
};
