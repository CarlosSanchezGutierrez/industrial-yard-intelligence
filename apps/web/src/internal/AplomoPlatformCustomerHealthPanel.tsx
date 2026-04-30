import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  loadAplomoPlatformAdminSnapshot,
  type AplomoPlatformAdminSnapshot,
  type AplomoPlatformCompanySummary,
} from "../integrations/aplomoSupabasePlatformAdminRepository.js";

type AplomoCustomerHealthBand = "excellent" | "healthy" | "watch" | "risk";

type AplomoCustomerHealthScore = {
  companyId: string;
  companyName: string;
  companySlug: string;
  totalScore: number;
  band: AplomoCustomerHealthBand;
  adoptionScore: number;
  operationsScore: number;
  gpsQualityScore: number;
  dataReadinessScore: number;
  activityScore: number;
  riskFactors: string[];
  recommendedActions: string[];
};

const styles = {
  panel: {
    border: "1px solid rgba(251, 146, 60, 0.34)",
    borderRadius: 24,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(154, 52, 18, 0.38))",
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
    color: "#fed7aa",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 950,
    letterSpacing: "-0.03em",
  },
  text: {
    margin: "8px 0 0",
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 1.5,
    maxWidth: 920,
  },
  button: {
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    background: "#fb923c",
    color: "#020617",
    fontWeight: 900,
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
    minWidth: 1280,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#fed7aa",
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 12px",
    color: "#e2e8f0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
    verticalAlign: "top",
  },
  scoreBar: {
    width: 120,
    height: 10,
    borderRadius: 999,
    background: "rgba(148, 163, 184, 0.22)",
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  pill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  excellentPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(34, 197, 94, 0.12)",
    color: "#86efac",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  healthyPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(96, 165, 250, 0.12)",
    color: "#bfdbfe",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  watchPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(251, 191, 36, 0.12)",
    color: "#fde68a",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  riskPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(248, 113, 113, 0.12)",
    color: "#fca5a5",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  card: {
    marginTop: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
  },
  pre: {
    margin: "10px 0 0",
    whiteSpace: "pre-wrap",
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 1.5,
  },
  list: {
    margin: 0,
    paddingLeft: 16,
    color: "#cbd5e1",
    lineHeight: 1.45,
  },
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
} satisfies Record<string, CSSProperties>;

const clampScore = (value: number): number => {
  return Math.max(0, Math.min(100, Math.round(value)));
};

const bandFromScore = (score: number): AplomoCustomerHealthBand => {
  if (score >= 85) {
    return "excellent";
  }

  if (score >= 70) {
    return "healthy";
  }

  if (score >= 50) {
    return "watch";
  }

  return "risk";
};

const bandStyle = (band: AplomoCustomerHealthBand): CSSProperties => {
  if (band === "excellent") {
    return styles.excellentPill;
  }

  if (band === "healthy") {
    return styles.healthyPill;
  }

  if (band === "watch") {
    return styles.watchPill;
  }

  return styles.riskPill;
};

const scoreColor = (score: number): string => {
  if (score >= 85) {
    return "#22c55e";
  }

  if (score >= 70) {
    return "#60a5fa";
  }

  if (score >= 50) {
    return "#fbbf24";
  }

  return "#f87171";
};

const daysSince = (dateValue: string | null): number | null => {
  if (!dateValue) {
    return null;
  }

  const time = new Date(dateValue).getTime();

  if (!Number.isFinite(time)) {
    return null;
  }

  const diffMs = Date.now() - time;

  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

const createHealthScore = (
  summary: AplomoPlatformCompanySummary,
): AplomoCustomerHealthScore => {
  const riskFactors: string[] = [];
  const recommendedActions: string[] = [];

  const adoptionScore = clampScore(
    summary.activeUserCount > 0
      ? 35 +
          Math.min(summary.activeUserCount, 10) * 4 +
          Math.min(summary.adminCount, 2) * 12
      : 0,
  );

  if (summary.activeUserCount === 0) {
    riskFactors.push("No active users.");
    recommendedActions.push("Onboard at least one tenant owner and one operator.");
  }

  if (summary.adminCount === 0) {
    riskFactors.push("No tenant admin configured.");
    recommendedActions.push("Assign a tenant_owner or tenant_admin.");
  }

  const operationsScore = clampScore(
    summary.siteCount * 18 +
      summary.deviceCount * 12 +
      summary.stockpileCount * 10 +
      summary.livePositionCount * 12,
  );

  if (summary.siteCount === 0) {
    riskFactors.push("No sites configured.");
    recommendedActions.push("Create at least one site, plant or yard.");
  }

  if (summary.deviceCount === 0) {
    riskFactors.push("No devices configured.");
    recommendedActions.push("Register at least one GPS/mobile/gateway device.");
  }

  if (summary.livePositionCount === 0) {
    riskFactors.push("No live device positions.");
    recommendedActions.push("Capture GPS from browser or connect a device feed.");
  }

  const gpsQualityScore =
    summary.livePositionCount === 0
      ? 0
      : clampScore(
          35 +
            (summary.highPrecisionPositionCount / summary.livePositionCount) * 65,
        );

  if (summary.livePositionCount > 0 && summary.highPrecisionPositionCount === 0) {
    riskFactors.push("No high precision GPS positions.");
    recommendedActions.push("Review GPS accuracy, RTK/NTRIP readiness or device settings.");
  }

  const dataReadinessScore = clampScore(
    summary.stockpileCount * 16 +
      (summary.estimatedVolumeM3 > 0 ? 22 : 0) +
      (summary.estimatedWeightTons > 0 ? 22 : 0) +
      summary.livePositionCount * 8,
  );

  if (summary.stockpileCount === 0) {
    riskFactors.push("No stockpiles configured.");
    recommendedActions.push("Create stockpiles and assign material types.");
  }

  const inactiveDays = daysSince(summary.lastActivityAt);
  const activityScore =
    inactiveDays === null
      ? 0
      : clampScore(100 - Math.min(inactiveDays, 30) * 3.2);

  if (inactiveDays === null) {
    riskFactors.push("No recent activity.");
    recommendedActions.push("Run a demo capture or operational check-in.");
  } else if (inactiveDays >= 7) {
    riskFactors.push(`No activity in ${inactiveDays} days.`);
    recommendedActions.push("Contact customer owner and review adoption blockers.");
  }

  const totalScore = clampScore(
    adoptionScore * 0.24 +
      operationsScore * 0.24 +
      gpsQualityScore * 0.18 +
      dataReadinessScore * 0.18 +
      activityScore * 0.16,
  );

  if (recommendedActions.length === 0) {
    recommendedActions.push("Continue monitoring usage, GPS quality and expansion signals.");
  }

  return {
    companyId: summary.company.id,
    companyName: summary.company.name,
    companySlug: summary.company.slug,
    totalScore,
    band: bandFromScore(totalScore),
    adoptionScore,
    operationsScore,
    gpsQualityScore,
    dataReadinessScore,
    activityScore,
    riskFactors,
    recommendedActions,
  };
};

const ScoreBar = ({ score }: { score: number }) => (
  <div style={styles.scoreBar}>
    <div
      style={{
        ...styles.scoreBarFill,
        width: `${score}%`,
        background: scoreColor(score),
      }}
    />
  </div>
);

export function AplomoPlatformCustomerHealthPanel() {
  const [snapshot, setSnapshot] = useState<AplomoPlatformAdminSnapshot | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const load = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoPlatformAdminSnapshot();
      setSnapshot(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const scores = useMemo(() => {
    return (snapshot?.companySummaries ?? [])
      .map(createHealthScore)
      .sort((a, b) => a.totalScore - b.totalScore);
  }, [snapshot]);

  const aggregate = useMemo(() => {
    const total = scores.length;
    const average =
      total === 0
        ? 0
        : Math.round(scores.reduce((sum, item) => sum + item.totalScore, 0) / total);

    return {
      total,
      average,
      excellent: scores.filter((item) => item.band === "excellent").length,
      healthy: scores.filter((item) => item.band === "healthy").length,
      watch: scores.filter((item) => item.band === "watch").length,
      risk: scores.filter((item) => item.band === "risk").length,
    };
  }, [scores]);

  return (
    <section style={styles.panel} aria-label="Platform customer health score">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Platform Customer Health MVP</p>
          <h2 style={styles.title}>Customer health score</h2>
          <p style={styles.text}>
            Score interno para priorizar soporte, onboarding, expansion y riesgos
            por empresa. Combina adopcion, operacion, calidad GPS, data readiness
            y actividad reciente.
          </p>
        </div>

        <button
          type="button"
          style={styles.button}
          disabled={isBusy}
          onClick={() => void load()}
        >
          {isBusy ? "Loading..." : "Reload health"}
        </button>
      </div>

      {errorMessage ? (
        <div style={styles.card}>
          <span style={styles.riskPill}>Error</span>
          <pre style={styles.pre}>{errorMessage}</pre>
        </div>
      ) : null}

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Companies</p>
          <p style={styles.metricValue}>{aggregate.total}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Average score</p>
          <p style={styles.metricValue}>{aggregate.average}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Excellent</p>
          <p style={styles.metricValue}>{aggregate.excellent}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Healthy</p>
          <p style={styles.metricValue}>{aggregate.healthy}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Watch</p>
          <p style={styles.metricValue}>{aggregate.watch}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Risk</p>
          <p style={styles.metricValue}>{aggregate.risk}</p>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Band</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Adoption</th>
              <th style={styles.th}>Operations</th>
              <th style={styles.th}>GPS Quality</th>
              <th style={styles.th}>Data Readiness</th>
              <th style={styles.th}>Activity</th>
              <th style={styles.th}>Risk factors</th>
              <th style={styles.th}>Recommended actions</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score) => (
              <tr key={score.companyId}>
                <td style={styles.td}>
                  <strong>{score.companyName}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>
                    {score.companySlug}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={bandStyle(score.band)}>{score.band}</span>
                </td>
                <td style={styles.td}>
                  <strong>{score.totalScore}</strong>
                  <ScoreBar score={score.totalScore} />
                </td>
                <td style={styles.td}>{score.adoptionScore}</td>
                <td style={styles.td}>{score.operationsScore}</td>
                <td style={styles.td}>{score.gpsQualityScore}</td>
                <td style={styles.td}>{score.dataReadinessScore}</td>
                <td style={styles.td}>{score.activityScore}</td>
                <td style={styles.td}>
                  <ul style={styles.list}>
                    {score.riskFactors.map((factor) => (
                      <li key={factor}>{factor}</li>
                    ))}
                  </ul>
                </td>
                <td style={styles.td}>
                  <ul style={styles.list}>
                    {score.recommendedActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
