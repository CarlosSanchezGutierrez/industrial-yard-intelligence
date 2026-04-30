import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  loadAplomoPlatformAdminSnapshot,
  type AplomoPlatformAdminSnapshot,
  type AplomoPlatformCompanySummary,
} from "../integrations/aplomoSupabasePlatformAdminRepository.js";

const styles = {
  panel: {
    border: "1px solid rgba(244, 114, 182, 0.34)",
    borderRadius: 24,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(157, 23, 77, 0.40))",
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
    color: "#f9a8d4",
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
    background: "#f472b6",
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
    color: "#fbcfe8",
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
    background: "rgba(244, 114, 182, 0.12)",
    color: "#fbcfe8",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
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
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
} satisfies Record<string, CSSProperties>;

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value: string | null): string => {
  if (!value) {
    return "no data";
  }

  return new Date(value).toLocaleString();
};

const companyHealth = (summary: AplomoPlatformCompanySummary): "good" | "warning" | "danger" => {
  if (summary.deviceCount === 0 || summary.activeUserCount === 0) {
    return "warning";
  }

  if (summary.livePositionCount === 0) {
    return "warning";
  }

  return "good";
};

export function AplomoSuperAdminPanel() {
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

  const metrics = useMemo(() => {
    const summaries = snapshot?.companySummaries ?? [];

    return {
      companies: summaries.length,
      users: snapshot?.memberships.length ?? 0,
      activeUsers: summaries.reduce((sum, item) => sum + item.activeUserCount, 0),
      devices: summaries.reduce((sum, item) => sum + item.deviceCount, 0),
      livePositions: summaries.reduce((sum, item) => sum + item.livePositionCount, 0),
      stockpiles: summaries.reduce((sum, item) => sum + item.stockpileCount, 0),
      volumeM3: summaries.reduce((sum, item) => sum + item.estimatedVolumeM3, 0),
      weightTons: summaries.reduce((sum, item) => sum + item.estimatedWeightTons, 0),
    };
  }, [snapshot]);

  return (
    <section style={styles.panel} aria-label="Aplomo Super Admin Panel">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Aplomo Super Admin MVP</p>
          <h2 style={styles.title}>Cross-tenant platform console</h2>
          <p style={styles.text}>
            Vista interna para Aplomo: empresas, usuarios, sitios, dispositivos,
            stockpiles, posiciones vivas y salud general del SaaS.
          </p>
        </div>

        <button
          type="button"
          style={styles.button}
          disabled={isBusy}
          onClick={() => void load()}
        >
          {isBusy ? "Loading..." : "Reload platform"}
        </button>
      </div>

      <div style={styles.card}>
        <span style={styles.pill}>Access context</span>
        <pre style={styles.pre}>
{`User: ${snapshot?.email ?? "not signed in"}
Platform role: ${snapshot?.platformRole ?? "none"}
Loaded at: ${snapshot?.loadedAt ?? "pending"}`}
        </pre>
      </div>

      {errorMessage ? (
        <div style={styles.card}>
          <span style={styles.dangerPill}>Error</span>
          <pre style={styles.pre}>{errorMessage}</pre>
          <p style={styles.text}>
            If this is an RLS error or zero rows, apply the platform select policies
            migration in Supabase SQL Editor.
          </p>
        </div>
      ) : null}

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Companies</p>
          <p style={styles.metricValue}>{metrics.companies}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Users</p>
          <p style={styles.metricValue}>{metrics.users}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Active users</p>
          <p style={styles.metricValue}>{metrics.activeUsers}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Devices</p>
          <p style={styles.metricValue}>{metrics.devices}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Live positions</p>
          <p style={styles.metricValue}>{metrics.livePositions}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Stockpiles</p>
          <p style={styles.metricValue}>{metrics.stockpiles}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Volume m3</p>
          <p style={styles.metricValue}>{formatNumber(metrics.volumeM3)}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Weight tons</p>
          <p style={styles.metricValue}>{formatNumber(metrics.weightTons)}</p>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Health</th>
              <th style={styles.th}>Users</th>
              <th style={styles.th}>Admins</th>
              <th style={styles.th}>Sites</th>
              <th style={styles.th}>Devices</th>
              <th style={styles.th}>Live positions</th>
              <th style={styles.th}>High precision</th>
              <th style={styles.th}>Stockpiles</th>
              <th style={styles.th}>Volume m3</th>
              <th style={styles.th}>Weight tons</th>
              <th style={styles.th}>Last activity</th>
            </tr>
          </thead>
          <tbody>
            {(snapshot?.companySummaries ?? []).map((summary) => {
              const health = companyHealth(summary);

              return (
                <tr key={summary.company.id}>
                  <td style={styles.td}>
                    <strong>{summary.company.name}</strong>
                    <br />
                    <span style={{ ...styles.mono, color: "#94a3b8" }}>
                      {summary.company.slug}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={
                        health === "good"
                          ? styles.okPill
                          : health === "warning"
                            ? styles.warningPill
                            : styles.dangerPill
                      }
                    >
                      {health}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {summary.activeUserCount} / {summary.userCount}
                  </td>
                  <td style={styles.td}>{summary.adminCount}</td>
                  <td style={styles.td}>{summary.siteCount}</td>
                  <td style={styles.td}>{summary.deviceCount}</td>
                  <td style={styles.td}>{summary.livePositionCount}</td>
                  <td style={styles.td}>{summary.highPrecisionPositionCount}</td>
                  <td style={styles.td}>{summary.stockpileCount}</td>
                  <td style={styles.td}>{formatNumber(summary.estimatedVolumeM3)}</td>
                  <td style={styles.td}>{formatNumber(summary.estimatedWeightTons)}</td>
                  <td style={styles.td}>{formatDate(summary.lastActivityAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
