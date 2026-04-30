import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  loadAplomoCustomerHealthSnapshotHistory,
  persistAplomoCustomerHealthSnapshots,
  type AplomoCustomerHealthSnapshotRow,
} from "../integrations/aplomoCustomerHealthSnapshotRepository.js";

const styles = {
  panel: {
    border: "1px solid rgba(34, 197, 94, 0.34)",
    borderRadius: 24,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(22, 101, 52, 0.36))",
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
  buttonRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  button: {
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    background: "#22c55e",
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

const bandStyle = (band: string): CSSProperties => {
  if (band === "excellent" || band === "healthy") {
    return styles.okPill;
  }

  if (band === "watch") {
    return styles.warningPill;
  }

  if (band === "risk") {
    return styles.dangerPill;
  }

  return styles.neutralPill;
};

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

export function AplomoPlatformHealthSnapshotsPanel() {
  const [history, setHistory] = useState<AplomoCustomerHealthSnapshotRow[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const load = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoCustomerHealthSnapshotHistory();
      setHistory(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const persist = async () => {
    setIsBusy(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const result = await persistAplomoCustomerHealthSnapshots();
      setStatusMessage(
        `Persisted ${result.insertedRows.length} health snapshots at ${result.loadedAt}.`,
      );
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const latestByCompany = useMemo(() => {
    const map = new Map<string, AplomoCustomerHealthSnapshotRow>();

    for (const row of history) {
      if (!map.has(row.company_id)) {
        map.set(row.company_id, row);
      }
    }

    return Array.from(map.values()).sort((a, b) => a.score_total - b.score_total);
  }, [history]);

  const metrics = useMemo(() => {
    const total = latestByCompany.length;
    const average =
      total === 0
        ? 0
        : Math.round(
            latestByCompany.reduce((sum, row) => sum + row.score_total, 0) / total,
          );

    return {
      total,
      average,
      risk: latestByCompany.filter((row) => row.band === "risk").length,
      watch: latestByCompany.filter((row) => row.band === "watch").length,
      healthy: latestByCompany.filter(
        (row) => row.band === "healthy" || row.band === "excellent",
      ).length,
      rows: history.length,
    };
  }, [history.length, latestByCompany]);

  return (
    <section style={styles.panel} aria-label="Customer health snapshots">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Customer Health Snapshots</p>
          <h2 style={styles.title}>Historial auditable de health score</h2>
          <p style={styles.text}>
            Guarda snapshots reales del score de salud por empresa en Supabase.
            Esto permite auditar adopcion, riesgos, actividad y madurez operativa
            a lo largo del tiempo.
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.button}
            disabled={isBusy}
            onClick={() => void persist()}
          >
            {isBusy ? "Working..." : "Persist current snapshot"}
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            disabled={isBusy}
            onClick={() => void load()}
          >
            Reload history
          </button>
        </div>
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
          <p style={styles.pre}>
            If the table does not exist, apply the customer health snapshots
            migration in Supabase SQL Editor.
          </p>
        </div>
      ) : null}

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Latest companies</p>
          <p style={styles.metricValue}>{metrics.total}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Average latest</p>
          <p style={styles.metricValue}>{metrics.average}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Risk</p>
          <p style={styles.metricValue}>{metrics.risk}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Watch</p>
          <p style={styles.metricValue}>{metrics.watch}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Healthy</p>
          <p style={styles.metricValue}>{metrics.healthy}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Snapshot rows</p>
          <p style={styles.metricValue}>{metrics.rows}</p>
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
              <th style={styles.th}>GPS</th>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Activity</th>
              <th style={styles.th}>Computed at</th>
              <th style={styles.th}>Risks</th>
            </tr>
          </thead>
          <tbody>
            {latestByCompany.map((row) => (
              <tr key={row.id}>
                <td style={styles.td}>
                  <strong>{rawCompanyName(row)}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>
                    {rawCompanySlug(row)}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={bandStyle(row.band)}>{row.band}</span>
                </td>
                <td style={styles.td}>{row.score_total}</td>
                <td style={styles.td}>{row.adoption_score}</td>
                <td style={styles.td}>{row.operations_score}</td>
                <td style={styles.td}>{row.gps_quality_score}</td>
                <td style={styles.td}>{row.data_readiness_score}</td>
                <td style={styles.td}>{row.activity_score}</td>
                <td style={styles.td}>{formatDate(row.computed_at)}</td>
                <td style={styles.td}>
                  <ul style={styles.list}>
                    {row.risk_factors.map((risk) => (
                      <li key={risk}>{risk}</li>
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
