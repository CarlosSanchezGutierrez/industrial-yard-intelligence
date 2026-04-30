import { useMemo, type CSSProperties } from "react";

import { useAplomoOperationsRuntime } from "./AplomoOperationsRuntime.js";

const styles = {
  panel: {
    border: "1px solid rgba(34, 197, 94, 0.24)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(20, 83, 45, 0.52))",
    color: "#e5e7eb",
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.32)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: "0 0 6px",
    color: "#86efac",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 950,
    letterSpacing: "-0.02em",
  },
  text: {
    margin: "8px 0 0",
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 1.5,
  },
  selectWrap: {
    minWidth: 280,
    display: "grid",
    gap: 6,
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: 800,
  },
  input: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.32)",
    background: "rgba(2, 6, 23, 0.72)",
    color: "#f8fafc",
    padding: "10px 12px",
    outline: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    marginTop: 16,
  },
  card: {
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
  },
  cardTitle: {
    margin: "0 0 10px",
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: 900,
  },
  metric: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 7,
  },
  metricStrong: {
    color: "#f8fafc",
    fontWeight: 900,
    textAlign: "right",
  },
  sectionTitle: {
    margin: "20px 0 10px",
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: 900,
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    background: "rgba(2, 6, 23, 0.46)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 760,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#bbf7d0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 12px",
    color: "#e2e8f0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
    verticalAlign: "top",
  },
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
  pill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(56, 189, 248, 0.12)",
    color: "#7dd3fc",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  goodPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(34, 197, 94, 0.12)",
    color: "#86efac",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  warningPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(251, 191, 36, 0.12)",
    color: "#fde68a",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  dangerPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(248, 113, 113, 0.12)",
    color: "#fca5a5",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    color: "#cbd5e1",
    fontSize: 11,
    lineHeight: 1.5,
  },
} satisfies Record<string, CSSProperties>;

const formatAccuracy = (value: number | undefined): string => {
  if (typeof value !== "number") {
    return "sin dato";
  }

  if (value < 1) {
    return `${value.toFixed(2)} m`;
  }

  return `${value.toFixed(1)} m`;
};

const formatNumber = (value: number, digits = 2): string => {
  return Number.isFinite(value) ? value.toFixed(digits) : "0";
};

export function AplomoDeviceDetailPanel() {
  const {
    tick,
    snapshot,
    governedEvents,
    selectedDeviceId,
    setSelectedDeviceId,
    advanceTicks,
  } = useAplomoOperationsRuntime();

  const selectedDevice = useMemo(() => {
    if (selectedDeviceId === "all") {
      return snapshot.devices[0];
    }

    return snapshot.devices.find((device) => device.id === selectedDeviceId);
  }, [snapshot.devices, selectedDeviceId]);

  const deviceId = selectedDevice?.id ?? "";

  const latestPosition = useMemo(() => {
    return snapshot.latestPositions.find((position) => position.deviceId === deviceId);
  }, [snapshot.latestPositions, deviceId]);

  const sessions = useMemo(() => {
    return snapshot.sessions
      .filter((session) => session.deviceId === deviceId)
      .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  }, [snapshot.sessions, deviceId]);

  const connections = useMemo(() => {
    return snapshot.connections
      .filter((connection) => connection.deviceId === deviceId)
      .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  }, [snapshot.connections, deviceId]);

  const deviceEvents = useMemo(() => {
    return governedEvents
      .filter((item) => item.event.deviceId === deviceId)
      .slice(0, 10);
  }, [governedEvents, deviceId]);

  const analytics = useMemo(() => {
    const accuracyValues = deviceEvents
      .map((item) => item.event.quality?.accuracyMeters)
      .filter((value): value is number => typeof value === "number");

    const averageAccuracy =
      accuracyValues.length > 0
        ? accuracyValues.reduce((sum, value) => sum + value, 0) / accuracyValues.length
        : 0;

    const qualityScores = deviceEvents.flatMap((item) =>
      item.envelope.governance.quality.map((quality) => quality.score),
    );

    const averageQuality =
      qualityScores.length > 0
        ? qualityScores.reduce((sum, value) => sum + value, 0) / qualityScores.length
        : 0;

    const failures = deviceEvents.flatMap((item) =>
      item.envelope.governance.quality.filter((quality) => quality.status === "fail"),
    );

    return {
      eventCount: deviceEvents.length,
      averageAccuracy,
      averageQuality,
      failures: failures.length,
      aiReadyEvents: deviceEvents.filter((item) =>
        item.envelope.governance.aiUsagePolicy === "allowed" ||
        item.envelope.governance.aiUsagePolicy === "allowed_with_redaction",
      ).length,
    };
  }, [deviceEvents]);

  if (!selectedDevice) {
    return (
      <section style={styles.panel}>
        <p style={styles.eyebrow}>Aplomo Device Detail</p>
        <h2 style={styles.title}>Sin dispositivos disponibles</h2>
      </section>
    );
  }

  const accuracy = latestPosition?.quality?.accuracyMeters;
  const isHighPrecision = typeof accuracy === "number" && accuracy <= 1;
  const activeSession = sessions.find((session) => session.status === "active");
  const onlineConnections = connections.filter(
    (connection) => connection.status === "online",
  );

  return (
    <section style={styles.panel} aria-label="Detalle interno de dispositivo">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Aplomo Device Detail</p>
          <h2 style={styles.title}>{selectedDevice.name}</h2>
          <p style={styles.text}>
            Detalle operativo compartido: identidad, sesión, conexión,
            precisión, eventos, calidad, lineage y estado de uso para IA.
          </p>
        </div>

        <label style={styles.selectWrap}>
          Dispositivo seleccionado
          <select
            style={styles.input}
            value={selectedDevice.id}
            onChange={(event) => setSelectedDeviceId(event.target.value)}
          >
            {snapshot.devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Identidad</h3>
          <div style={styles.metric}>
            <span>Tipo</span>
            <strong style={styles.metricStrong}>{selectedDevice.type}</strong>
          </div>
          <div style={styles.metric}>
            <span>Estado</span>
            <strong style={styles.metricStrong}>{selectedDevice.status}</strong>
          </div>
          <div style={styles.metric}>
            <span>External ID</span>
            <strong style={styles.metricStrong}>
              {selectedDevice.externalIdentifier ?? "sin dato"}
            </strong>
          </div>
          <div style={styles.metric}>
            <span>Tick actual</span>
            <strong style={styles.metricStrong}>{tick}</strong>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Precisión y ubicación</h3>
          <div style={styles.metric}>
            <span>Precisión</span>
            <strong style={styles.metricStrong}>
              <span style={isHighPrecision ? styles.goodPill : styles.warningPill}>
                {formatAccuracy(accuracy)}
              </span>
            </strong>
          </div>
          <div style={styles.metric}>
            <span>Fix</span>
            <strong style={styles.metricStrong}>
              {latestPosition?.quality?.fixType ?? "unknown"}
            </strong>
          </div>
          <div style={styles.metric}>
            <span>Fuente</span>
            <strong style={styles.metricStrong}>
              {latestPosition?.source ?? "sin dato"}
            </strong>
          </div>
          <div style={styles.metric}>
            <span>RTK</span>
            <strong style={styles.metricStrong}>
              {latestPosition?.quality?.rtkStatus ?? "none"}
            </strong>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Sesión y conexiones</h3>
          <div style={styles.metric}>
            <span>Sesión activa</span>
            <strong style={styles.metricStrong}>
              {activeSession ? "sí" : "no"}
            </strong>
          </div>
          <div style={styles.metric}>
            <span>Conexiones online</span>
            <strong style={styles.metricStrong}>{onlineConnections.length}</strong>
          </div>
          <div style={styles.metric}>
            <span>IP observada</span>
            <strong style={styles.metricStrong}>
              {activeSession?.ipAddress ?? "sin dato"}
            </strong>
          </div>
          <div style={styles.metric}>
            <span>Último heartbeat</span>
            <strong style={styles.metricStrong}>
              {activeSession?.lastSeenAt ?? "sin dato"}
            </strong>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Data / IA readiness</h3>
          <div style={styles.metric}>
            <span>Eventos analizados</span>
            <strong style={styles.metricStrong}>{analytics.eventCount}</strong>
          </div>
          <div style={styles.metric}>
            <span>Calidad promedio</span>
            <strong style={styles.metricStrong}>
              {formatNumber(analytics.averageQuality, 2)}
            </strong>
          </div>
          <div style={styles.metric}>
            <span>Eventos IA-ready</span>
            <strong style={styles.metricStrong}>{analytics.aiReadyEvents}</strong>
          </div>
          <div style={styles.metric}>
            <span>Fallos calidad</span>
            <strong style={styles.metricStrong}>
              <span style={analytics.failures > 0 ? styles.dangerPill : styles.goodPill}>
                {analytics.failures}
              </span>
            </strong>
          </div>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Posición actual</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Latitud</th>
              <th style={styles.th}>Longitud</th>
              <th style={styles.th}>Altitud</th>
              <th style={styles.th}>Velocidad</th>
              <th style={styles.th}>Rumbo</th>
              <th style={styles.th}>Actualizado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...styles.td, ...styles.mono }}>
                {latestPosition?.position.latitude ?? "sin dato"}
              </td>
              <td style={{ ...styles.td, ...styles.mono }}>
                {latestPosition?.position.longitude ?? "sin dato"}
              </td>
              <td style={styles.td}>
                {latestPosition?.position.altitudeMeters ?? "sin dato"}
              </td>
              <td style={styles.td}>
                {latestPosition?.position.speedMetersPerSecond ?? "sin dato"}
              </td>
              <td style={styles.td}>
                {latestPosition?.position.headingDegrees ?? "sin dato"}
              </td>
              <td style={{ ...styles.td, ...styles.mono }}>
                {latestPosition?.updatedAt ?? "sin dato"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 style={styles.sectionTitle}>Conexiones</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Protocolo</th>
              <th style={styles.th}>Remote</th>
              <th style={styles.th}>Último visto</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((connection) => (
              <tr key={connection.id}>
                <td style={styles.td}>{connection.connectionType}</td>
                <td style={styles.td}>
                  <span style={styles.pill}>{connection.role}</span>
                </td>
                <td style={styles.td}>
                  <span
                    style={
                      connection.status === "online"
                        ? styles.goodPill
                        : styles.warningPill
                    }
                  >
                    {connection.status}
                  </span>
                </td>
                <td style={styles.td}>{connection.protocol ?? "sin dato"}</td>
                <td style={{ ...styles.td, ...styles.mono }}>
                  {connection.remoteAddress ?? "sin dato"}
                </td>
                <td style={{ ...styles.td, ...styles.mono }}>
                  {connection.lastSeenAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={styles.sectionTitle}>Eventos gobernados recientes</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Evento</th>
              <th style={styles.th}>Contrato</th>
              <th style={styles.th}>IA policy</th>
              <th style={styles.th}>Calidad</th>
              <th style={styles.th}>Lineage</th>
              <th style={styles.th}>Retención</th>
            </tr>
          </thead>
          <tbody>
            {deviceEvents.map((item) => {
              const qualityAverage =
                item.envelope.governance.quality.length > 0
                  ? item.envelope.governance.quality.reduce(
                      (sum, quality) => sum + quality.score,
                      0,
                    ) / item.envelope.governance.quality.length
                  : 0;

              return (
                <tr key={item.event.id}>
                  <td style={{ ...styles.td, ...styles.mono }}>{item.event.id}</td>
                  <td style={{ ...styles.td, ...styles.mono }}>
                    {item.envelope.governance.dataContractId}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.warningPill}>
                      {item.envelope.governance.aiUsagePolicy}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.goodPill}>
                      {formatNumber(qualityAverage, 2)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {item.envelope.governance.lineage[0]?.sourceSystem ?? "sin dato"}
                  </td>
                  <td style={styles.td}>
                    {item.envelope.governance.retentionDays} días
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 style={styles.sectionTitle}>Metadata del dispositivo</h3>
      <div style={styles.card}>
        <pre style={styles.pre}>
          {JSON.stringify(selectedDevice.metadata ?? {}, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 14 }}>
        <button type="button" style={styles.goodPill} onClick={() => advanceTicks(1)}>
          Avanzar un tick para este análisis
        </button>
      </div>
    </section>
  );
}
