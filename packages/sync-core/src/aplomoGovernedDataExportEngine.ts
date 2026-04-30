import type { AplomoInMemoryDeviceTelemetrySnapshot } from "./aplomoInMemoryDeviceTelemetryStore.js";
import type { AplomoGovernedTelemetryOutput } from "./aplomoGovernedDeviceSimulator.js";
import type { AplomoOperationalAlert } from "./aplomoOperationalAlertEngine.js";
import type { AplomoDeviceOperationalScore } from "./aplomoOperationalScoreEngine.js";

export const aplomoGovernedExportFormats = [
  "csv",
  "json",
  "ndjson",
  "geojson",
] as const;

export type AplomoGovernedExportFormat =
  (typeof aplomoGovernedExportFormats)[number];

export const aplomoGovernedExportKinds = [
  "devices",
  "latest_positions",
  "telemetry_events",
  "governed_events",
  "alerts",
  "scores",
  "full_snapshot",
] as const;

export type AplomoGovernedExportKind =
  (typeof aplomoGovernedExportKinds)[number];

export type AplomoGovernedDataExportInput = {
  snapshot: AplomoInMemoryDeviceTelemetrySnapshot;
  governedEvents: AplomoGovernedTelemetryOutput[];
  alerts: AplomoOperationalAlert[];
  scores: AplomoDeviceOperationalScore[];
  kind: AplomoGovernedExportKind;
  format: AplomoGovernedExportFormat;
  generatedAt?: string;
  includeLineage: boolean;
  includeQualityMetrics: boolean;
  includeAiPolicy: boolean;
};

export type AplomoGovernedDataExportResult = {
  fileName: string;
  mimeType: string;
  content: string;
  recordCount: number;
  metadata: {
    kind: AplomoGovernedExportKind;
    format: AplomoGovernedExportFormat;
    generatedAt: string;
    dataContractRequired: boolean;
    lineageIncluded: boolean;
    qualityMetricsIncluded: boolean;
    aiPolicyIncluded: boolean;
    intendedTargets: string[];
  };
};

type ExportRow = Record<string, string | number | boolean | null>;

const safeCell = (value: unknown): string | number | boolean | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return JSON.stringify(value);
};

const toIsoFileStamp = (value: string): string => {
  return value.replace(/[:.]/g, "-");
};

const mimeTypeForFormat = (format: AplomoGovernedExportFormat): string => {
  if (format === "csv") {
    return "text/csv;charset=utf-8";
  }

  if (format === "ndjson") {
    return "application/x-ndjson;charset=utf-8";
  }

  if (format === "geojson") {
    return "application/geo+json;charset=utf-8";
  }

  return "application/json;charset=utf-8";
};

const extensionForFormat = (format: AplomoGovernedExportFormat): string => {
  if (format === "geojson") {
    return "geojson";
  }

  return format;
};

const csvEscape = (value: string | number | boolean | null): string => {
  if (value === null) {
    return "";
  }

  const text = String(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

const rowsToCsv = (rows: ExportRow[]): string => {
  if (rows.length === 0) {
    return "";
  }

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>()),
  );

  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) =>
      headers.map((header) => csvEscape(row[header] ?? null)).join(","),
    ),
  ];

  return `${lines.join("\r\n")}\r\n`;
};

const rowsToNdjson = (rows: ExportRow[]): string => {
  return `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
};

const deviceRows = (
  snapshot: AplomoInMemoryDeviceTelemetrySnapshot,
): ExportRow[] => {
  return snapshot.devices.map((device) => ({
    id: device.id,
    companyId: device.companyId,
    siteId: device.siteId ?? null,
    name: device.name,
    type: device.type,
    status: device.status,
    capabilities: device.capabilities.join("|"),
    externalIdentifier: device.externalIdentifier ?? null,
    serialNumber: device.serialNumber ?? null,
    createdAt: device.createdAt,
    updatedAt: device.updatedAt,
  }));
};

const latestPositionRows = (
  snapshot: AplomoInMemoryDeviceTelemetrySnapshot,
): ExportRow[] => {
  return snapshot.latestPositions.map((position) => {
    const device = snapshot.devices.find((item) => item.id === position.deviceId);

    return {
      companyId: position.companyId,
      deviceId: position.deviceId,
      deviceName: device?.name ?? null,
      deviceType: device?.type ?? null,
      source: position.source,
      status: position.status,
      latitude: position.position.latitude,
      longitude: position.position.longitude,
      altitudeMeters: position.position.altitudeMeters ?? null,
      headingDegrees: position.position.headingDegrees ?? null,
      speedMetersPerSecond: position.position.speedMetersPerSecond ?? null,
      accuracyMeters: position.quality?.accuracyMeters ?? null,
      fixType: position.quality?.fixType ?? null,
      rtkStatus: position.quality?.rtkStatus ?? null,
      satelliteCount: position.quality?.satelliteCount ?? null,
      hdop: position.quality?.hdop ?? null,
      vdop: position.quality?.vdop ?? null,
      updatedAt: position.updatedAt,
    };
  });
};

const telemetryRows = (
  snapshot: AplomoInMemoryDeviceTelemetrySnapshot,
): ExportRow[] => {
  return snapshot.telemetryEvents.map((event) => {
    const device = snapshot.devices.find((item) => item.id === event.deviceId);

    return {
      id: event.id,
      companyId: event.companyId,
      deviceId: event.deviceId,
      deviceName: device?.name ?? null,
      deviceType: device?.type ?? null,
      sessionId: event.sessionId ?? null,
      eventType: event.eventType,
      source: event.source,
      latitude: event.position?.latitude ?? null,
      longitude: event.position?.longitude ?? null,
      altitudeMeters: event.position?.altitudeMeters ?? null,
      accuracyMeters: event.quality?.accuracyMeters ?? null,
      fixType: event.quality?.fixType ?? null,
      capturedAt: event.capturedAt,
      receivedAt: event.receivedAt,
      rawPayload: safeCell(event.rawPayload),
    };
  });
};

const governedEventRows = (
  snapshot: AplomoInMemoryDeviceTelemetrySnapshot,
  governedEvents: AplomoGovernedTelemetryOutput[],
  options: {
    includeLineage: boolean;
    includeQualityMetrics: boolean;
    includeAiPolicy: boolean;
  },
): ExportRow[] => {
  return governedEvents.map((item) => {
    const device = snapshot.devices.find((candidate) => candidate.id === item.event.deviceId);

    const qualityAverage =
      item.envelope.governance.quality.length > 0
        ? item.envelope.governance.quality.reduce(
            (sum, quality) => sum + quality.score,
            0,
          ) / item.envelope.governance.quality.length
        : 0;

    const row: ExportRow = {
      eventId: item.event.id,
      eventName: item.envelope.eventName,
      eventVersion: item.envelope.eventVersion,
      domain: item.envelope.domain,
      companyId: item.event.companyId,
      deviceId: item.event.deviceId,
      deviceName: device?.name ?? null,
      deviceType: device?.type ?? null,
      source: item.event.source,
      latitude: item.event.position?.latitude ?? null,
      longitude: item.event.position?.longitude ?? null,
      accuracyMeters: item.event.quality?.accuracyMeters ?? null,
      capturedAt: item.event.capturedAt,
      receivedAt: item.event.receivedAt,
      dataContractId: item.envelope.governance.dataContractId,
      sensitivity: item.envelope.governance.sensitivity,
      tier: item.envelope.governance.tier,
      retentionDays: item.envelope.governance.retentionDays,
    };

    if (options.includeAiPolicy) {
      row.aiUsagePolicy = item.envelope.governance.aiUsagePolicy;
    }

    if (options.includeQualityMetrics) {
      row.qualityAverage = Math.round(qualityAverage * 100) / 100;
      row.qualityMetrics = safeCell(item.envelope.governance.quality);
    }

    if (options.includeLineage) {
      row.lineage = safeCell(item.envelope.governance.lineage);
      row.lineageSource =
        item.envelope.governance.lineage[0]?.sourceSystem ?? null;
    }

    return row;
  });
};

const alertRows = (
  snapshot: AplomoInMemoryDeviceTelemetrySnapshot,
  alerts: AplomoOperationalAlert[],
): ExportRow[] => {
  return alerts.map((alert) => {
    const device = snapshot.devices.find((item) => item.id === alert.deviceId);

    return {
      id: alert.id,
      severity: alert.severity,
      category: alert.category,
      deviceId: alert.deviceId ?? null,
      deviceName: device?.name ?? null,
      title: alert.title,
      message: alert.message,
      detectedAt: alert.detectedAt,
      recommendedAction: alert.recommendedAction,
      dataQualityImpact: alert.dataQualityImpact,
      aiReadinessImpact: alert.aiReadinessImpact,
      evidence: safeCell(alert.evidence),
    };
  });
};

const scoreRows = (scores: AplomoDeviceOperationalScore[]): ExportRow[] => {
  return scores.map((score) => ({
    deviceId: score.deviceId,
    deviceName: score.deviceName,
    deviceType: score.deviceType,
    overallScore: score.overallScore,
    riskLevel: score.riskLevel,
    connectivityScore: score.breakdown.connectivity,
    gpsPrecisionScore: score.breakdown.gpsPrecision,
    dataQualityScore: score.breakdown.dataQuality,
    aiReadinessScore: score.breakdown.aiReadiness,
    alertRiskScore: score.breakdown.alertRisk,
    activeSession: score.activeSession,
    onlineConnections: score.onlineConnections,
    alertCount: score.alertCount,
    criticalAlerts: score.criticalAlerts,
    warningAlerts: score.warningAlerts,
    gpsEventCount: score.gpsEventCount,
    aiReadyEventCount: score.aiReadyEventCount,
    latestAccuracyMeters: score.latestAccuracyMeters ?? null,
    latestPositionUpdatedAt: score.latestPositionUpdatedAt ?? null,
    recommendedAction: score.recommendedAction,
  }));
};

const rowsForKind = (input: AplomoGovernedDataExportInput): ExportRow[] => {
  if (input.kind === "devices") {
    return deviceRows(input.snapshot);
  }

  if (input.kind === "latest_positions") {
    return latestPositionRows(input.snapshot);
  }

  if (input.kind === "telemetry_events") {
    return telemetryRows(input.snapshot);
  }

  if (input.kind === "governed_events") {
    return governedEventRows(input.snapshot, input.governedEvents, {
      includeLineage: input.includeLineage,
      includeQualityMetrics: input.includeQualityMetrics,
      includeAiPolicy: input.includeAiPolicy,
    });
  }

  if (input.kind === "alerts") {
    return alertRows(input.snapshot, input.alerts);
  }

  if (input.kind === "scores") {
    return scoreRows(input.scores);
  }

  return [
    ...deviceRows(input.snapshot),
    ...latestPositionRows(input.snapshot),
    ...telemetryRows(input.snapshot),
    ...governedEventRows(input.snapshot, input.governedEvents, {
      includeLineage: input.includeLineage,
      includeQualityMetrics: input.includeQualityMetrics,
      includeAiPolicy: input.includeAiPolicy,
    }),
    ...alertRows(input.snapshot, input.alerts),
    ...scoreRows(input.scores),
  ];
};

const toGeoJson = (
  snapshot: AplomoInMemoryDeviceTelemetrySnapshot,
  rows: ExportRow[],
): string => {
  const features = snapshot.latestPositions.map((position) => {
    const device = snapshot.devices.find((item) => item.id === position.deviceId);

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          position.position.longitude,
          position.position.latitude,
          position.position.altitudeMeters ?? 0,
        ],
      },
      properties: {
        companyId: position.companyId,
        deviceId: position.deviceId,
        deviceName: device?.name ?? null,
        deviceType: device?.type ?? null,
        source: position.source,
        status: position.status,
        accuracyMeters: position.quality?.accuracyMeters ?? null,
        fixType: position.quality?.fixType ?? null,
        updatedAt: position.updatedAt,
      },
    };
  });

  return JSON.stringify(
    {
      type: "FeatureCollection",
      metadata: {
        source: "Aplomo Systems",
        recordCount: rows.length,
      },
      features,
    },
    null,
    2,
  );
};

export const createAplomoGovernedDataExport = (
  input: AplomoGovernedDataExportInput,
): AplomoGovernedDataExportResult => {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const rows = rowsForKind(input);

  const content =
    input.format === "csv"
      ? rowsToCsv(rows)
      : input.format === "ndjson"
        ? rowsToNdjson(rows)
        : input.format === "geojson"
          ? toGeoJson(input.snapshot, rows)
          : JSON.stringify(
              {
                metadata: {
                  source: "Aplomo Systems",
                  kind: input.kind,
                  generatedAt,
                  recordCount: rows.length,
                  dataContractRequired: true,
                  lineageIncluded: input.includeLineage,
                  qualityMetricsIncluded: input.includeQualityMetrics,
                  aiPolicyIncluded: input.includeAiPolicy,
                },
                records: rows,
              },
              null,
              2,
            );

  return {
    fileName: `aplomo_${input.kind}_${toIsoFileStamp(generatedAt)}.${extensionForFormat(
      input.format,
    )}`,
    mimeType: mimeTypeForFormat(input.format),
    content,
    recordCount: rows.length,
    metadata: {
      kind: input.kind,
      format: input.format,
      generatedAt,
      dataContractRequired: true,
      lineageIncluded: input.includeLineage,
      qualityMetricsIncluded: input.includeQualityMetrics,
      aiPolicyIncluded: input.includeAiPolicy,
      intendedTargets:
        input.format === "csv"
          ? ["Excel", "Power BI", "analistas", "BI"]
          : input.format === "geojson"
            ? ["GIS", "mapas", "geospatial analytics"]
            : input.format === "ndjson"
              ? ["data pipelines", "Snowflake", "Databricks", "logs", "LLM tools"]
              : ["APIs", "Python", "notebooks", "LLM tools"],
    },
  };
};
