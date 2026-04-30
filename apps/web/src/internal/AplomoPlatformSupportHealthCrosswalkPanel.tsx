import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  loadAplomoCustomerHealthSnapshotHistory,
  type AplomoCustomerHealthSnapshotRow,
} from "../integrations/aplomoCustomerHealthSnapshotRepository.js";
import {
  loadAplomoPlatformSupportWorkflowContext,
  type AplomoPlatformSupportWorkflowContext,
  type AplomoPlatformSupportWorkflowRow,
} from "../integrations/aplomoPlatformSupportWorkflowRepository.js";

type CrosswalkRow = {
  companyId: string;
  companyName: string;
  companySlug: string;
  healthScore: number | null;
  healthBand: string;
  healthComputedAt: string | null;
  openWorkflowCount: number;
  urgentWorkflowCount: number;
  blockedWorkflowCount: number;
  highestPriority: string;
  highestRiskLevel: string;
  assignedOwners: string[];
  nextTouchAt: string | null;
  actionStatus: "covered" | "needs_workflow" | "urgent" | "blocked" | "healthy_no_action" | "unknown";
  recommendedAction: string;
};

const styles = {
  panel: {
    border: "1px solid rgba(250, 204, 21, 0.34)",
    borderRadius: 24,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(113, 63, 18, 0.38))",
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
    color: "#fef08a",
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
    maxWidth: 940,
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
    background: "#facc15",
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
    minWidth: 1360,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#fef08a",
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
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
} satisfies Record<string, CSSProperties>;

const openStatuses = new Set(["open", "in_progress", "waiting_customer", "blocked"]);
const priorityRank: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};
const riskRank: Record<string, number> = {
  none: 0,
  watch: 1,
  risk: 2,
  critical: 3,
};

const rawCompanyName = (row: AplomoCustomerHealthSnapshotRow): string => {
  const value = row.raw_snapshot.companyName;

  return typeof value === "string" ? value : row.company_id;
};

const rawCompanySlug = (row: AplomoCustomerHealthSnapshotRow): string => {
  const value = row.raw_snapshot.companySlug;

  return typeof value === "string" ? value : "unknown";
};

const latestHealthByCompany = (
  rows: AplomoCustomerHealthSnapshotRow[],
): Map<string, AplomoCustomerHealthSnapshotRow> => {
  const sorted = [...rows].sort(
    (a, b) => new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime(),
  );
  const map = new Map<string, AplomoCustomerHealthSnapshotRow>();

  for (const row of sorted) {
    if (!map.has(row.company_id)) {
      map.set(row.company_id, row);
    }
  }

  return map;
};

const profileLabel = (
  context: AplomoPlatformSupportWorkflowContext | null,
  profileId: string | null,
): string | null => {
  if (!profileId) {
    return null;
  }

  const profile = context?.profiles.find((item) => item.id === profileId);

  return profile?.email ?? profile?.display_name ?? profileId;
};

const maxRankValue = (
  values: string[],
  rank: Record<string, number>,
  fallback: string,
): string => {
  let selected = fallback;
  let selectedRank = rank[fallback] ?? 0;

  for (const value of values) {
    const currentRank = rank[value] ?? 0;

    if (currentRank > selectedRank) {
      selected = value;
      selectedRank = currentRank;
    }
  }

  return selected;
};

const earliestDate = (values: Array<string | null>): string | null => {
  const times = values
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  if (times.length === 0) {
    return null;
  }

  return new Date(Math.min(...times)).toISOString();
};

const createCrosswalkRows = (
  context: AplomoPlatformSupportWorkflowContext | null,
  healthRows: AplomoCustomerHealthSnapshotRow[],
): CrosswalkRow[] => {
  if (!context) {
    return [];
  }

  const healthMap = latestHealthByCompany(healthRows);

  return context.companies
    .map((company) => {
      const health = healthMap.get(company.id) ?? null;
      const workflows = context.workflows.filter(
        (workflow) => workflow.company_id === company.id,
      );
      const openWorkflows = workflows.filter((workflow) =>
        openStatuses.has(workflow.status),
      );
      const urgentWorkflowCount = openWorkflows.filter(
        (workflow) => workflow.priority === "urgent",
      ).length;
      const blockedWorkflowCount = openWorkflows.filter(
        (workflow) => workflow.status === "blocked",
      ).length;
      const highestPriority = maxRankValue(
        openWorkflows.map((workflow) => workflow.priority),
        priorityRank,
        "low",
      );
      const highestRiskLevel = maxRankValue(
        openWorkflows.map((workflow) => workflow.risk_level),
        riskRank,
        "none",
      );
      const assignedOwners = Array.from(
        new Set(
          openWorkflows
            .map((workflow) => profileLabel(context, workflow.assigned_to_profile_id))
            .filter((value): value is string => Boolean(value)),
        ),
      );
      const nextTouchAt = earliestDate(
        openWorkflows.map((workflow) => workflow.next_touch_at),
      );

      let actionStatus: CrosswalkRow["actionStatus"] = "unknown";
      let recommendedAction = "Review customer manually.";

      if (!health) {
        actionStatus = openWorkflows.length > 0 ? "covered" : "unknown";
        recommendedAction = "Create or persist customer health snapshot.";
      } else if (blockedWorkflowCount > 0) {
        actionStatus = "blocked";
        recommendedAction = "Unblock support workflow immediately.";
      } else if (urgentWorkflowCount > 0) {
        actionStatus = "urgent";
        recommendedAction = "Review urgent workflow and contact customer.";
      } else if (
        (health.band === "risk" || health.band === "watch" || health.score_total < 70) &&
        openWorkflows.length === 0
      ) {
        actionStatus = "needs_workflow";
        recommendedAction = "Create support workflow and assign owner.";
      } else if (openWorkflows.length > 0) {
        actionStatus = "covered";
        recommendedAction = "Continue active follow-up.";
      } else {
        actionStatus = "healthy_no_action";
        recommendedAction = "No immediate action. Continue monitoring.";
      }

      return {
        companyId: company.id,
        companyName: health ? rawCompanyName(health) : company.name,
        companySlug: health ? rawCompanySlug(health) : company.slug,
        healthScore: health?.score_total ?? null,
        healthBand: health?.band ?? "no_snapshot",
        healthComputedAt: health?.computed_at ?? null,
        openWorkflowCount: openWorkflows.length,
        urgentWorkflowCount,
        blockedWorkflowCount,
        highestPriority,
        highestRiskLevel,
        assignedOwners,
        nextTouchAt,
        actionStatus,
        recommendedAction,
      };
    })
    .sort((a, b) => {
      const order: Record<CrosswalkRow["actionStatus"], number> = {
        blocked: 0,
        urgent: 1,
        needs_workflow: 2,
        unknown: 3,
        covered: 4,
        healthy_no_action: 5,
      };

      const actionDiff = order[a.actionStatus] - order[b.actionStatus];

      if (actionDiff !== 0) {
        return actionDiff;
      }

      return (a.healthScore ?? 999) - (b.healthScore ?? 999);
    });
};

const pillForAction = (status: CrosswalkRow["actionStatus"]): CSSProperties => {
  if (status === "blocked" || status === "urgent" || status === "needs_workflow") {
    return styles.dangerPill;
  }

  if (status === "unknown") {
    return styles.warningPill;
  }

  if (status === "covered") {
    return styles.okPill;
  }

  return styles.neutralPill;
};

const pillForHealth = (band: string): CSSProperties => {
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

const formatDate = (value: string | null): string => {
  if (!value) {
    return "not set";
  }

  return new Date(value).toLocaleString();
};

const escapeCsvCell = (value: unknown): string => {
  const raw =
    typeof value === "string"
      ? value
      : value === null || typeof value === "undefined"
        ? ""
        : Array.isArray(value)
          ? value.join(" | ")
          : String(value);
  const escaped = raw.replace(/"/g, '""');

  return `"${escaped}"`;
};

const toCsv = (rows: CrosswalkRow[]): string => {
  const headers = [
    "company_id",
    "company_name",
    "company_slug",
    "health_score",
    "health_band",
    "health_computed_at",
    "open_workflow_count",
    "urgent_workflow_count",
    "blocked_workflow_count",
    "highest_priority",
    "highest_risk_level",
    "assigned_owners",
    "next_touch_at",
    "action_status",
    "recommended_action",
  ];

  const lines = rows.map((row) =>
    [
      row.companyId,
      row.companyName,
      row.companySlug,
      row.healthScore,
      row.healthBand,
      row.healthComputedAt,
      row.openWorkflowCount,
      row.urgentWorkflowCount,
      row.blockedWorkflowCount,
      row.highestPriority,
      row.highestRiskLevel,
      row.assignedOwners,
      row.nextTouchAt,
      row.actionStatus,
      row.recommendedAction,
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

export function AplomoPlatformSupportHealthCrosswalkPanel() {
  const [context, setContext] =
    useState<AplomoPlatformSupportWorkflowContext | null>(null);
  const [healthRows, setHealthRows] = useState<AplomoCustomerHealthSnapshotRow[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const load = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const [supportContext, healthHistory] = await Promise.all([
        loadAplomoPlatformSupportWorkflowContext(),
        loadAplomoCustomerHealthSnapshotHistory(),
      ]);

      setContext(supportContext);
      setHealthRows(healthHistory);
      setStatusMessage(
        `Loaded ${supportContext.workflows.length} workflows and ${healthHistory.length} health snapshots.`,
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo(() => createCrosswalkRows(context, healthRows), [context, healthRows]);

  const metrics = useMemo(
    () => ({
      companies: rows.length,
      blocked: rows.filter((row) => row.actionStatus === "blocked").length,
      urgent: rows.filter((row) => row.actionStatus === "urgent").length,
      needsWorkflow: rows.filter((row) => row.actionStatus === "needs_workflow").length,
      covered: rows.filter((row) => row.actionStatus === "covered").length,
      healthyNoAction: rows.filter((row) => row.actionStatus === "healthy_no_action").length,
    }),
    [rows],
  );

  const exportCsv = () => {
    downloadTextFile(
      `aplomo-support-health-crosswalk-${dateStamp()}.csv`,
      toCsv(rows),
      "text/csv",
    );
    setStatusMessage(`Exported crosswalk CSV with ${rows.length} rows.`);
  };

  const exportJson = () => {
    downloadTextFile(
      `aplomo-support-health-crosswalk-${dateStamp()}.json`,
      JSON.stringify(rows, null, 2),
      "application/json",
    );
    setStatusMessage(`Exported crosswalk JSON with ${rows.length} rows.`);
  };

  return (
    <section style={styles.panel} aria-label="Support and health crosswalk">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Support + Health Crosswalk MVP</p>
          <h2 style={styles.title}>Riesgo del cliente contra seguimiento real</h2>
          <p style={styles.text}>
            Cruza customer health con workflows internos para detectar clientes en riesgo
            sin responsable, urgencias, bloqueos y acciones pendientes.
          </p>
        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          disabled={isBusy}
          onClick={() => void load()}
        >
          {isBusy ? "Loading..." : "Reload crosswalk"}
        </button>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Companies</p>
          <p style={styles.metricValue}>{metrics.companies}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Blocked</p>
          <p style={styles.metricValue}>{metrics.blocked}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Urgent</p>
          <p style={styles.metricValue}>{metrics.urgent}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Needs workflow</p>
          <p style={styles.metricValue}>{metrics.needsWorkflow}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Covered</p>
          <p style={styles.metricValue}>{metrics.covered}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Healthy no action</p>
          <p style={styles.metricValue}>{metrics.healthyNoAction}</p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.buttonRow}>
          <button type="button" style={styles.button} disabled={rows.length === 0} onClick={exportCsv}>
            Export crosswalk CSV
          </button>
          <button type="button" style={styles.button} disabled={rows.length === 0} onClick={exportJson}>
            Export crosswalk JSON
          </button>
        </div>
        <p style={styles.text}>
          Este export sirve para customer success, soporte, reuniones internas,
          analisis ejecutivo y automatizaciones futuras con IA.
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
              <th style={styles.th}>Action</th>
              <th style={styles.th}>Health</th>
              <th style={styles.th}>Open workflows</th>
              <th style={styles.th}>Urgent</th>
              <th style={styles.th}>Blocked</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Risk</th>
              <th style={styles.th}>Assigned owners</th>
              <th style={styles.th}>Next touch</th>
              <th style={styles.th}>Recommended action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.companyId}>
                <td style={styles.td}>
                  <strong>{row.companyName}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>
                    {row.companySlug}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={pillForAction(row.actionStatus)}>
                    {row.actionStatus}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={pillForHealth(row.healthBand)}>{row.healthBand}</span>
                  <br />
                  <strong>{row.healthScore ?? "n/a"}</strong>
                </td>
                <td style={styles.td}>{row.openWorkflowCount}</td>
                <td style={styles.td}>{row.urgentWorkflowCount}</td>
                <td style={styles.td}>{row.blockedWorkflowCount}</td>
                <td style={styles.td}>{row.highestPriority}</td>
                <td style={styles.td}>{row.highestRiskLevel}</td>
                <td style={styles.td}>
                  {row.assignedOwners.length > 0 ? row.assignedOwners.join(", ") : "unassigned"}
                </td>
                <td style={styles.td}>{formatDate(row.nextTouchAt)}</td>
                <td style={styles.td}>{row.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
