import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  aplomoSupportWorkflowPriorities,
  aplomoSupportWorkflowRiskLevels,
  aplomoSupportWorkflowStatuses,
  createAplomoPlatformSupportWorkflow,
  loadAplomoPlatformSupportWorkflowContext,
  updateAplomoPlatformSupportWorkflow,
  type AplomoPlatformSupportWorkflowContext,
  type AplomoPlatformSupportWorkflowRow,
  type AplomoSupportWorkflowPriority,
  type AplomoSupportWorkflowRiskLevel,
  type AplomoSupportWorkflowStatus,
} from "../integrations/aplomoPlatformSupportWorkflowRepository.js";

const styles = {
  panel: {
    border: "1px solid rgba(14, 165, 233, 0.34)",
    borderRadius: 24,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(12, 74, 110, 0.38))",
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
    color: "#bae6fd",
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
    background: "#38bdf8",
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    marginTop: 14,
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
  textarea: {
    width: "100%",
    minHeight: 90,
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.32)",
    background: "rgba(2, 6, 23, 0.72)",
    color: "#f8fafc",
    padding: "10px 12px",
    outline: "none",
    resize: "vertical",
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
    minWidth: 1320,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#bae6fd",
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
  cardTitle: {
    margin: "0 0 10px",
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: 950,
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

const emptyToNull = (value: string): string | null => {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
};

const dateTimeLocalToIsoOrNull = (value: string): string | null => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);

  if (!Number.isFinite(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return date.toISOString();
};

const pillForPriority = (priority: string): CSSProperties => {
  if (priority === "urgent" || priority === "high") {
    return styles.dangerPill;
  }

  if (priority === "medium") {
    return styles.warningPill;
  }

  return styles.neutralPill;
};

const pillForRisk = (risk: string): CSSProperties => {
  if (risk === "critical" || risk === "risk") {
    return styles.dangerPill;
  }

  if (risk === "watch") {
    return styles.warningPill;
  }

  return styles.okPill;
};

const companyName = (
  context: AplomoPlatformSupportWorkflowContext | null,
  companyId: string,
): string => {
  return context?.companies.find((company) => company.id === companyId)?.name ?? companyId;
};

const profileLabel = (
  context: AplomoPlatformSupportWorkflowContext | null,
  profileId: string | null,
): string => {
  if (!profileId) {
    return "unassigned";
  }

  const profile = context?.profiles.find((item) => item.id === profileId);

  return profile?.email ?? profile?.display_name ?? profileId;
};

const formatDate = (value: string | null): string => {
  if (!value) {
    return "not set";
  }

  return new Date(value).toLocaleString();
};

export function AplomoPlatformSupportWorkflowPanel() {
  const [context, setContext] =
    useState<AplomoPlatformSupportWorkflowContext | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [companyId, setCompanyId] = useState("");
  const [assignedToProfileId, setAssignedToProfileId] = useState("");
  const [status, setStatus] = useState<AplomoSupportWorkflowStatus>("open");
  const [priority, setPriority] = useState<AplomoSupportWorkflowPriority>("medium");
  const [riskLevel, setRiskLevel] = useState<AplomoSupportWorkflowRiskLevel>("watch");
  const [title, setTitle] = useState("Customer follow-up");
  const [notes, setNotes] = useState("");
  const [nextTouchAt, setNextTouchAt] = useState("");

  const load = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoPlatformSupportWorkflowContext();
      setContext(result);

      if (!companyId && result.companies[0]) {
        setCompanyId(result.companies[0].id);
      }

      setStatusMessage(`Loaded ${result.workflows.length} support workflows.`);
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
    const workflows = context?.workflows ?? [];

    return {
      total: workflows.length,
      open: workflows.filter((item) => item.status === "open").length,
      inProgress: workflows.filter((item) => item.status === "in_progress").length,
      blocked: workflows.filter((item) => item.status === "blocked").length,
      urgent: workflows.filter((item) => item.priority === "urgent").length,
      critical: workflows.filter((item) => item.risk_level === "critical").length,
    };
  }, [context?.workflows]);

  const createWorkflow = async () => {
    if (!companyId) {
      setErrorMessage("Select a company first.");
      return;
    }

    setIsBusy(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await createAplomoPlatformSupportWorkflow({
        companyId,
        assignedToProfileId: emptyToNull(assignedToProfileId),
        status,
        priority,
        riskLevel,
        title,
        notes,
        nextTouchAt: dateTimeLocalToIsoOrNull(nextTouchAt),
      });

      setStatusMessage("Support workflow created.");
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const quickUpdateWorkflow = async (
    workflow: AplomoPlatformSupportWorkflowRow,
    nextStatus: AplomoSupportWorkflowStatus,
  ) => {
    setIsBusy(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await updateAplomoPlatformSupportWorkflow({
        workflowId: workflow.id,
        status: nextStatus,
        priority: workflow.priority,
        riskLevel: workflow.risk_level,
        assignedToProfileId: workflow.assigned_to_profile_id,
        notes: workflow.notes,
        nextTouchAt: workflow.next_touch_at,
      });

      setStatusMessage(`Workflow updated to ${nextStatus}.`);
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section style={styles.panel} aria-label="Platform support workflow">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Platform Support Workflow MVP</p>
          <h2 style={styles.title}>Customer follow-ups, risk owners and next touch</h2>
          <p style={styles.text}>
            Internal Aplomo workflow for customer success and support. Track risk,
            priority, owner, notes and next contact date for every tenant company.
          </p>
        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          disabled={isBusy}
          onClick={() => void load()}
        >
          {isBusy ? "Loading..." : "Reload workflows"}
        </button>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Total</p>
          <p style={styles.metricValue}>{metrics.total}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Open</p>
          <p style={styles.metricValue}>{metrics.open}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>In progress</p>
          <p style={styles.metricValue}>{metrics.inProgress}</p>
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
          <p style={styles.metricLabel}>Critical risk</p>
          <p style={styles.metricValue}>{metrics.critical}</p>
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
          <p style={styles.text}>
            If the table does not exist, apply the support workflow migration in
            Supabase SQL Editor.
          </p>
        </div>
      ) : null}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Create support workflow</h3>

        <div style={styles.grid}>
          <label style={styles.label}>
            Company
            <select
              style={styles.input}
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
            >
              {(context?.companies ?? []).map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Assigned to
            <select
              style={styles.input}
              value={assignedToProfileId}
              onChange={(event) => setAssignedToProfileId(event.target.value)}
            >
              <option value="">Unassigned</option>
              {(context?.profiles ?? [])
                .filter((profile) =>
                  ["aplomo_owner", "aplomo_admin", "aplomo_support"].includes(
                    profile.platform_role,
                  ),
                )
                .map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.email ?? profile.display_name ?? profile.id}
                  </option>
                ))}
            </select>
          </label>

          <label style={styles.label}>
            Status
            <select
              style={styles.input}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AplomoSupportWorkflowStatus)
              }
            >
              {aplomoSupportWorkflowStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Priority
            <select
              style={styles.input}
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as AplomoSupportWorkflowPriority)
              }
            >
              {aplomoSupportWorkflowPriorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Risk level
            <select
              style={styles.input}
              value={riskLevel}
              onChange={(event) =>
                setRiskLevel(event.target.value as AplomoSupportWorkflowRiskLevel)
              }
            >
              {aplomoSupportWorkflowRiskLevels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Next touch
            <input
              style={styles.input}
              type="datetime-local"
              value={nextTouchAt}
              onChange={(event) => setNextTouchAt(event.target.value)}
            />
          </label>

          <label style={styles.label}>
            Title
            <input
              style={styles.input}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={styles.label}>
            Notes
            <textarea
              style={styles.textarea}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Follow-up notes, risk context, next steps..."
            />
          </label>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.button}
            disabled={isBusy}
            onClick={() => void createWorkflow()}
          >
            Create workflow
          </button>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Risk</th>
              <th style={styles.th}>Assigned</th>
              <th style={styles.th}>Next touch</th>
              <th style={styles.th}>Last touch</th>
              <th style={styles.th}>Notes</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(context?.workflows ?? []).map((workflow) => (
              <tr key={workflow.id}>
                <td style={styles.td}>
                  <strong>{companyName(context, workflow.company_id)}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>
                    {workflow.company_id}
                  </span>
                </td>
                <td style={styles.td}>{workflow.title}</td>
                <td style={styles.td}>
                  <span style={styles.neutralPill}>{workflow.status}</span>
                </td>
                <td style={styles.td}>
                  <span style={pillForPriority(workflow.priority)}>
                    {workflow.priority}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={pillForRisk(workflow.risk_level)}>
                    {workflow.risk_level}
                  </span>
                </td>
                <td style={styles.td}>{profileLabel(context, workflow.assigned_to_profile_id)}</td>
                <td style={styles.td}>{formatDate(workflow.next_touch_at)}</td>
                <td style={styles.td}>{formatDate(workflow.last_touch_at)}</td>
                <td style={styles.td}>{workflow.notes}</td>
                <td style={styles.td}>
                  <div style={styles.buttonRow}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      disabled={isBusy}
                      onClick={() => void quickUpdateWorkflow(workflow, "in_progress")}
                    >
                      In progress
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      disabled={isBusy}
                      onClick={() => void quickUpdateWorkflow(workflow, "resolved")}
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      disabled={isBusy}
                      onClick={() => void quickUpdateWorkflow(workflow, "blocked")}
                    >
                      Block
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
