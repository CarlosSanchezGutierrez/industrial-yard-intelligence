import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  loadAplomoCustomerHealthSnapshotHistory,
  type AplomoCustomerHealthSnapshotRow,
} from "../integrations/aplomoCustomerHealthSnapshotRepository.js";

const styles = {
  panel: {
    border: "1px solid rgba(96, 165, 250, 0.34)",
    borderRadius: 24,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(30, 64, 175, 0.36))",
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
    color: "#bfdbfe",
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
    marginTop: 12,
  },
  button: {
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    background: "#60a5fa",
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
  card: {
    marginTop: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
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
    minWidth: 1040,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#bfdbfe",
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 12px",
    color: "#e2e8f0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
    verticalAlign: "top",
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
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
} satisfies Record<string, CSSProperties>;

const jsonValueAsString = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value === null || typeof value === "undefined") {
    return "";
  }

  return JSON.stringify(value);
};

const rawCompanyName = (row: AplomoCustomerHealthSnapshotRow): string => {
  const value = row.raw_snapshot.companyName;

  return typeof value === "string" ? value : row.company_id;
};

const rawCompanySlug = (row: AplomoCustomerHealthSnapshotRow): string => {
  const value = row.raw_snapshot.companySlug;

  return typeof value === "string" ? value : "unknown";
};

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

const latestRowsByCompany = (
  rows: AplomoCustomerHealthSnapshotRow[],
): AplomoCustomerHealthSnapshotRow[] => {
  const map = new Map<string, AplomoCustomerHealthSnapshotRow>();

  for (const row of rows) {
    if (!map.has(row.company_id)) {
      map.set(row.company_id, row);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.score_total - b.score_total);
};

const escapeCsvCell = (value: unknown): string => {
  const raw = jsonValueAsString(value);
  const escaped = raw.replace(/"/g, '""');

  return `"${escaped}"`;
};

const toCsv = (rows: AplomoCustomerHealthSnapshotRow[]): string => {
  const headers = [
    "snapshot_id",
    "company_id",
    "company_name",
    "company_slug",
    "score_total",
    "band",
    "adoption_score",
    "operations_score",
    "gps_quality_score",
    "data_readiness_score",
    "activity_score",
    "risk_factors",
    "recommended_actions",
    "computed_by_profile_id",
    "computed_at",
    "created_at",
  ];

  const lines = rows.map((row) =>
    [
      row.id,
      row.company_id,
      rawCompanyName(row),
      rawCompanySlug(row),
      row.score_total,
      row.band,
      row.adoption_score,
      row.operations_score,
      row.gps_quality_score,
      row.data_readiness_score,
      row.activity_score,
      row.risk_factors.join(" | "),
      row.recommended_actions.join(" | "),
      row.computed_by_profile_id,
      row.computed_at,
      row.created_at,
    ]
      .map(escapeCsvCell)
      .join(","),
  );

  return [headers.join(","), ...lines].join("\n");
};

const downloadTextFile = (
  fileName: string,
  content: string,
  mimeType: string,
): void => {
  const blob = new Blob([content], {
    type: `${mimeType};charset=utf-8`,
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
};

const dateStamp = (): string => {
  return new Date().toISOString().replace(/[:.]/g, "-");
};

export function AplomoPlatformHealthExportPanel() {
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
      setStatusMessage(`Loaded ${result.length} snapshot rows.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const latest = useMemo(() => latestRowsByCompany(history), [history]);

  const metrics = useMemo(() => {
    const averageLatest =
      latest.length === 0
        ? 0
        : Math.round(latest.reduce((sum, row) => sum + row.score_total, 0) / latest.length);

    return {
      historyRows: history.length,
      latestCompanies: latest.length,
      averageLatest,
      riskLatest: latest.filter((row) => row.band === "risk").length,
      watchLatest: latest.filter((row) => row.band === "watch").length,
    };
  }, [history.length, latest]);

  const exportLatestCsv = () => {
    downloadTextFile(
      `aplomo-customer-health-latest-${dateStamp()}.csv`,
      toCsv(latest),
      "text/csv",
    );
    setStatusMessage(`Exported latest CSV with ${latest.length} rows.`);
  };

  const exportHistoryCsv = () => {
    downloadTextFile(
      `aplomo-customer-health-history-${dateStamp()}.csv`,
      toCsv(history),
      "text/csv",
    );
    setStatusMessage(`Exported full history CSV with ${history.length} rows.`);
  };

  const exportHistoryJson = () => {
    downloadTextFile(
      `aplomo-customer-health-history-${dateStamp()}.json`,
      JSON.stringify(history, null, 2),
      "application/json",
    );
    setStatusMessage(`Exported full history JSON with ${history.length} rows.`);
  };

  return (
    <section style={styles.panel} aria-label="Customer health export panel">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Customer Health Export MVP</p>
          <h2 style={styles.title}>Exportar historial de health score</h2>
          <p style={styles.text}>
            Exporta snapshots de customer health para soporte, customer success,
            analisis interno, reportes ejecutivos e inversionistas. CSV para Excel
            y BI; JSON para ingenieria de datos y automatizaciones.
          </p>
        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          disabled={isBusy}
          onClick={() => void load()}
        >
          {isBusy ? "Loading..." : "Reload history"}
        </button>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>History rows</p>
          <p style={styles.metricValue}>{metrics.historyRows}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Latest companies</p>
          <p style={styles.metricValue}>{metrics.latestCompanies}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Average latest</p>
          <p style={styles.metricValue}>{metrics.averageLatest}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Risk latest</p>
          <p style={styles.metricValue}>{metrics.riskLatest}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Watch latest</p>
          <p style={styles.metricValue}>{metrics.watchLatest}</p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.button}
            disabled={latest.length === 0}
            onClick={exportLatestCsv}
          >
            Export latest CSV
          </button>

          <button
            type="button"
            style={styles.button}
            disabled={history.length === 0}
            onClick={exportHistoryCsv}
          >
            Export full history CSV
          </button>

          <button
            type="button"
            style={styles.button}
            disabled={history.length === 0}
            onClick={exportHistoryJson}
          >
            Export full history JSON
          </button>
        </div>

        <p style={styles.text}>
          Latest CSV contains one row per company. Full history exports every saved
          snapshot row.
        </p>
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

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Band</th>
              <th style={styles.th}>Score</th>
              <th style={styles.th}>Adoption</th>
              <th style={styles.th}>Operations</th>
              <th style={styles.th}>GPS</th>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Activity</th>
              <th style={styles.th}>Computed at</th>
            </tr>
          </thead>
          <tbody>
            {latest.map((row) => (
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
                <td style={styles.td}>{new Date(row.computed_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
