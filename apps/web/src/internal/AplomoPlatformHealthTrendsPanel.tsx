import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  loadAplomoCustomerHealthSnapshotHistory,
  type AplomoCustomerHealthSnapshotRow,
} from "../integrations/aplomoCustomerHealthSnapshotRepository.js";

type AplomoHealthTrendDirection = "improving" | "declining" | "flat" | "insufficient";

type AplomoCompanyHealthTrend = {
  companyId: string;
  companyName: string;
  companySlug: string;
  latestScore: number;
  previousScore: number | null;
  delta: number | null;
  direction: AplomoHealthTrendDirection;
  latestBand: string;
  latestComputedAt: string;
  snapshotCount: number;
  scores: number[];
  rows: AplomoCustomerHealthSnapshotRow[];
};

const styles = {
  panel: {
    border: "1px solid rgba(168, 85, 247, 0.34)",
    borderRadius: 24,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(88, 28, 135, 0.38))",
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
    color: "#e9d5ff",
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
    background: "#c084fc",
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
    minWidth: 1180,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#e9d5ff",
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 12px",
    color: "#e2e8f0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
    verticalAlign: "middle",
  },
  card: {
    marginTop: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
  },
  okPill: {
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
  neutralPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(148, 163, 184, 0.14)",
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  deltaPositive: {
    color: "#86efac",
    fontWeight: 950,
  },
  deltaNegative: {
    color: "#fca5a5",
    fontWeight: 950,
  },
  deltaFlat: {
    color: "#cbd5e1",
    fontWeight: 950,
  },
  pre: {
    margin: "10px 0 0",
    whiteSpace: "pre-wrap",
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 1.5,
  },
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
} satisfies Record<string, CSSProperties>;

const rawCompanyName = (row: AplomoCustomerHealthSnapshotRow): string => {
  const value = row.raw_snapshot.companyName;

  return typeof value === "string" ? value : row.company_id;
};

const rawCompanySlug = (row: AplomoCustomerHealthSnapshotRow): string => {
  const value = row.raw_snapshot.companySlug;

  return typeof value === "string" ? value : "unknown";
};

const formatDate = (value: string): string => {
  return new Date(value).toLocaleString();
};

const directionFromDelta = (
  delta: number | null,
  snapshotCount: number,
): AplomoHealthTrendDirection => {
  if (snapshotCount < 2 || delta === null) {
    return "insufficient";
  }

  if (delta >= 5) {
    return "improving";
  }

  if (delta <= -5) {
    return "declining";
  }

  return "flat";
};

const directionStyle = (direction: AplomoHealthTrendDirection): CSSProperties => {
  if (direction === "improving") {
    return styles.okPill;
  }

  if (direction === "declining") {
    return styles.dangerPill;
  }

  if (direction === "flat") {
    return styles.warningPill;
  }

  return styles.neutralPill;
};

const deltaStyle = (delta: number | null): CSSProperties => {
  if (delta === null || delta === 0) {
    return styles.deltaFlat;
  }

  if (delta > 0) {
    return styles.deltaPositive;
  }

  return styles.deltaNegative;
};

const formatDelta = (delta: number | null): string => {
  if (delta === null) {
    return "n/a";
  }

  if (delta > 0) {
    return `+${delta}`;
  }

  return String(delta);
};

const groupTrendsByCompany = (
  rows: AplomoCustomerHealthSnapshotRow[],
): AplomoCompanyHealthTrend[] => {
  const grouped = new Map<string, AplomoCustomerHealthSnapshotRow[]>();

  for (const row of rows) {
    const existing = grouped.get(row.company_id) ?? [];
    existing.push(row);
    grouped.set(row.company_id, existing);
  }

  const trends: AplomoCompanyHealthTrend[] = [];

  for (const [companyId, companyRows] of grouped.entries()) {
    const sortedAsc = [...companyRows].sort(
      (a, b) => new Date(a.computed_at).getTime() - new Date(b.computed_at).getTime(),
    );
    const sortedDesc = [...sortedAsc].reverse();
    const latest = sortedDesc[0];

    if (!latest) {
      continue;
    }

    const previous = sortedDesc[1] ?? null;
    const delta =
      previous === null ? null : latest.score_total - previous.score_total;
    const direction = directionFromDelta(delta, sortedAsc.length);

    trends.push({
      companyId,
      companyName: rawCompanyName(latest),
      companySlug: rawCompanySlug(latest),
      latestScore: latest.score_total,
      previousScore: previous?.score_total ?? null,
      delta,
      direction,
      latestBand: latest.band,
      latestComputedAt: latest.computed_at,
      snapshotCount: sortedAsc.length,
      scores: sortedAsc.map((row) => row.score_total),
      rows: sortedAsc,
    });
  }

  return trends.sort((a, b) => {
    if (a.direction === "declining" && b.direction !== "declining") {
      return -1;
    }

    if (b.direction === "declining" && a.direction !== "declining") {
      return 1;
    }

    return a.latestScore - b.latestScore;
  });
};

const Sparkline = ({ scores }: { scores: number[] }) => {
  const width = 180;
  const height = 52;
  const padding = 6;

  if (scores.length === 0) {
    return (
      <svg width={width} height={height} role="img" aria-label="No trend data">
        <text x="8" y="30" fill="#94a3b8" fontSize="11">
          no data
        </text>
      </svg>
    );
  }

  if (scores.length === 1) {
    const score = scores[0] ?? 0;
    const y = height - padding - (score / 100) * (height - padding * 2);

    return (
      <svg width={width} height={height} role="img" aria-label="Single point trend">
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="rgba(148, 163, 184, 0.26)"
        />
        <circle cx={width / 2} cy={y} r="4" fill="#c084fc" />
      </svg>
    );
  }

  const points = scores.map((score, index) => {
    const x = padding + (index / (scores.length - 1)) * (width - padding * 2);
    const y = height - padding - (score / 100) * (height - padding * 2);

    return { x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const first = scores[0] ?? 0;
  const last = scores[scores.length - 1] ?? first;
  const stroke = last >= first ? "#86efac" : "#fca5a5";

  return (
    <svg width={width} height={height} role="img" aria-label="Health score trend">
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="rgba(148, 163, 184, 0.26)"
      />
      <line
        x1={padding}
        y1={padding}
        x2={width - padding}
        y2={padding}
        stroke="rgba(148, 163, 184, 0.12)"
      />
      <path d={path} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      {points.map((point, index) => (
        <circle
          key={`${point.x}-${point.y}-${index}`}
          cx={point.x}
          cy={point.y}
          r={index === points.length - 1 ? "4" : "2.5"}
          fill={index === points.length - 1 ? "#f8fafc" : stroke}
        />
      ))}
    </svg>
  );
};

export function AplomoPlatformHealthTrendsPanel() {
  const [history, setHistory] = useState<AplomoCustomerHealthSnapshotRow[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const load = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoCustomerHealthSnapshotHistory();
      setHistory(result);
      setStatusMessage(`Loaded ${result.length} health snapshot rows.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const trends = useMemo(() => groupTrendsByCompany(history), [history]);

  const metrics = useMemo(() => {
    return {
      companies: trends.length,
      improving: trends.filter((trend) => trend.direction === "improving").length,
      declining: trends.filter((trend) => trend.direction === "declining").length,
      flat: trends.filter((trend) => trend.direction === "flat").length,
      insufficient: trends.filter((trend) => trend.direction === "insufficient").length,
      averageDelta:
        trends.length === 0
          ? 0
          : Math.round(
              trends.reduce((sum, trend) => sum + (trend.delta ?? 0), 0) /
                trends.length,
            ),
    };
  }, [trends]);

  return (
    <section style={styles.panel} aria-label="Customer health trends">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Customer Health Trends MVP</p>
          <h2 style={styles.title}>Tendencias y deltas por cliente</h2>
          <p style={styles.text}>
            Analiza si cada empresa mejora o empeora en su health score. Esto ayuda a
            priorizar soporte, onboarding, customer success, expansion y riesgo de churn.
          </p>
        </div>

        <button
          type="button"
          style={styles.button}
          disabled={isBusy}
          onClick={() => void load()}
        >
          {isBusy ? "Loading..." : "Reload trends"}
        </button>
      </div>

      {statusMessage ? (
        <div style={styles.card}>
          <span style={styles.okPill}>Status</span>
          <pre style={styles.pre}>{statusMessage}</pre>
        </div>
      ) : null}

      {errorMessage ? (
        <div style={styles.card}>
          <span style={styles.dangerPill}>Error</span>
          <pre style={styles.pre}>{errorMessage}</pre>
        </div>
      ) : null}

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Companies</p>
          <p style={styles.metricValue}>{metrics.companies}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Improving</p>
          <p style={styles.metricValue}>{metrics.improving}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Declining</p>
          <p style={styles.metricValue}>{metrics.declining}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Flat</p>
          <p style={styles.metricValue}>{metrics.flat}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Insufficient</p>
          <p style={styles.metricValue}>{metrics.insufficient}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Average delta</p>
          <p style={styles.metricValue}>{formatDelta(metrics.averageDelta)}</p>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Trend</th>
              <th style={styles.th}>Latest</th>
              <th style={styles.th}>Previous</th>
              <th style={styles.th}>Delta</th>
              <th style={styles.th}>Snapshots</th>
              <th style={styles.th}>Sparkline</th>
              <th style={styles.th}>Latest computed</th>
            </tr>
          </thead>
          <tbody>
            {trends.map((trend) => (
              <tr key={trend.companyId}>
                <td style={styles.td}>
                  <strong>{trend.companyName}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>
                    {trend.companySlug}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={directionStyle(trend.direction)}>
                    {trend.direction}
                  </span>
                </td>
                <td style={styles.td}>{trend.latestScore}</td>
                <td style={styles.td}>{trend.previousScore ?? "n/a"}</td>
                <td style={styles.td}>
                  <span style={deltaStyle(trend.delta)}>{formatDelta(trend.delta)}</span>
                </td>
                <td style={styles.td}>{trend.snapshotCount}</td>
                <td style={styles.td}>
                  <Sparkline scores={trend.scores} />
                </td>
                <td style={styles.td}>{formatDate(trend.latestComputedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
