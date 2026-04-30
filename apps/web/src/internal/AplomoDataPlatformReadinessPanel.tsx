import { useMemo, type CSSProperties } from "react";

import {
  createAplomoDefaultDataInteroperabilityProfiles,
  createAplomoDefaultDataProducts,
  isAplomoEnterpriseDataTarget,
  isAplomoLlmToolSafeForAutomation,
  type AplomoDataProductDefinition,
  type AplomoLlmToolDefinition,
} from "@iyi/domain";

import {
  calculateAplomoOperationalScores,
  evaluateAplomoOperationalAlerts,
} from "@iyi/sync-core";

import { useAplomoOperationsRuntime } from "./AplomoOperationsRuntime.js";

type ReadinessStatus = "ready" | "partial" | "missing";

type ReadinessCheck = {
  id: string;
  label: string;
  status: ReadinessStatus;
  owner: string;
  detail: string;
};

const styles = {
  panel: {
    border: "1px solid rgba(14, 165, 233, 0.28)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(12, 74, 110, 0.48))",
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
    color: "#7dd3fc",
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
    fontSize: 24,
    fontWeight: 950,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 12,
    marginTop: 16,
  },
  card: {
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
  sectionTitle: {
    margin: "20px 0 10px",
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: 900,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 8,
  },
  rowStrong: {
    color: "#f8fafc",
    fontWeight: 900,
    textAlign: "right",
  },
  tableWrap: {
    marginTop: 12,
    overflowX: "auto",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    background: "rgba(2, 6, 23, 0.46)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 980,
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
  pill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(14, 165, 233, 0.12)",
    color: "#bae6fd",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  readyPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(34, 197, 94, 0.12)",
    color: "#86efac",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  partialPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(251, 191, 36, 0.12)",
    color: "#fde68a",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  missingPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(248, 113, 113, 0.12)",
    color: "#fca5a5",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
  progressOuter: {
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
    background: "rgba(148, 163, 184, 0.18)",
    marginTop: 10,
  },
  progressInner: {
    height: "100%",
    borderRadius: 999,
    background: "#38bdf8",
  },
} satisfies Record<string, CSSProperties>;

const statusStyle = (status: ReadinessStatus) => {
  if (status === "ready") {
    return styles.readyPill;
  }

  if (status === "partial") {
    return styles.partialPill;
  }

  return styles.missingPill;
};

const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};

const createDefaultLlmTools = (
  dataProducts: AplomoDataProductDefinition[],
): AplomoLlmToolDefinition[] => {
  const timestamp = new Date().toISOString();
  const aiProductIds = dataProducts
    .filter((product) => product.tier === "feature" || product.aiUsagePolicy !== "blocked")
    .map((product) => product.id);

  return [
    {
      id: "aplomo.llm_tool.operational_diagnosis.v1",
      name: "Operational Diagnosis Tool",
      description:
        "Tool for diagnosing device health, GPS precision, alerts and recommended operational actions.",
      providerFamily: "openai",
      status: "active",
      allowedDataProductIds: aiProductIds,
      allowedDomains: ["device", "connection", "telemetry", "audit", "analytics", "ai"],
      inputSchema: {
        type: "object",
        required: ["companyId", "deviceId"],
      },
      outputSchema: {
        type: "object",
        required: ["summary", "recommendations"],
      },
      requiresHumanApproval: false,
      requiresRedaction: true,
      maxSensitivityAllowed: "confidential",
      riskLevel: "medium",
      auditRequired: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "aplomo.llm_tool.executive_summary.v1",
      name: "Executive Operations Summary Tool",
      description:
        "Tool for generating executive operational summaries from governed gold data products.",
      providerFamily: "claude",
      status: "active",
      allowedDataProductIds: dataProducts
        .filter((product) => product.tier === "gold")
        .map((product) => product.id),
      allowedDomains: ["company", "site", "yard", "device", "telemetry", "analytics"],
      inputSchema: {
        type: "object",
        required: ["companyId", "from", "to"],
      },
      outputSchema: {
        type: "object",
        required: ["summary", "risks", "actions"],
      },
      requiresHumanApproval: false,
      requiresRedaction: true,
      maxSensitivityAllowed: "confidential",
      riskLevel: "low",
      auditRequired: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "aplomo.llm_tool.autonomous_corrective_action.v1",
      name: "Autonomous Corrective Action Tool",
      description:
        "High-risk future tool for autonomous actions. It must require human approval.",
      providerFamily: "custom_llm",
      status: "draft",
      allowedDataProductIds: aiProductIds,
      allowedDomains: ["device", "connection", "telemetry", "audit", "analytics", "ai"],
      inputSchema: {
        type: "object",
        required: ["companyId", "actionIntent"],
      },
      outputSchema: {
        type: "object",
        required: ["proposedAction", "risk"],
      },
      requiresHumanApproval: true,
      requiresRedaction: true,
      maxSensitivityAllowed: "restricted",
      riskLevel: "critical",
      auditRequired: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
};

export function AplomoDataPlatformReadinessPanel() {
  const { snapshot, governedEvents } = useAplomoOperationsRuntime();

  const alertsEvaluation = useMemo(() => {
    return evaluateAplomoOperationalAlerts({
      snapshot,
      governedEvents,
      staleHeartbeatSeconds: 120,
    });
  }, [snapshot, governedEvents]);

  const scoreEvaluation = useMemo(() => {
    return calculateAplomoOperationalScores({
      snapshot,
      governedEvents,
      alerts: alertsEvaluation.alerts,
      companyId: "company_demo_cooper_t_smith",
      siteId: "site_demo_altamira",
    });
  }, [snapshot, governedEvents, alertsEvaluation.alerts]);

  const dataProducts = useMemo(() => createAplomoDefaultDataProducts(), []);
  const interoperabilityProfiles = useMemo(
    () => createAplomoDefaultDataInteroperabilityProfiles(),
    [],
  );
  const llmTools = useMemo(
    () => createDefaultLlmTools(dataProducts),
    [dataProducts],
  );

  const checks = useMemo<ReadinessCheck[]>(() => {
    const hasDataProducts = dataProducts.length > 0;
    const hasEnterpriseTargets = interoperabilityProfiles.some(
      (profile) => profile.enterpriseReady,
    );
    const hasWarehouseTargets = interoperabilityProfiles.some(
      (profile) => profile.target === "snowflake" || profile.target === "databricks",
    );
    const hasBiTargets = interoperabilityProfiles.some(
      (profile) => profile.target === "power_bi" || profile.target === "tableau" || profile.target === "looker",
    );
    const hasLlmTargets = interoperabilityProfiles.some(
      (profile) =>
        profile.target === "openai" ||
        profile.target === "gemini" ||
        profile.target === "claude",
    );
    const allProductsGoverned = dataProducts.every(
      (product) =>
        product.requiresLineage &&
        product.requiresQualityScore &&
        product.requiresRedaction &&
        product.minimumQualityScore >= 0.8,
    );
    const hasExportableData = snapshot.devices.length > 0 && governedEvents.length > 0;
    const hasAlertsAndScores =
      alertsEvaluation.summary.total >= 0 && scoreEvaluation.deviceScores.length > 0;
    const safeLlmTools = llmTools.filter(isAplomoLlmToolSafeForAutomation).length;

    return [
      {
        id: "data-products",
        label: "Data products gobernados",
        status: hasDataProducts && allProductsGoverned ? "ready" : "partial",
        owner: "Data Platform",
        detail: `${dataProducts.length} data products definidos con lineage, calidad, redacción y política IA.`,
      },
      {
        id: "enterprise-targets",
        label: "Targets enterprise",
        status: hasEnterpriseTargets ? "ready" : "missing",
        owner: "Integrations",
        detail: "Excel, Power BI, Snowflake, Databricks, Jupyter, APIs y LLM tooling modelados.",
      },
      {
        id: "warehouse-lakehouse",
        label: "Warehouse / Lakehouse",
        status: hasWarehouseTargets ? "ready" : "missing",
        owner: "Data Engineering",
        detail: "Snowflake y Databricks ya están contemplados como destinos de sincronización.",
      },
      {
        id: "bi",
        label: "BI readiness",
        status: hasBiTargets ? "ready" : "missing",
        owner: "Analytics",
        detail: "Power BI y otras herramientas BI pueden consumir gold data products.",
      },
      {
        id: "llm-tools",
        label: "LLM tooling",
        status: hasLlmTargets && safeLlmTools > 0 ? "ready" : "partial",
        owner: "AI Platform",
        detail: `${safeLlmTools} herramientas LLM son seguras para automatización supervisada.`,
      },
      {
        id: "exports",
        label: "Exportabilidad local",
        status: hasExportableData ? "ready" : "partial",
        owner: "Product Engineering",
        detail: "CSV, JSON, NDJSON y GeoJSON exportables desde el panel interno.",
      },
      {
        id: "ops-score",
        label: "Scores y alertas",
        status: hasAlertsAndScores ? "ready" : "partial",
        owner: "Operations Intelligence",
        detail: "Score operativo y alertas calculadas ya existen sobre el runtime.",
      },
      {
        id: "production-backend",
        label: "Backend productivo",
        status: "missing",
        owner: "Platform Engineering",
        detail: "Falta persistencia real, auth, RLS, endpoints, jobs y conectores ejecutables.",
      },
    ];
  }, [
    dataProducts,
    interoperabilityProfiles,
    llmTools,
    snapshot.devices.length,
    governedEvents.length,
    alertsEvaluation.summary.total,
    scoreEvaluation.deviceScores.length,
  ]);

  const readinessScore = useMemo(() => {
    const points = checks.reduce((sum, check) => {
      if (check.status === "ready") {
        return sum + 1;
      }

      if (check.status === "partial") {
        return sum + 0.5;
      }

      return sum;
    }, 0);

    return (points / checks.length) * 100;
  }, [checks]);

  const enterpriseTargets = interoperabilityProfiles.filter(
    isAplomoEnterpriseDataTarget,
  );

  return (
    <section style={styles.panel} aria-label="Data Platform Readiness">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Data Platform Readiness</p>
          <h2 style={styles.title}>Preparación enterprise de datos, conectores e IA</h2>
          <p style={styles.text}>
            Vista estratégica para saber qué tan listo está Aplomo para analistas,
            ingeniería de datos, ciencia de datos, Power BI, Snowflake, Databricks,
            Jupyter y LLM tools tipo OpenAI, Gemini y Claude.
          </p>
        </div>

        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Readiness global</p>
          <p style={styles.metricValue}>{formatPercent(readinessScore)}</p>
          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${readinessScore}%` }} />
          </div>
        </div>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Data products</p>
          <p style={styles.metricValue}>{dataProducts.length}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Interop profiles</p>
          <p style={styles.metricValue}>{interoperabilityProfiles.length}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Enterprise targets</p>
          <p style={styles.metricValue}>{enterpriseTargets.length}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>LLM tools</p>
          <p style={styles.metricValue}>{llmTools.length}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Governed events</p>
          <p style={styles.metricValue}>{governedEvents.length}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Site score</p>
          <p style={styles.metricValue}>{scoreEvaluation.siteScore.overallScore}</p>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Readiness checklist</h3>
      <div style={styles.grid}>
        {checks.map((check) => (
          <article key={check.id} style={styles.card}>
            <h3 style={styles.cardTitle}>{check.label}</h3>
            <div style={styles.row}>
              <span>Estado</span>
              <strong style={styles.rowStrong}>
                <span style={statusStyle(check.status)}>{check.status}</span>
              </strong>
            </div>
            <div style={styles.row}>
              <span>Owner</span>
              <strong style={styles.rowStrong}>{check.owner}</strong>
            </div>
            <p style={styles.text}>{check.detail}</p>
          </article>
        ))}
      </div>

      <h3 style={styles.sectionTitle}>Data products</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Producto</th>
              <th style={styles.th}>Tier</th>
              <th style={styles.th}>Sensibilidad</th>
              <th style={styles.th}>IA</th>
              <th style={styles.th}>Targets</th>
              <th style={styles.th}>Formatos</th>
              <th style={styles.th}>Calidad mínima</th>
            </tr>
          </thead>
          <tbody>
            {dataProducts.map((product) => (
              <tr key={product.id}>
                <td style={styles.td}>
                  <strong>{product.name}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>{product.id}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.pill}>{product.tier}</span>
                </td>
                <td style={styles.td}>{product.sensitivity}</td>
                <td style={styles.td}>{product.aiUsagePolicy}</td>
                <td style={styles.td}>{product.targetConsumers.join(", ")}</td>
                <td style={styles.td}>{product.supportedFormats.join(", ")}</td>
                <td style={styles.td}>{product.minimumQualityScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={styles.sectionTitle}>LLM tools readiness</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tool</th>
              <th style={styles.th}>Provider</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Riesgo</th>
              <th style={styles.th}>Human approval</th>
              <th style={styles.th}>Redacción</th>
              <th style={styles.th}>Audit</th>
              <th style={styles.th}>Safe automation</th>
            </tr>
          </thead>
          <tbody>
            {llmTools.map((tool) => (
              <tr key={tool.id}>
                <td style={styles.td}>
                  <strong>{tool.name}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>{tool.id}</span>
                </td>
                <td style={styles.td}>{tool.providerFamily}</td>
                <td style={styles.td}>{tool.status}</td>
                <td style={styles.td}>{tool.riskLevel}</td>
                <td style={styles.td}>{tool.requiresHumanApproval ? "sí" : "no"}</td>
                <td style={styles.td}>{tool.requiresRedaction ? "sí" : "no"}</td>
                <td style={styles.td}>{tool.auditRequired ? "sí" : "no"}</td>
                <td style={styles.td}>
                  <span
                    style={
                      isAplomoLlmToolSafeForAutomation(tool)
                        ? styles.readyPill
                        : styles.partialPill
                    }
                  >
                    {isAplomoLlmToolSafeForAutomation(tool) ? "sí" : "no"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={styles.sectionTitle}>Conectores enterprise previstos</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Target</th>
              <th style={styles.th}>Uso</th>
              <th style={styles.th}>Formatos</th>
              <th style={styles.th}>Entrega</th>
              <th style={styles.th}>Tier</th>
              <th style={styles.th}>Governance</th>
            </tr>
          </thead>
          <tbody>
            {enterpriseTargets.map((profile) => (
              <tr key={profile.id}>
                <td style={styles.td}>
                  <span style={styles.pill}>{profile.label}</span>
                </td>
                <td style={styles.td}>{profile.description}</td>
                <td style={styles.td}>{profile.supportedFormats.join(", ")}</td>
                <td style={styles.td}>{profile.deliveryModes.join(", ")}</td>
                <td style={styles.td}>{profile.recommendedTier}</td>
                <td style={styles.td}>
                  contract: {profile.requiresDataContract ? "sí" : "no"} · lineage:{" "}
                  {profile.requiresLineage ? "sí" : "no"} · quality:{" "}
                  {profile.requiresQualityScore ? "sí" : "no"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
