import type { AplomoInMemoryDeviceTelemetrySnapshot } from "./aplomoInMemoryDeviceTelemetryStore.js";
import type { AplomoGovernedTelemetryOutput } from "./aplomoGovernedDeviceSimulator.js";
import type { AplomoOperationalAlert } from "./aplomoOperationalAlertEngine.js";

export const aplomoOperationalRiskLevels = [
  "excellent",
  "healthy",
  "watch",
  "degraded",
  "critical",
] as const;

export type AplomoOperationalRiskLevel =
  (typeof aplomoOperationalRiskLevels)[number];

export type AplomoOperationalScoreBreakdown = {
  connectivity: number;
  gpsPrecision: number;
  dataQuality: number;
  aiReadiness: number;
  alertRisk: number;
};

export type AplomoDeviceOperationalScore = {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  overallScore: number;
  riskLevel: AplomoOperationalRiskLevel;
  breakdown: AplomoOperationalScoreBreakdown;
  activeSession: boolean;
  onlineConnections: number;
  alertCount: number;
  criticalAlerts: number;
  warningAlerts: number;
  gpsEventCount: number;
  aiReadyEventCount: number;
  recommendedAction: string;
  latestAccuracyMeters?: number;
  latestPositionUpdatedAt?: string;
};

export type AplomoSiteOperationalScore = {
  companyId: string;
  siteId?: string;
  generatedAt: string;
  overallScore: number;
  riskLevel: AplomoOperationalRiskLevel;
  deviceCount: number;
  healthyDevices: number;
  degradedDevices: number;
  criticalDevices: number;
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  averageGpsPrecisionScore: number;
  averageDataQualityScore: number;
  averageAiReadinessScore: number;
};

export type AplomoOperationalScoreEvaluationInput = {
  snapshot: AplomoInMemoryDeviceTelemetrySnapshot;
  governedEvents: AplomoGovernedTelemetryOutput[];
  alerts: AplomoOperationalAlert[];
  companyId: string;
  siteId?: string;
  now?: string;
};

export type AplomoOperationalScoreEvaluationResult = {
  generatedAt: string;
  deviceScores: AplomoDeviceOperationalScore[];
  siteScore: AplomoSiteOperationalScore;
};

const clampScore = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
};

const average = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const riskLevelFromScore = (score: number): AplomoOperationalRiskLevel => {
  if (score >= 92) {
    return "excellent";
  }

  if (score >= 80) {
    return "healthy";
  }

  if (score >= 65) {
    return "watch";
  }

  if (score >= 45) {
    return "degraded";
  }

  return "critical";
};

const scoreGpsPrecision = (accuracyMeters: number | undefined): number => {
  if (typeof accuracyMeters !== "number") {
    return 35;
  }

  if (accuracyMeters <= 0.05) {
    return 100;
  }

  if (accuracyMeters <= 0.5) {
    return 96;
  }

  if (accuracyMeters <= 1) {
    return 92;
  }

  if (accuracyMeters <= 3) {
    return 82;
  }

  if (accuracyMeters <= 10) {
    return 68;
  }

  if (accuracyMeters <= 25) {
    return 42;
  }

  return 15;
};

const scoreConnectivity = (activeSession: boolean, onlineConnections: number): number => {
  if (activeSession && onlineConnections >= 1) {
    return 100;
  }

  if (activeSession) {
    return 70;
  }

  if (onlineConnections >= 1) {
    return 62;
  }

  return 20;
};

const scoreAlertRisk = (alerts: AplomoOperationalAlert[]): number => {
  const penalty = alerts.reduce((sum, alert) => {
    if (alert.severity === "critical") {
      return sum + 28;
    }

    if (alert.severity === "warning") {
      return sum + 12;
    }

    return sum + 4;
  }, 0);

  return clampScore(100 - penalty);
};

const scoreDataQuality = (events: AplomoGovernedTelemetryOutput[]): number => {
  const values = events.flatMap((item) =>
    item.envelope.governance.quality.map((quality) => quality.score * 100),
  );

  if (values.length === 0) {
    return 40;
  }

  return clampScore(average(values));
};

const scoreAiReadiness = (events: AplomoGovernedTelemetryOutput[]): number => {
  if (events.length === 0) {
    return 40;
  }

  const allowed = events.filter(
    (item) =>
      item.envelope.governance.aiUsagePolicy === "allowed" ||
      item.envelope.governance.aiUsagePolicy === "allowed_with_redaction",
  ).length;

  const lineageReady = events.filter(
    (item) => item.envelope.governance.lineage.length > 0,
  ).length;

  const contractReady = events.filter(
    (item) => item.envelope.governance.dataContractId.trim().length > 0,
  ).length;

  const allowedScore = (allowed / events.length) * 100;
  const lineageScore = (lineageReady / events.length) * 100;
  const contractScore = (contractReady / events.length) * 100;

  return clampScore(allowedScore * 0.45 + lineageScore * 0.35 + contractScore * 0.2);
};

const recommendedActionForScore = (
  score: number,
  breakdown: AplomoOperationalScoreBreakdown,
  criticalAlerts: number,
): string => {
  if (criticalAlerts > 0) {
    return "Atender alertas críticas antes de usar este dato para decisiones operativas o IA.";
  }

  if (breakdown.gpsPrecision < 60) {
    return "Mejorar fuente GPS, revisar antena/cielo abierto o usar GNSS/RTK.";
  }

  if (breakdown.connectivity < 70) {
    return "Revisar sesión, gateway, red, broker o adaptador del dispositivo.";
  }

  if (breakdown.dataQuality < 75) {
    return "Revisar reglas de calidad, normalización y lineage del dato.";
  }

  if (breakdown.aiReadiness < 75) {
    return "Completar data contracts, lineage y política de redacción para IA.";
  }

  if (score >= 90) {
    return "Dispositivo apto para operación, analítica y automatización supervisada.";
  }

  return "Monitorear dispositivo y revisar advertencias menores.";
};

export const calculateAplomoOperationalScores = (
  input: AplomoOperationalScoreEvaluationInput,
): AplomoOperationalScoreEvaluationResult => {
  const generatedAt = input.now ?? new Date().toISOString();

  const deviceScores = input.snapshot.devices
    .filter((device) => device.companyId === input.companyId)
    .filter((device) => !input.siteId || device.siteId === input.siteId)
    .map((device) => {
      const latestPosition = input.snapshot.latestPositions.find(
        (position) => position.deviceId === device.id,
      );

      const activeSession = input.snapshot.sessions.some(
        (session) => session.deviceId === device.id && session.status === "active",
      );

      const onlineConnections = input.snapshot.connections.filter(
        (connection) => connection.deviceId === device.id && connection.status === "online",
      ).length;

      const deviceEvents = input.governedEvents.filter(
        (event) => event.event.deviceId === device.id,
      );

      const deviceAlerts = input.alerts.filter((alert) => alert.deviceId === device.id);
      const criticalAlerts = deviceAlerts.filter(
        (alert) => alert.severity === "critical",
      ).length;
      const warningAlerts = deviceAlerts.filter(
        (alert) => alert.severity === "warning",
      ).length;

      const aiReadyEventCount = deviceEvents.filter(
        (item) =>
          item.envelope.governance.aiUsagePolicy === "allowed" ||
          item.envelope.governance.aiUsagePolicy === "allowed_with_redaction",
      ).length;

      const latestAccuracyMeters = latestPosition?.quality?.accuracyMeters;

      const breakdown: AplomoOperationalScoreBreakdown = {
        connectivity: scoreConnectivity(activeSession, onlineConnections),
        gpsPrecision: scoreGpsPrecision(latestAccuracyMeters),
        dataQuality: scoreDataQuality(deviceEvents),
        aiReadiness: scoreAiReadiness(deviceEvents),
        alertRisk: scoreAlertRisk(deviceAlerts),
      };

      const overallScore = clampScore(
        breakdown.connectivity * 0.22 +
          breakdown.gpsPrecision * 0.24 +
          breakdown.dataQuality * 0.2 +
          breakdown.aiReadiness * 0.16 +
          breakdown.alertRisk * 0.18,
      );

      const score: AplomoDeviceOperationalScore = {
        deviceId: device.id,
        deviceName: device.name,
        deviceType: device.type,
        overallScore,
        riskLevel: riskLevelFromScore(overallScore),
        breakdown,
        activeSession,
        onlineConnections,
        alertCount: deviceAlerts.length,
        criticalAlerts,
        warningAlerts,
        gpsEventCount: deviceEvents.length,
        aiReadyEventCount,
        recommendedAction: recommendedActionForScore(
          overallScore,
          breakdown,
          criticalAlerts,
        ),
      };

      if (typeof latestAccuracyMeters === "number") {
        score.latestAccuracyMeters = latestAccuracyMeters;
      }

      if (latestPosition?.updatedAt) {
        score.latestPositionUpdatedAt = latestPosition.updatedAt;
      }

      return score;
    })
    .sort((a, b) => a.overallScore - b.overallScore);

  const overallScore = clampScore(
    average(deviceScores.map((device) => device.overallScore)),
  );

  const siteScore: AplomoSiteOperationalScore = {
    companyId: input.companyId,
    generatedAt,
    overallScore,
    riskLevel: riskLevelFromScore(overallScore),
    deviceCount: deviceScores.length,
    healthyDevices: deviceScores.filter(
      (device) => device.riskLevel === "excellent" || device.riskLevel === "healthy",
    ).length,
    degradedDevices: deviceScores.filter(
      (device) => device.riskLevel === "watch" || device.riskLevel === "degraded",
    ).length,
    criticalDevices: deviceScores.filter(
      (device) => device.riskLevel === "critical",
    ).length,
    totalAlerts: input.alerts.length,
    criticalAlerts: input.alerts.filter((alert) => alert.severity === "critical").length,
    warningAlerts: input.alerts.filter((alert) => alert.severity === "warning").length,
    averageGpsPrecisionScore: clampScore(
      average(deviceScores.map((device) => device.breakdown.gpsPrecision)),
    ),
    averageDataQualityScore: clampScore(
      average(deviceScores.map((device) => device.breakdown.dataQuality)),
    ),
    averageAiReadinessScore: clampScore(
      average(deviceScores.map((device) => device.breakdown.aiReadiness)),
    ),
  };

  if (input.siteId) {
    siteScore.siteId = input.siteId;
  }

  return {
    generatedAt,
    deviceScores,
    siteScore,
  };
};
