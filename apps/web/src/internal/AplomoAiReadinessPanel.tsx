import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  aplomoAiPacketKinds,
  aplomoAiPacketSensitivityLevels,
  buildAplomoCustomerAiPromptContext,
  createAplomoAiReadinessPacket,
  loadAplomoAiReadinessContext,
  updateAplomoAiReadinessPacketStatus,
  type AplomoAiPacketKind,
  type AplomoAiPacketSensitivity,
  type AplomoAiReadinessContext,
} from "../integrations/aplomoAiReadinessRepository.js";

const styles = {
  panel: {
    border: "1px solid rgba(129, 140, 248, 0.36)",
    borderRadius: 24,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(55, 48, 163, 0.40))",
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
    color: "#c7d2fe",
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
    background: "#818cf8",
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
    minHeight: 180,
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
    minWidth: 1260,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#c7d2fe",
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

const sensitivityStyle = (value: string): CSSProperties => {
  if (value === "restricted" || value === "confidential") {
    return styles.dangerPill;
  }

  if (value === "internal") {
    return styles.warningPill;
  }

  return styles.okPill;
};

const statusStyle = (value: string): CSSProperties => {
  if (value === "approved") {
    return styles.okPill;
  }

  if (value === "archived") {
    return styles.neutralPill;
  }

  return styles.warningPill;
};

const companyName = (
  context: AplomoAiReadinessContext | null,
  companyId: string | null,
): string => {
  if (!companyId) {
    return "platform-wide";
  }

  return (
    context?.supportContext.companies.find((company) => company.id === companyId)?.name ??
    companyId
  );
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

export function AplomoAiReadinessPanel() {
  const [context, setContext] = useState<AplomoAiReadinessContext | null>(null);
  const [companyId, setCompanyId] = useState("");
  const [packetKind, setPacketKind] =
    useState<AplomoAiPacketKind>("customer_success_context");
  const [sensitivity, setSensitivity] =
    useState<AplomoAiPacketSensitivity>("internal");
  const [preview, setPreview] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const load = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoAiReadinessContext();
      setContext(result);

      if (!companyId && result.supportContext.companies[0]) {
        setCompanyId(result.supportContext.companies[0].id);
      }

      setStatusMessage(`Loaded ${result.packets.length} AI readiness packets.`);
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
    const packets = context?.packets ?? [];

    return {
      packets: packets.length,
      draft: packets.filter((packet) => packet.status === "draft").length,
      approved: packets.filter((packet) => packet.status === "approved").length,
      confidential: packets.filter(
        (packet) =>
          packet.sensitivity === "confidential" || packet.sensitivity === "restricted",
      ).length,
      companies: new Set(
        packets
          .map((packet) => packet.company_id)
          .filter((value): value is string => Boolean(value)),
      ).size,
    };
  }, [context?.packets]);

  const buildPreview = () => {
    if (!context || !companyId) {
      setErrorMessage("Load context and select a company first.");
      return;
    }

    setErrorMessage("");

    try {
      const generated = buildAplomoCustomerAiPromptContext({
        context,
        companyId,
        packetKind,
      });

      setPreview(generated.promptContext);
      setStatusMessage("Preview generated locally. Not persisted yet.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const persistPacket = async () => {
    if (!context || !companyId) {
      setErrorMessage("Load context and select a company first.");
      return;
    }

    setIsBusy(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const generated = buildAplomoCustomerAiPromptContext({
        context,
        companyId,
        packetKind,
      });

      const created = await createAplomoAiReadinessPacket({
        companyId,
        packetKind,
        sensitivity,
        title: generated.title,
        purpose: generated.purpose,
        promptContext: generated.promptContext,
        dataSummary: generated.dataSummary,
        governanceTags: generated.governanceTags,
        allowedModelFamilies: generated.allowedModelFamilies,
        redactionNotes: generated.redactionNotes,
      });

      setPreview(created.prompt_context);
      setStatusMessage(`AI readiness packet created: ${created.id}`);
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const exportPreview = () => {
    if (!preview) {
      setErrorMessage("Generate a preview first.");
      return;
    }

    downloadTextFile(
      `aplomo-ai-readiness-preview-${dateStamp()}.txt`,
      preview,
      "text/plain",
    );
    setStatusMessage("Preview exported.");
  };

  const exportPacketJson = (packetId: string) => {
    const packet = context?.packets.find((item) => item.id === packetId);

    if (!packet) {
      setErrorMessage("Packet not found.");
      return;
    }

    downloadTextFile(
      `aplomo-ai-readiness-packet-${packet.id}-${dateStamp()}.json`,
      JSON.stringify(packet, null, 2),
      "application/json",
    );
    setStatusMessage(`Packet exported: ${packet.id}`);
  };

  const approvePacket = async (packetId: string) => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      await updateAplomoAiReadinessPacketStatus({
        packetId,
        status: "approved",
      });

      setStatusMessage(`Packet approved: ${packetId}`);
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section style={styles.panel} aria-label="Aplomo AI readiness layer">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Aplomo AI Readiness Layer MVP</p>
          <h2 style={styles.title}>Context packets gobernados para LLMs y agentes</h2>
          <p style={styles.text}>
            Prepara contexto estructurado y auditable para IA sin exponer llaves,
            secretos ni datos sensibles sin revisión humana. Es la base para OpenAI,
            Gemini, Claude, agentes internos, análisis y automatización futura.
          </p>
        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          disabled={isBusy}
          onClick={() => void load()}
        >
          {isBusy ? "Loading..." : "Reload AI context"}
        </button>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Packets</p>
          <p style={styles.metricValue}>{metrics.packets}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Draft</p>
          <p style={styles.metricValue}>{metrics.draft}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Approved</p>
          <p style={styles.metricValue}>{metrics.approved}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Sensitive</p>
          <p style={styles.metricValue}>{metrics.confidential}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Companies</p>
          <p style={styles.metricValue}>{metrics.companies}</p>
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
            If the table does not exist, apply the AI readiness migration in Supabase SQL Editor.
          </p>
        </div>
      ) : null}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Create governed AI context packet</h3>

        <div style={styles.grid}>
          <label style={styles.label}>
            Company
            <select
              style={styles.input}
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
            >
              {(context?.supportContext.companies ?? []).map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Packet kind
            <select
              style={styles.input}
              value={packetKind}
              onChange={(event) =>
                setPacketKind(event.target.value as AplomoAiPacketKind)
              }
            >
              {aplomoAiPacketKinds.map((item) => (
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
                setSensitivity(event.target.value as AplomoAiPacketSensitivity)
              }
            >
              {aplomoAiPacketSensitivityLevels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.button}
            disabled={isBusy || !companyId}
            onClick={buildPreview}
          >
            Build preview
          </button>

          <button
            type="button"
            style={styles.button}
            disabled={isBusy || !companyId}
            onClick={() => void persistPacket()}
          >
            Persist packet
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            disabled={!preview}
            onClick={exportPreview}
          >
            Export preview TXT
          </button>
        </div>

        <p style={styles.text}>
          Este paquete no llama todavía a ningún LLM. Solo prepara contexto gobernado,
          auditable y exportable. La integración directa con proveedores va después.
        </p>
      </div>

      {preview ? (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Prompt context preview</h3>
          <textarea style={styles.textarea} value={preview} readOnly />
        </div>
      ) : null}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Kind</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Sensitivity</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Governance</th>
              <th style={styles.th}>Models</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(context?.packets ?? []).map((packet) => (
              <tr key={packet.id}>
                <td style={styles.td}>
                  <strong>{companyName(context, packet.company_id)}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>
                    {packet.company_id ?? "platform-wide"}
                  </span>
                </td>
                <td style={styles.td}>{packet.packet_kind}</td>
                <td style={styles.td}>
                  <span style={statusStyle(packet.status)}>{packet.status}</span>
                </td>
                <td style={styles.td}>
                  <span style={sensitivityStyle(packet.sensitivity)}>
                    {packet.sensitivity}
                  </span>
                </td>
                <td style={styles.td}>{packet.title}</td>
                <td style={styles.td}>{packet.governance_tags.join(", ")}</td>
                <td style={styles.td}>{packet.allowed_model_families.join(", ")}</td>
                <td style={styles.td}>{new Date(packet.created_at).toLocaleString()}</td>
                <td style={styles.td}>
                  <div style={styles.buttonRow}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => exportPacketJson(packet.id)}
                    >
                      Export JSON
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      disabled={isBusy || packet.status === "approved"}
                      onClick={() => void approvePacket(packet.id)}
                    >
                      Approve
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
