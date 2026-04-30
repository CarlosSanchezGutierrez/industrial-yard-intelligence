import type { AplomoInMemoryDeviceTelemetrySnapshot } from "./aplomoInMemoryDeviceTelemetryStore.js";
import type { AplomoGovernedTelemetryOutput } from "./aplomoGovernedDeviceSimulator.js";

export const aplomoOperationalAlertSeverities = [
  "info",
  "warning",
  "critical",
] as const;

export type AplomoOperationalAlertSeverity =
  (typeof aplomoOperationalAlertSeverities)[number];

export const aplomoOperationalAlertCategories = [
  "gps_quality",
  "rtk",
  "heartbeat",
  "connection",
  "data_quality",
  "lineage",
  "ai_readiness",
  "device_configuration",
] as const;

export type AplomoOperationalAlertCategory =
  (typeof aplomoOperationalAlertCategories)[number];

export type AplomoOperationalAlertEvidence = {
  label: string;
  value: string;
};

export type AplomoOperationalAlert = {
  id: string;
  severity: AplomoOperationalAlertSeverity;
  category: AplomoOperationalAlertCategory;
  title: string;
  message: string;
  detectedAt: string;
  source: "rule_engine";
  recommendedAction: string;
  dataQualityImpact: "none" | "low" | "medium" | "high";
  aiReadinessImpact: "none" | "low" | "medium" | "high";
  deviceId?: string;
  evidence: AplomoOperationalAlertEvidence[];
};

export type AplomoOperationalAlertEvaluationInput = {
  snapshot: AplomoInMemoryDeviceTelemetrySnapshot;
  governedEvents: AplomoGovernedTelemetryOutput[];
  now?: string;
  staleHeartbeatSeconds?: number;
};

export type AplomoOperationalAlertEvaluationResult = {
  generatedAt: string;
  alerts: AplomoOperationalAlert[];
  summary: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    dataQualityImpacted: number;
    aiReadinessImpacted: number;
  };
};

const createAlert = (
  index: number,
  input: {
    severity: AplomoOperationalAlertSeverity;
    category: AplomoOperationalAlertCategory;
    title: string;
    message: string;
    detectedAt: string;
    recommendedAction: string;
    dataQualityImpact: AplomoOperationalAlert["dataQualityImpact"];
    aiReadinessImpact: AplomoOperationalAlert["aiReadinessImpact"];
    deviceId?: string;
    evidence?: AplomoOperationalAlertEvidence[];
  },
): AplomoOperationalAlert => {
  const alert: AplomoOperationalAlert = {
    id: `alert_${String(index + 1).padStart(4, "0")}`,
    severity: input.severity,
    category: input.category,
    title: input.title,
    message: input.message,
    detectedAt: input.detectedAt,
    source: "rule_engine",
    recommendedAction: input.recommendedAction,
    dataQualityImpact: input.dataQualityImpact,
    aiReadinessImpact: input.aiReadinessImpact,
    evidence: input.evidence ?? [],
  };

  if (input.deviceId) {
    alert.deviceId = input.deviceId;
  }

  return alert;
};

const secondsSince = (isoDate: string, nowMs: number): number => {
  const dateMs = new Date(isoDate).getTime();

  if (!Number.isFinite(dateMs)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Math.round((nowMs - dateMs) / 1000));
};

const hasGpsCapability = (capabilities: string[]): boolean => {
  return capabilities.some(
    (capability) =>
      capability === "gps" ||
      capability === "high_accuracy_gps" ||
      capability === "rtk",
  );
};

const average = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const evaluateAplomoOperationalAlerts = (
  input: AplomoOperationalAlertEvaluationInput,
): AplomoOperationalAlertEvaluationResult => {
  const generatedAt = input.now ?? new Date().toISOString();
  const nowMs = new Date(generatedAt).getTime();
  const staleHeartbeatSeconds = input.staleHeartbeatSeconds ?? 120;
  const alertInputs: Parameters<typeof createAlert>[1][] = [];

  for (const device of input.snapshot.devices) {
    const latestPosition = input.snapshot.latestPositions.find(
      (position) => position.deviceId === device.id,
    );

    const activeSession = input.snapshot.sessions
      .filter((session) => session.deviceId === device.id && session.status === "active")
      .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))[0];

    const onlineConnections = input.snapshot.connections.filter(
      (connection) => connection.deviceId === device.id && connection.status === "online",
    );

    const degradedConnections = input.snapshot.connections.filter(
      (connection) =>
        connection.deviceId === device.id &&
        connection.status !== "online" &&
        connection.status !== "closed",
    );

    if (hasGpsCapability(device.capabilities) && !latestPosition) {
      alertInputs.push({
        severity: "warning",
        category: "gps_quality",
        title: "Dispositivo GPS sin posición viva",
        message: `${device.name} tiene capacidad GPS pero no tiene última posición registrada.`,
        detectedAt: generatedAt,
        deviceId: device.id,
        recommendedAction: "Revisar permisos GPS, sesión activa, conexión y adaptador de ingestión.",
        dataQualityImpact: "medium",
        aiReadinessImpact: "medium",
        evidence: [
          { label: "deviceType", value: device.type },
          { label: "capabilities", value: device.capabilities.join(", ") },
        ],
      });
    }

    const accuracy = latestPosition?.quality?.accuracyMeters;

    if (typeof accuracy === "number" && accuracy > 25) {
      alertInputs.push({
        severity: "critical",
        category: "gps_quality",
        title: "Precisión GPS crítica",
        message: `${device.name} reporta precisión de ${accuracy} m.`,
        detectedAt: generatedAt,
        deviceId: device.id,
        recommendedAction: "Cambiar a GNSS/RTK, revisar cielo abierto, antena, permisos y calidad de señal.",
        dataQualityImpact: "high",
        aiReadinessImpact: "high",
        evidence: [
          { label: "accuracyMeters", value: String(accuracy) },
          { label: "source", value: latestPosition?.source ?? "unknown" },
        ],
      });
    } else if (typeof accuracy === "number" && accuracy > 10) {
      alertInputs.push({
        severity: "warning",
        category: "gps_quality",
        title: "Precisión GPS baja",
        message: `${device.name} reporta precisión de ${accuracy} m.`,
        detectedAt: generatedAt,
        deviceId: device.id,
        recommendedAction: "Confirmar si esta precisión es suficiente para la operación o usar fuente de mayor precisión.",
        dataQualityImpact: "medium",
        aiReadinessImpact: "medium",
        evidence: [
          { label: "accuracyMeters", value: String(accuracy) },
          { label: "source", value: latestPosition?.source ?? "unknown" },
        ],
      });
    }

    if (
      (device.type === "rtk_rover" || device.type === "rtk_base") &&
      latestPosition &&
      latestPosition.quality?.fixType !== "rtk_fixed"
    ) {
      alertInputs.push({
        severity: "critical",
        category: "rtk",
        title: "RTK no está fijo",
        message: `${device.name} debería operar con RTK fijo, pero reporta ${latestPosition.quality?.fixType ?? "unknown"}.`,
        detectedAt: generatedAt,
        deviceId: device.id,
        recommendedAction: "Revisar correcciones NTRIP/RTCM, base RTK, radio, credenciales y edad de corrección.",
        dataQualityImpact: "high",
        aiReadinessImpact: "high",
        evidence: [
          { label: "fixType", value: latestPosition.quality?.fixType ?? "unknown" },
          { label: "rtkStatus", value: latestPosition.quality?.rtkStatus ?? "unknown" },
        ],
      });
    }

    if (device.type === "drone" && latestPosition && latestPosition.position.altitudeMeters === undefined) {
      alertInputs.push({
        severity: "warning",
        category: "device_configuration",
        title: "Dron sin altitud",
        message: `${device.name} no reporta altitud en su última posición.`,
        detectedAt: generatedAt,
        deviceId: device.id,
        recommendedAction: "Revisar adaptador MAVLink/SDK y normalización de altitud.",
        dataQualityImpact: "medium",
        aiReadinessImpact: "medium",
        evidence: [
          { label: "deviceType", value: device.type },
          { label: "source", value: latestPosition.source },
        ],
      });
    }

    if (!activeSession) {
      alertInputs.push({
        severity: "info",
        category: "heartbeat",
        title: "Sin sesión activa",
        message: `${device.name} no tiene sesión activa.`,
        detectedAt: generatedAt,
        deviceId: device.id,
        recommendedAction: "Confirmar si el dispositivo debería estar operativo en este momento.",
        dataQualityImpact: "low",
        aiReadinessImpact: "low",
        evidence: [{ label: "deviceStatus", value: device.status }],
      });
    } else {
      const staleSeconds = secondsSince(activeSession.lastSeenAt, nowMs);

      if (staleSeconds > staleHeartbeatSeconds) {
        alertInputs.push({
          severity: staleSeconds > staleHeartbeatSeconds * 3 ? "critical" : "warning",
          category: "heartbeat",
          title: "Heartbeat vencido",
          message: `${device.name} no reporta heartbeat reciente. Último visto hace ${staleSeconds} segundos.`,
          detectedAt: generatedAt,
          deviceId: device.id,
          recommendedAction: "Revisar conectividad, batería, app/gateway y permisos de red.",
          dataQualityImpact: "medium",
          aiReadinessImpact: "medium",
          evidence: [
            { label: "lastSeenAt", value: activeSession.lastSeenAt },
            { label: "staleSeconds", value: String(staleSeconds) },
          ],
        });
      }
    }

    if (onlineConnections.length === 0) {
      alertInputs.push({
        severity: "warning",
        category: "connection",
        title: "Sin conexiones online",
        message: `${device.name} no tiene conexiones online.`,
        detectedAt: generatedAt,
        deviceId: device.id,
        recommendedAction: "Revisar adaptador, gateway, broker, red o sesión del dispositivo.",
        dataQualityImpact: "medium",
        aiReadinessImpact: "low",
        evidence: [{ label: "connections", value: String(onlineConnections.length) }],
      });
    }

    for (const connection of degradedConnections) {
      alertInputs.push({
        severity: "warning",
        category: "connection",
        title: "Conexión degradada",
        message: `${device.name} tiene conexión ${connection.connectionType} en estado ${connection.status}.`,
        detectedAt: generatedAt,
        deviceId: device.id,
        recommendedAction: "Revisar protocolo, link físico, gateway y reconexión.",
        dataQualityImpact: "medium",
        aiReadinessImpact: "low",
        evidence: [
          { label: "connectionType", value: connection.connectionType },
          { label: "status", value: connection.status },
          { label: "protocol", value: connection.protocol ?? "unknown" },
        ],
      });
    }
  }

  for (const governedEvent of input.governedEvents) {
    const qualityScores = governedEvent.envelope.governance.quality.map(
      (quality) => quality.score,
    );

    const qualityAverage = average(qualityScores);
    const failures = governedEvent.envelope.governance.quality.filter(
      (quality) => quality.status === "fail",
    );

    if (governedEvent.envelope.governance.lineage.length === 0) {
      alertInputs.push({
        severity: "critical",
        category: "lineage",
        title: "Evento sin lineage",
        message: `El evento ${governedEvent.event.id} no tiene lineage.`,
        detectedAt: generatedAt,
        deviceId: governedEvent.event.deviceId,
        recommendedAction: "Bloquear uso analítico/IA hasta registrar origen y transformación.",
        dataQualityImpact: "high",
        aiReadinessImpact: "high",
        evidence: [{ label: "eventId", value: governedEvent.event.id }],
      });
    }

    if (failures.length > 0) {
      alertInputs.push({
        severity: "critical",
        category: "data_quality",
        title: "Evento con falla de calidad",
        message: `El evento ${governedEvent.event.id} tiene ${failures.length} fallas de calidad.`,
        detectedAt: generatedAt,
        deviceId: governedEvent.event.deviceId,
        recommendedAction: "Enviar a cuarentena de datos y revisar reglas de calidad.",
        dataQualityImpact: "high",
        aiReadinessImpact: "high",
        evidence: failures.map((failure) => ({
          label: failure.dimension,
          value: failure.message ?? failure.status,
        })),
      });
    } else if (qualityAverage > 0 && qualityAverage < 0.75) {
      alertInputs.push({
        severity: "warning",
        category: "data_quality",
        title: "Calidad de dato baja",
        message: `El evento ${governedEvent.event.id} tiene score promedio ${qualityAverage.toFixed(2)}.`,
        detectedAt: generatedAt,
        deviceId: governedEvent.event.deviceId,
        recommendedAction: "Marcar como dato de baja confianza para dashboards, modelos y agentes.",
        dataQualityImpact: "medium",
        aiReadinessImpact: "medium",
        evidence: [
          { label: "qualityAverage", value: qualityAverage.toFixed(2) },
          { label: "eventId", value: governedEvent.event.id },
        ],
      });
    }

    if (
      governedEvent.envelope.governance.aiUsagePolicy === "blocked" ||
      governedEvent.envelope.governance.aiUsagePolicy === "human_review_required"
    ) {
      alertInputs.push({
        severity: "warning",
        category: "ai_readiness",
        title: "Evento no listo para IA automática",
        message: `El evento ${governedEvent.event.id} tiene política ${governedEvent.envelope.governance.aiUsagePolicy}.`,
        detectedAt: generatedAt,
        deviceId: governedEvent.event.deviceId,
        recommendedAction: "Excluir de agentes automáticos o pasar por revisión humana/redacción.",
        dataQualityImpact: "low",
        aiReadinessImpact: "high",
        evidence: [
          {
            label: "aiUsagePolicy",
            value: governedEvent.envelope.governance.aiUsagePolicy,
          },
        ],
      });
    }
  }

  const alerts = alertInputs.map((alert, index) => createAlert(index, alert));

  const summary = {
    total: alerts.length,
    critical: alerts.filter((alert) => alert.severity === "critical").length,
    warning: alerts.filter((alert) => alert.severity === "warning").length,
    info: alerts.filter((alert) => alert.severity === "info").length,
    dataQualityImpacted: alerts.filter(
      (alert) => alert.dataQualityImpact !== "none",
    ).length,
    aiReadinessImpacted: alerts.filter(
      (alert) => alert.aiReadinessImpact !== "none",
    ).length,
  };

  return {
    generatedAt,
    alerts,
    summary,
  };
};
