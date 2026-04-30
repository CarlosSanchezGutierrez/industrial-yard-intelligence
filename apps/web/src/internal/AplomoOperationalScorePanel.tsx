import { useMemo, useState, type CSSProperties } from "react";

import {
  calculateAplomoOperationalScores,
  evaluateAplomoOperationalAlerts,
  type AplomoDeviceOperationalScore,
} from "@iyi/sync-core";

import { useAplomoOperationsRuntime } from "./AplomoOperationsRuntime.js";

const styles = {
  panel: {
    border: "1px solid rgba(45, 212, 191, 0.28)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(20, 184, 166, 0.28))",
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
    color: "#5eead4",
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
    background: "#2dd4bf",
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
    minWidth: 1020,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#99f6e4",
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
    background: "rgba(45, 212, 191, 0.12)",
    color: "#99f6e4",
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
  barOuter: {
    width: 110,
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    background: "rgba(148, 163, 184, 0.2)",
  },
  barInner: {
    height: "100%",
    borderRadius: 999,
    background: "#2dd4bf",
  },
  muted: {
    color: "#94a3b8",
    fontSize: 12,
  },
} satisfies Record<string, CSSProperties>;

const riskStyle = (risk: AplomoDeviceOperationalScore["riskLevel"]) => {
  if (risk === "excellent" || risk === "healthy") {
    return styles.goodPill;
  }

  if (risk === "watch" || risk === "degraded") {
    return styles.warningPill;
  }

  return styles.criticalPill;
};

const formatScore = (value: number): string => {
  return `${Math.round(value)}`;
};

function ScoreBar({ value }: { value: number }) {
  return (
    <div style={styles.barOuter}>
      <div style={{ ...styles.barInner, width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function AplomoOperationalScorePanel() {
  const {
    snapshot,
    governedEvents,
    selectedDeviceId,
    setSelectedDeviceId,
    advanceTicks,
  } = useAplomoOperationsRuntime();

  const [riskFilter, setRiskFilter] = useState("all");

  const evaluation = useMemo(() => {
    const alerts = evaluateAplomoOperationalAlerts({
      snapshot,
      governedEvents,
      staleHeartbeatSeconds: 120,
    });

    return calculateAplomoOperationalScores({
      snapshot,
      governedEvents,
      alerts: alerts.alerts,
      companyId: "company_demo_cooper_t_smith",
      siteId: "site_demo_altamira",
    });
  }, [snapshot, governedEvents]);

  const filteredScores = useMemo(() => {
    return evaluation.deviceScores.filter((score) => {
      if (riskFilter !== "all" && score.riskLevel !== riskFilter) {
        return false;
      }

      if (selectedDeviceId !== "all" && score.deviceId !== selectedDeviceId) {
        return false;
      }

      return true;
    });
  }, [evaluation.deviceScores, riskFilter, selectedDeviceId]);

  return (
    <section style={styles.panel} aria-label="Score operativo Aplomo">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Operational Score</p>
          <h2 style={styles.title}>Score operativo por dispositivo y sitio</h2>
          <p style={styles.text}>
            Resumen ejecutivo para administradores: conexión, precisión GPS,
            calidad de datos, readiness para IA y riesgo operacional.
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button type="button" style={styles.button} onClick={() => advanceTicks(1)}>
            Recalcular con 1 tick
          </button>
          <button type="button" style={styles.secondaryButton} onClick={() => advanceTicks(15)}>
            Simular 15 ticks
          </button>
        </div>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Score sitio</p>
          <p style={styles.metricValue}>{formatScore(evaluation.siteScore.overallScore)}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Riesgo sitio</p>
          <p style={styles.metricValue}>{evaluation.siteScore.riskLevel}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Dispositivos</p>
          <p style={styles.metricValue}>{evaluation.siteScore.deviceCount}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Sanos</p>
          <p style={styles.metricValue}>{evaluation.siteScore.healthyDevices}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Degradados</p>
          <p style={styles.metricValue}>{evaluation.siteScore.degradedDevices}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Críticos</p>
          <p style={styles.metricValue}>{evaluation.siteScore.criticalDevices}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Data quality</p>
          <p style={styles.metricValue}>{formatScore(evaluation.siteScore.averageDataQualityScore)}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>IA readiness</p>
          <p style={styles.metricValue}>{formatScore(evaluation.siteScore.averageAiReadinessScore)}</p>
        </div>
      </div>

      <div style={styles.filterGrid}>
        <label style={styles.label}>
          Riesgo
          <select
            style={styles.input}
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
          >
            <option value="all">Todos</option>
            <option value="excellent">Excellent</option>
            <option value="healthy">Healthy</option>
            <option value="watch">Watch</option>
            <option value="degraded">Degraded</option>
            <option value="critical">Critical</option>
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

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Dispositivo</th>
              <th style={styles.th}>Score</th>
              <th style={styles.th}>Riesgo</th>
              <th style={styles.th}>Conexión</th>
              <th style={styles.th}>GPS</th>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>IA</th>
              <th style={styles.th}>Alertas</th>
              <th style={styles.th}>Precisión</th>
              <th style={styles.th}>Acción recomendada</th>
            </tr>
          </thead>
          <tbody>
            {filteredScores.map((score) => (
              <tr
                key={score.deviceId}
                onClick={() => setSelectedDeviceId(score.deviceId)}
                style={{ cursor: "pointer" }}
              >
                <td style={styles.td}>
                  <strong>{score.deviceName}</strong>
                  <br />
                  <span style={styles.muted}>{score.deviceType}</span>
                </td>
                <td style={styles.td}>
                  <strong>{formatScore(score.overallScore)}</strong>
                  <ScoreBar value={score.overallScore} />
                </td>
                <td style={styles.td}>
                  <span style={riskStyle(score.riskLevel)}>{score.riskLevel}</span>
                </td>
                <td style={styles.td}>
                  {formatScore(score.breakdown.connectivity)}
                  <ScoreBar value={score.breakdown.connectivity} />
                </td>
                <td style={styles.td}>
                  {formatScore(score.breakdown.gpsPrecision)}
                  <ScoreBar value={score.breakdown.gpsPrecision} />
                </td>
                <td style={styles.td}>
                  {formatScore(score.breakdown.dataQuality)}
                  <ScoreBar value={score.breakdown.dataQuality} />
                </td>
                <td style={styles.td}>
                  {formatScore(score.breakdown.aiReadiness)}
                  <ScoreBar value={score.breakdown.aiReadiness} />
                </td>
                <td style={styles.td}>
                  <span
                    style={
                      score.criticalAlerts > 0
                        ? styles.criticalPill
                        : score.warningAlerts > 0
                          ? styles.warningPill
                          : styles.goodPill
                    }
                  >
                    {score.alertCount}
                  </span>
                </td>
                <td style={styles.td}>
                  {typeof score.latestAccuracyMeters === "number"
                    ? `${score.latestAccuracyMeters} m`
                    : "sin dato"}
                </td>
                <td style={styles.td}>{score.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
