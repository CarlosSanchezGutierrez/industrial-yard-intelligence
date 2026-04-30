import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  aplomoAiGovernanceEventTypes,
  aplomoAiGovernanceRiskLevels,
  aplomoAiPromptSurfaces,
  createAplomoAiGovernanceEvent,
  createAplomoAiPrompt,
  loadAplomoAiGovernanceContext,
  updateAplomoAiPromptStatus,
  type AplomoAiGovernanceContext,
  type AplomoAiGovernanceEventType,
  type AplomoAiGovernanceRiskLevel,
  type AplomoAiPromptSurface,
} from "../integrations/aplomoAiGovernanceRepository.js";
import { aplomoAiPacketSensitivityLevels } from "../integrations/aplomoAiReadinessRepository.js";

const styles = {
  panel: {
    border: "1px solid rgba(217, 70, 239, 0.36)",
    borderRadius: 24,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(112, 26, 117, 0.40))",
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
    color: "#f5d0fe",
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
    background: "#d946ef",
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
    minHeight: 110,
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.32)",
    background: "rgba(2, 6, 23, 0.72)",
    color: "#f8fafc",
    padding: "10px 12px",
    outline: "none",
    resize: "vertical",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 12,
    lineHeight: 1.5,
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
    minWidth: 1300,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#f5d0fe",
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

const pillForStatus = (value: string): CSSProperties => {
  if (value === "approved") {
    return styles.okPill;
  }

  if (value === "draft") {
    return styles.warningPill;
  }

  if (value === "deprecated") {
    return styles.dangerPill;
  }

  return styles.neutralPill;
};

const pillForSensitivity = (value: string): CSSProperties => {
  if (value === "restricted" || value === "confidential") {
    return styles.dangerPill;
  }

  if (value === "internal") {
    return styles.warningPill;
  }

  return styles.okPill;
};

const csvList = (value: string): string[] => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export function AplomoAiGovernancePromptRegistryPanel() {
  const [context, setContext] = useState<AplomoAiGovernanceContext | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [promptKey, setPromptKey] = useState("customer_success_triage");
  const [version, setVersion] = useState(1);
  const [surface, setSurface] =
    useState<AplomoAiPromptSurface>("aplomo_super_admin");
  const [sensitivity, setSensitivity] = useState<
    "public" | "internal" | "confidential" | "restricted"
  >("internal");
  const [title, setTitle] = useState("Customer success triage prompt");
  const [description, setDescription] = useState(
    "Governed prompt for internal customer success triage.",
  );
  const [systemPrompt, setSystemPrompt] = useState(
    "You are an internal Aplomo Systems AI assistant. Use only provided context. Do not invent facts. Do not expose secrets.",
  );
  const [userPromptTemplate, setUserPromptTemplate] = useState(
    "Analyze the customer context and return: current state, risks, next actions, data gaps, and what should not be automated yet.",
  );
  const [allowedModels, setAllowedModels] = useState("openai, anthropic, google");
  const [governanceTags, setGovernanceTags] = useState(
    "internal_only, no_secrets, human_review_required",
  );
  const [manualEventSummary, setManualEventSummary] = useState(
    "Manual AI governance review completed.",
  );
  const [manualEventType, setManualEventType] =
    useState<AplomoAiGovernanceEventType>("governance_review");
  const [manualRiskLevel, setManualRiskLevel] =
    useState<AplomoAiGovernanceRiskLevel>("none");

  const load = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoAiGovernanceContext();
      setContext(result);
      setStatusMessage(
        `Loaded ${result.prompts.length} prompts and ${result.events.length} governance events.`,
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

  const metrics = useMemo(() => {
    const prompts = context?.prompts ?? [];
    const events = context?.events ?? [];

    return {
      prompts: prompts.length,
      approved: prompts.filter((item) => item.status === "approved").length,
      draft: prompts.filter((item) => item.status === "draft").length,
      sensitive: prompts.filter(
        (item) =>
          item.sensitivity === "confidential" || item.sensitivity === "restricted",
      ).length,
      events: events.length,
      riskEvents: events.filter(
        (item) => item.risk_level === "risk" || item.risk_level === "critical",
      ).length,
    };
  }, [context?.events, context?.prompts]);

  const createPrompt = async () => {
    setIsBusy(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const created = await createAplomoAiPrompt({
        promptKey,
        version,
        surface,
        sensitivity,
        title,
        description,
        systemPrompt,
        userPromptTemplate,
        requiredContext: {
          healthSnapshot: true,
          supportWorkflows: true,
          companySummary: true,
          humanReviewRequired: true,
        },
        allowedModelFamilies: csvList(allowedModels),
        governanceTags: csvList(governanceTags),
      });

      setStatusMessage(`Prompt created: ${created.prompt_key} v${created.version}`);
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const approvePrompt = async (promptId: string) => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      await updateAplomoAiPromptStatus({
        promptId,
        status: "approved",
        approvalNotes: "Approved from Aplomo AI Governance MVP.",
      });
      setStatusMessage(`Prompt approved: ${promptId}`);
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const deprecatePrompt = async (promptId: string) => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      await updateAplomoAiPromptStatus({
        promptId,
        status: "deprecated",
        approvalNotes: "Deprecated from Aplomo AI Governance MVP.",
      });
      setStatusMessage(`Prompt deprecated: ${promptId}`);
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const createManualEvent = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      await createAplomoAiGovernanceEvent({
        companyId: null,
        readinessPacketId: null,
        promptRegistryId: null,
        eventType: manualEventType,
        riskLevel: manualRiskLevel,
        eventSummary: manualEventSummary,
        metadata: {
          source: "manual_governance_event",
        },
      });
      setStatusMessage("Manual governance event created.");
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section style={styles.panel} aria-label="AI governance prompt registry">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>AI Governance Audit + Prompt Registry MVP</p>
          <h2 style={styles.title}>Prompts versionados y eventos auditables</h2>
          <p style={styles.text}>
            Registra prompts por version, surface, sensibilidad, modelos permitidos,
            tags de gobierno y eventos auditables antes de conectar agentes reales.
          </p>
        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          disabled={isBusy}
          onClick={() => void load()}
        >
          {isBusy ? "Loading..." : "Reload governance"}
        </button>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Prompts</p>
          <p style={styles.metricValue}>{metrics.prompts}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Approved</p>
          <p style={styles.metricValue}>{metrics.approved}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Draft</p>
          <p style={styles.metricValue}>{metrics.draft}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Sensitive</p>
          <p style={styles.metricValue}>{metrics.sensitive}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Events</p>
          <p style={styles.metricValue}>{metrics.events}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Risk events</p>
          <p style={styles.metricValue}>{metrics.riskEvents}</p>
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
            If the tables do not exist, apply the AI governance migration in Supabase SQL Editor.
          </p>
        </div>
      ) : null}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Create prompt registry entry</h3>

        <div style={styles.grid}>
          <label style={styles.label}>
            Prompt key
            <input
              style={styles.input}
              value={promptKey}
              onChange={(event) => setPromptKey(event.target.value)}
            />
          </label>

          <label style={styles.label}>
            Version
            <input
              style={styles.input}
              type="number"
              min={1}
              value={version}
              onChange={(event) => setVersion(Number(event.target.value))}
            />
          </label>

          <label style={styles.label}>
            Surface
            <select
              style={styles.input}
              value={surface}
              onChange={(event) =>
                setSurface(event.target.value as AplomoAiPromptSurface)
              }
            >
              {aplomoAiPromptSurfaces.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Sensitivity
            <select
              style={styles.input}
              value={sensitivity}
              onChange={(event) =>
                setSensitivity(
                  event.target.value as
                    | "public"
                    | "internal"
                    | "confidential"
                    | "restricted",
                )
              }
            >
              {aplomoAiPacketSensitivityLevels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Title
            <input
              style={styles.input}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label style={styles.label}>
            Allowed model families
            <input
              style={styles.input}
              value={allowedModels}
              onChange={(event) => setAllowedModels(event.target.value)}
            />
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={styles.label}>
            Description
            <textarea
              style={styles.textarea}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
        </div>

        <div style={styles.grid}>
          <label style={styles.label}>
            System prompt
            <textarea
              style={styles.textarea}
              value={systemPrompt}
              onChange={(event) => setSystemPrompt(event.target.value)}
            />
          </label>

          <label style={styles.label}>
            User prompt template
            <textarea
              style={styles.textarea}
              value={userPromptTemplate}
              onChange={(event) => setUserPromptTemplate(event.target.value)}
            />
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={styles.label}>
            Governance tags
            <input
              style={styles.input}
              value={governanceTags}
              onChange={(event) => setGovernanceTags(event.target.value)}
            />
          </label>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.button}
            disabled={isBusy}
            onClick={() => void createPrompt()}
          >
            Create prompt
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Manual governance event</h3>

        <div style={styles.grid}>
          <label style={styles.label}>
            Event type
            <select
              style={styles.input}
              value={manualEventType}
              onChange={(event) =>
                setManualEventType(event.target.value as AplomoAiGovernanceEventType)
              }
            >
              {aplomoAiGovernanceEventTypes.map((item) => (
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
              value={manualRiskLevel}
              onChange={(event) =>
                setManualRiskLevel(event.target.value as AplomoAiGovernanceRiskLevel)
              }
            >
              {aplomoAiGovernanceRiskLevels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={styles.label}>
            Summary
            <textarea
              style={styles.textarea}
              value={manualEventSummary}
              onChange={(event) => setManualEventSummary(event.target.value)}
            />
          </label>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.button}
            disabled={isBusy}
            onClick={() => void createManualEvent()}
          >
            Create governance event
          </button>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Prompt</th>
              <th style={styles.th}>Version</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Surface</th>
              <th style={styles.th}>Sensitivity</th>
              <th style={styles.th}>Models</th>
              <th style={styles.th}>Tags</th>
              <th style={styles.th}>Updated</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(context?.prompts ?? []).map((prompt) => (
              <tr key={prompt.id}>
                <td style={styles.td}>
                  <strong>{prompt.title}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>
                    {prompt.prompt_key}
                  </span>
                </td>
                <td style={styles.td}>{prompt.version}</td>
                <td style={styles.td}>
                  <span style={pillForStatus(prompt.status)}>{prompt.status}</span>
                </td>
                <td style={styles.td}>{prompt.surface}</td>
                <td style={styles.td}>
                  <span style={pillForSensitivity(prompt.sensitivity)}>
                    {prompt.sensitivity}
                  </span>
                </td>
                <td style={styles.td}>{prompt.allowed_model_families.join(", ")}</td>
                <td style={styles.td}>{prompt.governance_tags.join(", ")}</td>
                <td style={styles.td}>{new Date(prompt.updated_at).toLocaleString()}</td>
                <td style={styles.td}>
                  <div style={styles.buttonRow}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      disabled={isBusy || prompt.status === "approved"}
                      onClick={() => void approvePrompt(prompt.id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      disabled={isBusy || prompt.status === "deprecated"}
                      onClick={() => void deprecatePrompt(prompt.id)}
                    >
                      Deprecate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Event</th>
              <th style={styles.th}>Risk</th>
              <th style={styles.th}>Summary</th>
              <th style={styles.th}>Prompt ID</th>
              <th style={styles.th}>Packet ID</th>
              <th style={styles.th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {(context?.events ?? []).map((event) => (
              <tr key={event.id}>
                <td style={styles.td}>{event.event_type}</td>
                <td style={styles.td}>
                  <span
                    style={
                      event.risk_level === "critical" || event.risk_level === "risk"
                        ? styles.dangerPill
                        : event.risk_level === "watch"
                          ? styles.warningPill
                          : styles.okPill
                    }
                  >
                    {event.risk_level}
                  </span>
                </td>
                <td style={styles.td}>{event.event_summary}</td>
                <td style={styles.td}>
                  <span style={styles.mono}>{event.prompt_registry_id ?? "none"}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.mono}>{event.readiness_packet_id ?? "none"}</span>
                </td>
                <td style={styles.td}>{new Date(event.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
