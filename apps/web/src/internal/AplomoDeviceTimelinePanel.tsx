import { useMemo, type CSSProperties } from "react";

import { useAplomoOperationsRuntime } from "./AplomoOperationsRuntime.js";

type TimelineRow = {
  id: string;
  time: string;
  category: string;
  title: string;
  status: string;
  quality: string;
  details: string;
};

const styles = {
  panel: {
    border: "1px solid rgba(251, 191, 36, 0.28)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(113, 63, 18, 0.52))",
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
    color: "#fde68a",
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
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  button: {
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    background: "#fbbf24",
    color: "#020617",
    fontWeight: 900,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid rgba(148, 163, 184, 0.32)",
    borderRadius: 12,
    padding: "10px 14px",
    background: "rgba(15, 23, 42, 0.92)",
    color: "#e2e8f0",
    fontWeight: 800,
    cursor: "pointer",
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
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 10,
    marginTop: 16,
  },
  metricCard: {
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
  },
  metricLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  metricValue: {
    margin: "8px 0 0",
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: 950,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 320px",
    gap: 14,
    marginTop: 16,
  },
  timeline: {
    display: "grid",
    gap: 10,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "150px minmax(0, 1fr)",
    gap: 12,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    padding: 12,
    background: "rgba(2, 6, 23, 0.54)",
  },
  rowTime: {
    color: "#fde68a",
    fontSize: 11,
    fontWeight: 900,
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  rowTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: 900,
  },
  rowDetails: {
    margin: "6px 0 0",
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 1.45,
  },
  pillRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 8,
  },
  pill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(251, 191, 36, 0.12)",
    color: "#fde68a",
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
  sidebar: {
    display: "grid",
    gap: 10,
    alignContent: "start",
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
  sideMetric: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 7,
  },
  sideStrong: {
    color: "#f8fafc",
    fontWeight: 900,
    textAlign: "right",
  },
  empty: {
    border: "1px dashed rgba(148, 163, 184, 0.26)",
    borderRadius: 16,
    padding: 18,
    color: "#cbd5e1",
    background: "rgba(2, 6, 23, 0.48)",
  },
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
} satisfies Record<string, CSSProperties>;

const formatTime = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString();
};

const formatAccuracy = (value: number | undefined): string => {
  if (typeof value !== "number") {
    return "sin dato";
  }

  if (value < 1) {
    return `${value.toFixed(2)} m`;
  }

  return `${value.toFixed(1)} m`;
};

const average = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export function AplomoDeviceTimelinePanel() {
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

  const deviceEvents = useMemo(() => {
    return governedEvents.filter((item) => item.event.deviceId === deviceId);
  }, [governedEvents, deviceId]);

  const deviceSessions = useMemo(() => {
    return snapshot.sessions.filter((session) => session.deviceId === deviceId);
  }, [snapshot.sessions, deviceId]);

  const deviceConnections = useMemo(() => {
    return snapshot.connections.filter((connection) => connection.deviceId === deviceId);
  }, [snapshot.connections, deviceId]);

  const timelineRows = useMemo<TimelineRow[]>(() => {
    const gpsRows: TimelineRow[] = deviceEvents.map((item) => {
      const accuracy = item.event.quality?.accuracyMeters;
      const qualityScore = average(
        item.envelope.governance.quality.map((quality) => quality.score),
      );

      return {
        id: `event-${item.event.id}`,
        time: item.event.capturedAt,
        category: "GPS",
        title: `Posición ${item.event.source}`,
        status:
          typeof accuracy === "number" && accuracy <= 1
            ? "alta_precision"
            : "precision_normal",
        quality: qualityScore.toFixed(2),
        details: [
          `Lat: ${item.event.position?.latitude ?? "sin dato"}`,
          `Lng: ${item.event.position?.longitude ?? "sin dato"}`,
          `Precisión: ${formatAccuracy(accuracy)}`,
          `Fix: ${item.event.quality?.fixType ?? "unknown"}`,
          `IA: ${item.envelope.governance.aiUsagePolicy}`,
        ].join(" · "),
      };
    });

    const sessionRows: TimelineRow[] = deviceSessions.map((session) => ({
      id: `session-${session.id}`,
      time: session.startedAt,
      category: "Sesión",
      title: `Sesión ${session.status}`,
      status: session.status,
      quality: "n/a",
      details: [
        `IP: ${session.ipAddress ?? "sin dato"}`,
        `Plataforma: ${session.platform ?? "sin dato"}`,
        `Último visto: ${session.lastSeenAt}`,
      ].join(" · "),
    }));

    const connectionRows: TimelineRow[] = deviceConnections.map((connection) => ({
      id: `connection-${connection.id}`,
      time: connection.startedAt,
      category: "Conexión",
      title: `${connection.connectionType} · ${connection.role}`,
      status: connection.status,
      quality: "n/a",
      details: [
        `Protocolo: ${connection.protocol ?? "sin dato"}`,
        `Remote: ${connection.remoteAddress ?? "sin dato"}`,
        `Último visto: ${connection.lastSeenAt}`,
      ].join(" · "),
    }));

    return [...gpsRows, ...sessionRows, ...connectionRows].sort((a, b) =>
      b.time.localeCompare(a.time),
    );
  }, [deviceEvents, deviceSessions, deviceConnections]);

  const metrics = useMemo(() => {
    const accuracyValues = deviceEvents
      .map((item) => item.event.quality?.accuracyMeters)
      .filter((value): value is number => typeof value === "number");

    const qualityValues = deviceEvents.flatMap((item) =>
      item.envelope.governance.quality.map((quality) => quality.score),
    );

    const warnings = deviceEvents.flatMap((item) =>
      item.envelope.governance.quality.filter(
        (quality) => quality.status === "warning",
      ),
    );

    const failures = deviceEvents.flatMap((item) =>
      item.envelope.governance.quality.filter((quality) => quality.status === "fail"),
    );

    return {
      totalRows: timelineRows.length,
      gpsEvents: deviceEvents.length,
      sessions: deviceSessions.length,
      connections: deviceConnections.length,
      averageAccuracy: average(accuracyValues),
      averageQuality: average(qualityValues),
      warnings: warnings.length,
      failures: failures.length,
      aiReady: deviceEvents.filter(
        (item) =>
          item.envelope.governance.aiUsagePolicy === "allowed" ||
          item.envelope.governance.aiUsagePolicy === "allowed_with_redaction",
      ).length,
    };
  }, [timelineRows, deviceEvents, deviceSessions, deviceConnections]);

  if (!selectedDevice) {
    return (
      <section style={styles.panel}>
        <p style={styles.eyebrow}>Aplomo Timeline</p>
        <h2 style={styles.title}>Sin dispositivo seleccionado</h2>
      </section>
    );
  }

  return (
    <section style={styles.panel} aria-label="Timeline operativo por dispositivo">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Operational Timeline</p>
          <h2 style={styles.title}>Timeline operativo · {selectedDevice.name}</h2>
          <p style={styles.text}>
            Vista cronológica para diagnóstico: GPS, precisión, sesiones,
            conexiones, calidad de datos, lineage y preparación para IA.
          </p>
        </div>

        <div style={styles.actions}>
          <button type="button" style={styles.button} onClick={() => advanceTicks(1)}>
            Avanzar 1 tick
          </button>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => advanceTicks(25)}
          >
            Simular 25 ticks
          </button>

          <label style={styles.selectWrap}>
            Dispositivo
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
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Tick</p>
          <p style={styles.metricValue}>{tick}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Eventos GPS</p>
          <p style={styles.metricValue}>{metrics.gpsEvents}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Sesiones</p>
          <p style={styles.metricValue}>{metrics.sessions}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Conexiones</p>
          <p style={styles.metricValue}>{metrics.connections}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Precisión promedio</p>
          <p style={styles.metricValue}>{metrics.averageAccuracy.toFixed(2)} m</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Calidad promedio</p>
          <p style={styles.metricValue}>{metrics.averageQuality.toFixed(2)}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>IA-ready</p>
          <p style={styles.metricValue}>{metrics.aiReady}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Alertas calidad</p>
          <p style={styles.metricValue}>{metrics.warnings + metrics.failures}</p>
        </div>
      </div>

      <div style={styles.layout}>
        <div style={styles.timeline}>
          {timelineRows.length === 0 ? (
            <div style={styles.empty}>
              No hay eventos para este dispositivo. Avanza la simulación.
            </div>
          ) : (
            timelineRows.slice(0, 30).map((row) => {
              const statusStyle =
                row.status === "online" || row.status === "active" || row.status === "alta_precision"
                  ? styles.goodPill
                  : row.status === "failed" || row.status === "fail"
                    ? styles.dangerPill
                    : styles.warningPill;

              return (
                <article key={row.id} style={styles.row}>
                  <div>
                    <div style={styles.rowTime}>{formatTime(row.time)}</div>
                    <div style={{ ...styles.rowTime, marginTop: 6 }}>{row.category}</div>
                  </div>

                  <div>
                    <h3 style={styles.rowTitle}>{row.title}</h3>
                    <p style={styles.rowDetails}>{row.details}</p>

                    <div style={styles.pillRow}>
                      <span style={statusStyle}>{row.status}</span>
                      <span style={styles.pill}>calidad: {row.quality}</span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <aside style={styles.sidebar}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Diagnóstico rápido</h3>
            <div style={styles.sideMetric}>
              <span>Dispositivo</span>
              <strong style={styles.sideStrong}>{selectedDevice.type}</strong>
            </div>
            <div style={styles.sideMetric}>
              <span>Estado</span>
              <strong style={styles.sideStrong}>{selectedDevice.status}</strong>
            </div>
            <div style={styles.sideMetric}>
              <span>Timeline rows</span>
              <strong style={styles.sideStrong}>{metrics.totalRows}</strong>
            </div>
            <div style={styles.sideMetric}>
              <span>Warnings</span>
              <strong style={styles.sideStrong}>{metrics.warnings}</strong>
            </div>
            <div style={styles.sideMetric}>
              <span>Failures</span>
              <strong style={styles.sideStrong}>{metrics.failures}</strong>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Uso para analítica / IA</h3>
            <div style={styles.sideMetric}>
              <span>Data contract</span>
              <strong style={{ ...styles.sideStrong, ...styles.mono }}>
                {deviceEvents[0]?.envelope.governance.dataContractId ?? "sin datos"}
              </strong>
            </div>
            <div style={styles.sideMetric}>
              <span>AI policy</span>
              <strong style={styles.sideStrong}>
                {deviceEvents[0]?.envelope.governance.aiUsagePolicy ?? "sin datos"}
              </strong>
            </div>
            <div style={styles.sideMetric}>
              <span>Lineage</span>
              <strong style={styles.sideStrong}>
                {deviceEvents[0]?.envelope.governance.lineage[0]?.sourceSystem ??
                  "sin datos"}
              </strong>
            </div>
            <div style={styles.sideMetric}>
              <span>Retención</span>
              <strong style={styles.sideStrong}>
                {deviceEvents[0]?.envelope.governance.retentionDays ?? 0} días
              </strong>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Capacidades</h3>
            <p style={styles.text}>{selectedDevice.capabilities.join(", ")}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
