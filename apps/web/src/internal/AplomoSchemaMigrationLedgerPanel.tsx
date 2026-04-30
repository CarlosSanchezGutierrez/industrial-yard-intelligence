import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  createAplomoSchemaAuditFinding,
  loadAplomoSchemaGovernanceContext,
  resolveAplomoSchemaAuditFinding,
  seedAplomoSchemaGovernanceBaseline,
  type AplomoSchemaAuditFindingRow,
  type AplomoSchemaGovernanceContext,
} from "../integrations/aplomoSchemaGovernanceRepository.js";

const styles = {
  panel: {
    border: "1px solid rgba(56, 189, 248, 0.36)",
    borderRadius: 24,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(12, 74, 110, 0.42))",
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
    maxWidth: 980,
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
  if (value === "complete" || value === "applied" || value === "resolved") {
    return styles.okPill;
  }

  if (value === "partial" || value === "planned" || value === "expected" || value === "in_progress") {
    return styles.warningPill;
  }

  if (value === "missing" || value === "failed" || value === "critical" || value === "high") {
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

export function AplomoSchemaMigrationLedgerPanel() {
  const [context, setContext] =
    useState<AplomoSchemaGovernanceContext | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const load = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoSchemaGovernanceContext();
      setContext(result);
      setStatusMessage(
        `Loaded ${result.migrationLedger.length} migrations, ${result.auditFindings.length} findings and ${result.capabilityStatuses.length} capability statuses.`,
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
    const migrations = context?.migrationLedger ?? [];
    const findings = context?.auditFindings ?? [];
    const capabilities = context?.capabilityStatuses ?? [];
    const averageReadiness =
      capabilities.length === 0
        ? 0
        : Math.round(
            capabilities.reduce(
              (sum, capability) => sum + capability.readiness_score,
              0,
            ) / capabilities.length,
          );

    return {
      migrations: migrations.length,
      applied: migrations.filter((item) => item.status === "applied").length,
      findings: findings.length,
      openFindings: findings.filter((item) => item.status === "open").length,
      criticalFindings: findings.filter((item) => item.severity === "critical").length,
      capabilities: capabilities.length,
      averageReadiness,
    };
  }, [context]);

  const seedBaseline = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      await seedAplomoSchemaGovernanceBaseline();
      setStatusMessage("Schema governance baseline seeded.");
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const createManualFinding = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      await createAplomoSchemaAuditFinding({
        capabilityId: "schema_migration_ledger",
        findingKind: "manual_note",
        severity: "info",
        objectType: "service",
        objectName: "schema_introspection_service",
        expectedState: {
          desired: "server_side_schema_introspection",
        },
        actualState: {
          current: "manual_sql_and_frontend_repository",
        },
        recommendation:
          "Create a server-side schema introspection service after the ledger is stable.",
        metadata: {
          source: "schema_ledger_panel",
        },
      });

      setStatusMessage("Manual schema audit finding created.");
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const resolveFinding = async (finding: AplomoSchemaAuditFindingRow) => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      await resolveAplomoSchemaAuditFinding({
        findingId: finding.id,
        status: "resolved",
      });

      setStatusMessage(`Finding resolved: ${finding.id}`);
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section style={styles.panel} aria-label="Schema migration ledger">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Schema Migration Ledger MVP</p>
          <h2 style={styles.title}>Migraciones, drift de schema y estado real por capability</h2>
          <p style={styles.text}>
            Este panel convierte las migraciones manuales, hallazgos de schema,
            compatibilidad legacy, policies y readiness técnico en datos auditables.
            Es la base para dejar de adivinar qué existe y qué falta en Supabase.
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.secondaryButton}
            disabled={isBusy}
            onClick={() => void load()}
          >
            {isBusy ? "Loading..." : "Reload schema ledger"}
          </button>

          <button
            type="button"
            style={styles.button}
            disabled={isBusy}
            onClick={() => void seedBaseline()}
          >
            Seed baseline
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            disabled={isBusy}
            onClick={() => void createManualFinding()}
          >
            Create audit note
          </button>
        </div>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Migrations</p>
          <p style={styles.metricValue}>{metrics.migrations}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Applied</p>
          <p style={styles.metricValue}>{metrics.applied}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Findings</p>
          <p style={styles.metricValue}>{metrics.findings}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Open findings</p>
          <p style={styles.metricValue}>{metrics.openFindings}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Critical findings</p>
          <p style={styles.metricValue}>{metrics.criticalFindings}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Capabilities</p>
          <p style={styles.metricValue}>{metrics.capabilities}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Avg readiness</p>
          <p style={styles.metricValue}>{metrics.averageReadiness}%</p>
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
            Si las tablas no existen, aplica la migración SQL:
            supabase/migrations/20260430001100_aplomo_schema_migration_ledger.sql
          </p>
        </div>
      ) : null}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Capability</th>
              <th style={styles.th}>Criticality</th>
              <th style={styles.th}>Readiness</th>
              <th style={styles.th}>Domain</th>
              <th style={styles.th}>Contracts</th>
              <th style={styles.th}>Database</th>
              <th style={styles.th}>RLS</th>
              <th style={styles.th}>Repository</th>
              <th style={styles.th}>Service</th>
              <th style={styles.th}>Audit</th>
              <th style={styles.th}>Export</th>
              <th style={styles.th}>Analytics</th>
              <th style={styles.th}>DQ</th>
              <th style={styles.th}>UI</th>
              <th style={styles.th}>AI</th>
              <th style={styles.th}>Cloud</th>
              <th style={styles.th}>Next actions</th>
            </tr>
          </thead>
          <tbody>
            {(context?.capabilityStatuses ?? []).map((capability) => (
              <tr key={capability.id}>
                <td style={styles.td}>
                  <strong>{capability.capability_name}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>
                    {capability.capability_id}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={pillForStatus(capability.criticality)}>
                    {capability.criticality}
                  </span>
                </td>
                <td style={styles.td}>{capability.readiness_score}%</td>
                <td style={styles.td}><span style={pillForStatus(capability.domain_status)}>{capability.domain_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.contracts_status)}>{capability.contracts_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.database_status)}>{capability.database_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.rls_status)}>{capability.rls_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.repository_status)}>{capability.repository_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.service_status)}>{capability.service_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.audit_status)}>{capability.audit_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.export_status)}>{capability.export_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.analytics_status)}>{capability.analytics_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.data_quality_status)}>{capability.data_quality_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.ui_status)}>{capability.ui_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.ai_governance_status)}>{capability.ai_governance_status}</span></td>
                <td style={styles.td}><span style={pillForStatus(capability.cloud_readiness_status)}>{capability.cloud_readiness_status}</span></td>
                <td style={styles.td}>
                  {Array.isArray(capability.next_actions)
                    ? capability.next_actions.join(" | ")
                    : "not set"}
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
              <th style={styles.th}>Migration</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Source</th>
              <th style={styles.th}>Applied</th>
              <th style={styles.th}>Description</th>
            </tr>
          </thead>
          <tbody>
            {(context?.migrationLedger ?? []).map((migration) => (
              <tr key={migration.id}>
                <td style={styles.td}>
                  <strong>{migration.name}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>
                    {migration.migration_key}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={pillForStatus(migration.status)}>{migration.status}</span>
                </td>
                <td style={styles.td}>{migration.source}</td>
                <td style={styles.td}>{formatDate(migration.applied_at)}</td>
                <td style={styles.td}>{migration.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Finding</th>
              <th style={styles.th}>Capability</th>
              <th style={styles.th}>Severity</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Object</th>
              <th style={styles.th}>Recommendation</th>
              <th style={styles.th}>Detected</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(context?.auditFindings ?? []).map((finding) => (
              <tr key={finding.id}>
                <td style={styles.td}>{finding.finding_kind}</td>
                <td style={styles.td}>{finding.capability_id}</td>
                <td style={styles.td}>
                  <span style={pillForStatus(finding.severity)}>{finding.severity}</span>
                </td>
                <td style={styles.td}>
                  <span style={pillForStatus(finding.status)}>{finding.status}</span>
                </td>
                <td style={styles.td}>
                  <strong>{finding.object_type}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>
                    {finding.object_name}
                  </span>
                </td>
                <td style={styles.td}>{finding.recommendation}</td>
                <td style={styles.td}>{formatDate(finding.detected_at)}</td>
                <td style={styles.td}>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    disabled={isBusy || finding.status === "resolved"}
                    onClick={() => void resolveFinding(finding)}
                  >
                    Resolve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
