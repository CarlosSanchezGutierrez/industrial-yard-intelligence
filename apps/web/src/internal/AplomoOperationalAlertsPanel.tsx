import { useMemo, useState, type CSSProperties } from "react";

import {
  evaluateAplomoOperationalAlerts,
  type AplomoOperationalAlert,
} from "@iyi/sync-core";

import { useAplomoOperationsRuntime } from "./AplomoOperationsRuntime.js";

const styles = {
  panel: {
    border: "1px solid rgba(248, 113, 113, 0.28)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(127, 29, 29, 0.52))",
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
    color: "#fca5a5",
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
  buttonRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  button: {
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    background: "#f87171",
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
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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
    fontSize: 24,
    fontWeight: 950,
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    marginTop: 16,
  },
  label: {
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
  tableWrap: {
    marginTop: 16,
    overflowX: "auto",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    background: "rgba(2, 6, 23, 0.46)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 980,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#fecaca",
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 12px",
    color: "#e2e8f0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
    verticalAlign: "top",
  },
  pill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(148, 163, 184, 0.12)",
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  infoPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(56, 189, 248, 0.12)",
    color: "#7dd3fc",
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
  criticalPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(248, 113, 113, 0.12)",
    color: "#fca5a5",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
  empty: {
    marginTop: 16,
    border: "1px dashed rgba(148, 163, 184, 0.26)",
    borderRadius: 16,
    padding: 18,
    color: "#cbd5e1",
    background: "rgba(2, 6, 23, 0.48)",
  },
} satisfies Record<string, CSSProperties>;

const severityStyle = (severity: AplomoOperationalAlert["severity"]) => {
  if (severity === "critical") {
    return styles.criticalPill;
  }

  if (severity === "warning") {
    return styles.warningPill;
  }

  return styles.infoPill;
};

export function AplomoOperationalAlertsPanel() {
  const {
    snapshot,
    governedEvents,
    selectedDeviceId,
    setSelectedDeviceId,
    advanceTicks,
  } = useAplomoOperationsRuntime();

  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const evaluation = useMemo(() => {
    return evaluateAplomoOperationalAlerts({
      snapshot,
      governedEvents,
      staleHeartbeatSeconds: 120,
    });
  }, [snapshot, governedEvents]);

  const categories = useMemo(() => {
    return Array.from(new Set(evaluation.alerts.map((alert) => alert.category))).sort();
  }, [evaluation.alerts]);

  const filteredAlerts = useMemo(() => {
    return evaluation.alerts
      .filter((alert) => {
        if (severityFilter !== "all" && alert.severity !== severityFilter) {
          return false;
        }

        if (categoryFilter !== "all" && alert.category !== categoryFilter) {
          return false;
        }

        if (selectedDeviceId !== "all" && alert.deviceId !== selectedDeviceId) {
          return false;
        }

        return true;
      })
      .slice(0, 80);
  }, [evaluation.alerts, severityFilter, categoryFilter, selectedDeviceId]);

  return (
    <section style={styles.panel} aria-label="Alertas inteligentes operativas">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Smart Ops Alerts</p>
          <h2 style={styles.title}>Alertas inteligentes calculadas</h2>
          <p style={styles.text}>
            Motor de reglas para detectar problemas de precisión, RTK,
            heartbeat, conexión, calidad de datos, lineage y readiness para IA.
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button type="button" style={styles.button} onClick={() => advanceTicks(1)}>
            Avanzar 1 tick
          </button>
          <button type="button" style={styles.secondaryButton} onClick={() => advanceTicks(20)}>
            Simular 20 ticks
          </button>
        </div>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Alertas</p>
          <p style={styles.metricValue}>{evaluation.summary.total}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Críticas</p>
          <p style={styles.metricValue}>{evaluation.summary.critical}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Warnings</p>
          <p style={styles.metricValue}>{evaluation.summary.warning}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Info</p>
          <p style={styles.metricValue}>{evaluation.summary.info}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Impactan data</p>
          <p style={styles.metricValue}>{evaluation.summary.dataQualityImpacted}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Impactan IA</p>
          <p style={styles.metricValue}>{evaluation.summary.aiReadinessImpacted}</p>
        </div>
      </div>

      <div style={styles.filterGrid}>
        <label style={styles.label}>
          Severidad
          <select
            style={styles.input}
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value)}
          >
            <option value="all">Todas</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </label>

        <label style={styles.label}>
          Categoría
          <select
            style={styles.input}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Todas</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Dispositivo
          <select
            style={styles.input}
            value={selectedDeviceId}
            onChange={(event) => setSelectedDeviceId(event.target.value)}
          >
            <option value="all">Todos</option>
            {snapshot.devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredAlerts.length === 0 ? (
        <div style={styles.empty}>
          No hay alertas con los filtros actuales.
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Severidad</th>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Dispositivo</th>
                <th style={styles.th}>Alerta</th>
                <th style={styles.th}>Impacto data</th>
                <th style={styles.th}>Impacto IA</th>
                <th style={styles.th}>Acción recomendada</th>
                <th style={styles.th}>Evidencia</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => {
                const device = snapshot.devices.find((item) => item.id === alert.deviceId);

                return (
                  <tr
                    key={alert.id}
                    onClick={() => {
                      if (alert.deviceId) {
                        setSelectedDeviceId(alert.deviceId);
                      }
                    }}
                    style={{ cursor: alert.deviceId ? "pointer" : "default" }}
                  >
                    <td style={styles.td}>
                      <span style={severityStyle(alert.severity)}>
                        {alert.severity}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.pill}>{alert.category}</span>
                    </td>
                    <td style={styles.td}>{device?.name ?? alert.deviceId ?? "global"}</td>
                    <td style={styles.td}>
                      <strong>{alert.title}</strong>
                      <br />
                      <span>{alert.message}</span>
                    </td>
                    <td style={styles.td}>{alert.dataQualityImpact}</td>
                    <td style={styles.td}>{alert.aiReadinessImpact}</td>
                    <td style={styles.td}>{alert.recommendedAction}</td>
                    <td style={{ ...styles.td, ...styles.mono }}>
                      {alert.evidence
                        .map((item) => `${item.label}: ${item.value}`)
                        .join(" | ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
