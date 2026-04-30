import { useMemo, useState, type CSSProperties } from "react";

import {
  calculateAplomoOperationalScores,
  createAplomoGovernedDataExport,
  evaluateAplomoOperationalAlerts,
  type AplomoGovernedExportFormat,
  type AplomoGovernedExportKind,
} from "@iyi/sync-core";

import { useAplomoOperationsRuntime } from "./AplomoOperationsRuntime.js";

const styles = {
  panel: {
    border: "1px solid rgba(96, 165, 250, 0.28)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(30, 64, 175, 0.38))",
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
    color: "#93c5fd",
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
  grid: {
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
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: 800,
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
    fontSize: 22,
    fontWeight: 950,
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
    fontSize: 13,
    fontWeight: 900,
  },
  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    color: "#cbd5e1",
    fontSize: 11,
    lineHeight: 1.45,
    maxHeight: 260,
    overflow: "auto",
  },
  pill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(96, 165, 250, 0.12)",
    color: "#bfdbfe",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
} satisfies Record<string, CSSProperties>;

const downloadTextFile = (fileName: string, mimeType: string, content: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
};

export function AplomoGovernedDataExportPanel() {
  const { snapshot, governedEvents } = useAplomoOperationsRuntime();

  const [kind, setKind] = useState<AplomoGovernedExportKind>("governed_events");
  const [format, setFormat] = useState<AplomoGovernedExportFormat>("csv");
  const [includeLineage, setIncludeLineage] = useState(true);
  const [includeQualityMetrics, setIncludeQualityMetrics] = useState(true);
  const [includeAiPolicy, setIncludeAiPolicy] = useState(true);
  const [lastCopied, setLastCopied] = useState("");

  const alerts = useMemo(() => {
    return evaluateAplomoOperationalAlerts({
      snapshot,
      governedEvents,
      staleHeartbeatSeconds: 120,
    }).alerts;
  }, [snapshot, governedEvents]);

  const scores = useMemo(() => {
    return calculateAplomoOperationalScores({
      snapshot,
      governedEvents,
      alerts,
      companyId: "company_demo_cooper_t_smith",
      siteId: "site_demo_altamira",
    }).deviceScores;
  }, [snapshot, governedEvents, alerts]);

  const exportResult = useMemo(() => {
    return createAplomoGovernedDataExport({
      snapshot,
      governedEvents,
      alerts,
      scores,
      kind,
      format,
      includeLineage,
      includeQualityMetrics,
      includeAiPolicy,
    });
  }, [
    snapshot,
    governedEvents,
    alerts,
    scores,
    kind,
    format,
    includeLineage,
    includeQualityMetrics,
    includeAiPolicy,
  ]);

  const preview =
    exportResult.content.length > 4500
      ? `${exportResult.content.slice(0, 4500)}\n...`
      : exportResult.content;

  const copyPreview = async () => {
    try {
      await navigator.clipboard.writeText(exportResult.content);
      setLastCopied(new Date().toLocaleTimeString());
    } catch {
      setLastCopied("no se pudo copiar");
    }
  };

  return (
    <section style={styles.panel} aria-label="Exportación de datos gobernados">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Governed Data Export</p>
          <h2 style={styles.title}>Exportación local de datos gobernados</h2>
          <p style={styles.text}>
            Exporta datos listos para analistas, Power BI, Excel, Python,
            Snowflake, Databricks, APIs y herramientas LLM. Cada salida mantiene
            contrato, calidad, lineage y política de IA cuando aplica.
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.button}
            onClick={() =>
              downloadTextFile(
                exportResult.fileName,
                exportResult.mimeType,
                exportResult.content,
              )
            }
          >
            Descargar archivo
          </button>

          <button type="button" style={styles.secondaryButton} onClick={copyPreview}>
            Copiar contenido
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        <label style={styles.label}>
          Dataset
          <select
            style={styles.input}
            value={kind}
            onChange={(event) => setKind(event.target.value as AplomoGovernedExportKind)}
          >
            <option value="devices">Dispositivos</option>
            <option value="latest_positions">Últimas posiciones</option>
            <option value="telemetry_events">Telemetría</option>
            <option value="governed_events">Eventos gobernados</option>
            <option value="alerts">Alertas</option>
            <option value="scores">Scores</option>
            <option value="full_snapshot">Full snapshot</option>
          </select>
        </label>

        <label style={styles.label}>
          Formato
          <select
            style={styles.input}
            value={format}
            onChange={(event) => setFormat(event.target.value as AplomoGovernedExportFormat)}
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="ndjson">NDJSON</option>
            <option value="geojson">GeoJSON</option>
          </select>
        </label>

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={includeLineage}
            onChange={(event) => setIncludeLineage(event.target.checked)}
          />
          Incluir lineage
        </label>

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={includeQualityMetrics}
            onChange={(event) => setIncludeQualityMetrics(event.target.checked)}
          />
          Incluir calidad
        </label>

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={includeAiPolicy}
            onChange={(event) => setIncludeAiPolicy(event.target.checked)}
          />
          Incluir política IA
        </label>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Archivo</p>
          <p style={styles.metricValue}>
            <span style={styles.pill}>{exportResult.fileName}</span>
          </p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Registros</p>
          <p style={styles.metricValue}>{exportResult.recordCount}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Formato</p>
          <p style={styles.metricValue}>{exportResult.metadata.format}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Targets</p>
          <p style={styles.metricValue}>
            <span style={styles.pill}>
              {exportResult.metadata.intendedTargets.slice(0, 3).join(", ")}
            </span>
          </p>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Metadatos de exportación</h3>
        <pre style={styles.pre}>
          {JSON.stringify(exportResult.metadata, null, 2)}
        </pre>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          Preview {lastCopied ? `· copiado: ${lastCopied}` : ""}
        </h3>
        <pre style={styles.pre}>{preview}</pre>
      </div>
    </section>
  );
}
