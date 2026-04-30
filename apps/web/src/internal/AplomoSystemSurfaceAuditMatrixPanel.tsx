import { type CSSProperties } from "react";

type SurfaceStatus = "complete" | "partial" | "missing" | "planned";

type AplomoSurfaceAuditRow = {
  area: string;
  dbTable: string;
  domainContracts: SurfaceStatus;
  rls: SurfaceStatus;
  repository: SurfaceStatus;
  uiSurface: SurfaceStatus;
  crud: SurfaceStatus;
  exportStatus: SurfaceStatus;
  analytics: SurfaceStatus;
  aiReadiness: SurfaceStatus;
  currentValue: string;
  visibleGap: string;
  nextAction: string;
};

const rows: AplomoSurfaceAuditRow[] = [
  {
    area: "Companies / Tenants",
    dbTable: "aplomo_companies",
    domainContracts: "partial",
    rls: "complete",
    repository: "complete",
    uiSurface: "complete",
    crud: "partial",
    exportStatus: "partial",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "Base multi-tenant real para SaaS, Super Admin y customer health.",
    visibleGap: "No hay todavÃ­a tenant management visual completo.",
    nextAction: "Crear Tenant Management Panel con ediciÃ³n controlada.",
  },
  {
    area: "Profiles / Users",
    dbTable: "aplomo_profiles",
    domainContracts: "partial",
    rls: "complete",
    repository: "complete",
    uiSurface: "partial",
    crud: "partial",
    exportStatus: "missing",
    analytics: "partial",
    aiReadiness: "partial",
    currentValue: "Usuarios con platform_role, role y metadata.",
    visibleGap: "No hay panel formal para administrar usuarios internos y usuarios tenant.",
    nextAction: "Crear User & Role Admin Panel.",
  },
  {
    area: "Company Memberships / RBAC",
    dbTable: "aplomo_company_memberships",
    domainContracts: "complete",
    rls: "complete",
    repository: "complete",
    uiSurface: "partial",
    crud: "partial",
    exportStatus: "missing",
    analytics: "partial",
    aiReadiness: "complete",
    currentValue: "Roles tenant, permisos override y scope por empresa.",
    visibleGap: "El poder de RBAC no se ve completo en UI.",
    nextAction: "Exponer matriz de roles, permisos y scopes.",
  },
  {
    area: "Sites / Yards / Plants",
    dbTable: "aplomo_sites",
    domainContracts: "complete",
    rls: "complete",
    repository: "complete",
    uiSurface: "partial",
    crud: "partial",
    exportStatus: "missing",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "Patios, plantas o zonas operativas por tenant.",
    visibleGap: "Falta CRUD visual y vista operativa por site.",
    nextAction: "Crear Site Operations Admin Panel.",
  },
  {
    area: "Devices",
    dbTable: "aplomo_devices",
    domainContracts: "complete",
    rls: "complete",
    repository: "complete",
    uiSurface: "complete",
    crud: "partial",
    exportStatus: "partial",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "GPS, gateways, drones, mÃ³viles y perfiles industriales.",
    visibleGap: "Falta administraciÃ³n visual avanzada por dispositivo.",
    nextAction: "Crear Device Fleet Management Panel.",
  },
  {
    area: "Device Sessions",
    dbTable: "aplomo_device_sessions",
    domainContracts: "complete",
    rls: "complete",
    repository: "partial",
    uiSurface: "partial",
    crud: "missing",
    exportStatus: "missing",
    analytics: "partial",
    aiReadiness: "partial",
    currentValue: "Sesiones activas/histÃ³ricas por dispositivo.",
    visibleGap: "No hay vista timeline por sesiÃ³n.",
    nextAction: "Crear Device Session Timeline.",
  },
  {
    area: "Device Connections",
    dbTable: "aplomo_device_connections",
    domainContracts: "complete",
    rls: "complete",
    repository: "partial",
    uiSurface: "partial",
    crud: "missing",
    exportStatus: "missing",
    analytics: "partial",
    aiReadiness: "partial",
    currentValue: "Conexiones mobile, MQTT, RTK/NTRIP, MAVLink, WiFi, ethernet.",
    visibleGap: "La complejidad tÃ©cnica no se muestra de forma clara.",
    nextAction: "Crear Connectivity Diagnostics Panel.",
  },
  {
    area: "Material Types",
    dbTable: "aplomo_material_types",
    domainContracts: "partial",
    rls: "complete",
    repository: "partial",
    uiSurface: "missing",
    crud: "missing",
    exportStatus: "missing",
    analytics: "partial",
    aiReadiness: "partial",
    currentValue: "Materiales, cÃ³digos y densidad para cÃ¡lculos operativos.",
    visibleGap: "No se ve en UI, aunque es clave para ingenierÃ­a industrial.",
    nextAction: "Crear Material Catalog Panel.",
  },
  {
    area: "Stockpiles",
    dbTable: "aplomo_stockpiles",
    domainContracts: "complete",
    rls: "complete",
    repository: "complete",
    uiSurface: "complete",
    crud: "partial",
    exportStatus: "partial",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "Volumen, peso estimado, material y sitio.",
    visibleGap: "Falta ediciÃ³n visual completa y anÃ¡lisis avanzado.",
    nextAction: "Crear Stockpile Management + Analytics Panel.",
  },
  {
    area: "GPS Captures",
    dbTable: "aplomo_gps_captures",
    domainContracts: "complete",
    rls: "complete",
    repository: "complete",
    uiSurface: "complete",
    crud: "partial",
    exportStatus: "partial",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "Capturas manuales/browser GPS y evidencia operativa.",
    visibleGap: "Falta historial visual detallado por capturista.",
    nextAction: "Crear Capture History & Operator Performance Panel.",
  },
  {
    area: "Latest Device Positions",
    dbTable: "aplomo_latest_device_positions",
    domainContracts: "complete",
    rls: "complete",
    repository: "complete",
    uiSurface: "complete",
    crud: "partial",
    exportStatus: "partial",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "Ãšltima posiciÃ³n viva por dispositivo para mapa y monitoreo.",
    visibleGap: "Falta capa de calidad GPS y confianza visual mÃ¡s clara.",
    nextAction: "Agregar GPS Quality Overlay y precisiÃ³n por fuente.",
  },
  {
    area: "Operational Alerts",
    dbTable: "aplomo_operational_alerts",
    domainContracts: "complete",
    rls: "complete",
    repository: "partial",
    uiSurface: "partial",
    crud: "partial",
    exportStatus: "missing",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "Alertas operativas por severidad, categorÃ­a y dispositivo.",
    visibleGap: "No hay centro de alertas completo.",
    nextAction: "Crear Operational Alert Center.",
  },
  {
    area: "Data Exports",
    dbTable: "aplomo_data_exports",
    domainContracts: "partial",
    rls: "complete",
    repository: "partial",
    uiSurface: "partial",
    crud: "partial",
    exportStatus: "complete",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "Registro de exportaciones y base para Excel/BI/data engineering.",
    visibleGap: "Exports existen en varios paneles, pero no hay Export Center unificado.",
    nextAction: "Crear Data Export Center.",
  },
  {
    area: "Audit Logs",
    dbTable: "aplomo_audit_logs",
    domainContracts: "partial",
    rls: "complete",
    repository: "partial",
    uiSurface: "missing",
    crud: "missing",
    exportStatus: "missing",
    analytics: "partial",
    aiReadiness: "complete",
    currentValue: "Base de trazabilidad para acciones crÃ­ticas.",
    visibleGap: "No se ve el trabajo de auditorÃ­a en UI.",
    nextAction: "Crear Audit Log Viewer.",
  },
  {
    area: "Customer Health Snapshots",
    dbTable: "aplomo_customer_health_snapshots",
    domainContracts: "complete",
    rls: "complete",
    repository: "complete",
    uiSurface: "complete",
    crud: "partial",
    exportStatus: "complete",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "Health score auditable por cliente con historial.",
    visibleGap: "Ya es visible. Falta automatizaciÃ³n programada.",
    nextAction: "Agregar scheduled health snapshot job server-side.",
  },
  {
    area: "Support Workflows",
    dbTable: "aplomo_platform_support_workflows",
    domainContracts: "complete",
    rls: "complete",
    repository: "complete",
    uiSurface: "complete",
    crud: "partial",
    exportStatus: "complete",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "Seguimiento, riesgo, prioridad, owner y next touch por cliente.",
    visibleGap: "Falta ediciÃ³n detallada y comentarios histÃ³ricos.",
    nextAction: "Agregar workflow detail drawer y timeline de notas.",
  },
  {
    area: "Support + Health Crosswalk",
    dbTable: "derived view",
    domainContracts: "partial",
    rls: "complete",
    repository: "complete",
    uiSurface: "complete",
    crud: "planned",
    exportStatus: "complete",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "Cruce entre riesgo real y seguimiento operativo.",
    visibleGap: "Falta convertir recomendaciones en tareas automÃ¡ticas.",
    nextAction: "Crear suggested actions queue.",
  },
  {
    area: "AI Readiness Packets",
    dbTable: "aplomo_ai_readiness_packets",
    domainContracts: "complete",
    rls: "complete",
    repository: "complete",
    uiSurface: "complete",
    crud: "partial",
    exportStatus: "complete",
    analytics: "partial",
    aiReadiness: "complete",
    currentValue: "Context packets gobernados para LLMs/agentes.",
    visibleGap: "TodavÃ­a no conecta con provider gateway.",
    nextAction: "Conectar a LLM Provider Gateway en modo dry-run.",
  },
  {
    area: "AI Prompt Registry",
    dbTable: "aplomo_ai_prompt_registry",
    domainContracts: "complete",
    rls: "complete",
    repository: "complete",
    uiSurface: "complete",
    crud: "partial",
    exportStatus: "missing",
    analytics: "partial",
    aiReadiness: "complete",
    currentValue: "Prompts versionados, surfaces, sensibilidad y modelos permitidos.",
    visibleGap: "Falta diff/version history visual.",
    nextAction: "Crear prompt version history y export JSON.",
  },
  {
    area: "AI Governance Events",
    dbTable: "aplomo_ai_governance_events",
    domainContracts: "complete",
    rls: "complete",
    repository: "complete",
    uiSurface: "complete",
    crud: "partial",
    exportStatus: "missing",
    analytics: "complete",
    aiReadiness: "complete",
    currentValue: "Eventos auditables de gobierno IA.",
    visibleGap: "Falta timeline visual y filtros.",
    nextAction: "Crear AI Governance Timeline.",
  },
  {
    area: "LLM Provider Gateway",
    dbTable: "planned",
    domainContracts: "missing",
    rls: "planned",
    repository: "missing",
    uiSurface: "missing",
    crud: "missing",
    exportStatus: "missing",
    analytics: "planned",
    aiReadiness: "planned",
    currentValue: "AÃºn no existe. Se dejÃ³ correctamente para despuÃ©s de gobernanza.",
    visibleGap: "No hay llamadas server-side a OpenAI/Gemini/Claude.",
    nextAction: "Crear gateway server-side con dry-run, allowlist y audit log.",
  },
];

const styles = {
  panel: {
    border: "1px solid rgba(45, 212, 191, 0.36)",
    borderRadius: 24,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(15, 118, 110, 0.36))",
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
    color: "#99f6e4",
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
    minWidth: 1680,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#99f6e4",
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
  card: {
    marginTop: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
  },
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
} satisfies Record<string, CSSProperties>;

const statusStyle = (status: SurfaceStatus): CSSProperties => {
  if (status === "complete") {
    return styles.okPill;
  }

  if (status === "partial") {
    return styles.warningPill;
  }

  if (status === "missing") {
    return styles.dangerPill;
  }

  return styles.neutralPill;
};

const Status = ({ value }: { value: SurfaceStatus }) => (
  <span style={statusStyle(value)}>{value}</span>
);

export function AplomoSystemSurfaceAuditMatrixPanel() {
  const completeUi = rows.filter((row) => row.uiSurface === "complete").length;
  const partialUi = rows.filter((row) => row.uiSurface === "partial").length;
  const missingUi = rows.filter((row) => row.uiSurface === "missing").length;
  const completeAi = rows.filter((row) => row.aiReadiness === "complete").length;
  const missingExports = rows.filter((row) => row.exportStatus === "missing").length;

  return (
    <section style={styles.panel} aria-label="Aplomo system surface audit matrix">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>End-to-End Surface Audit Matrix MVP</p>
          <h2 style={styles.title}>Backend, datos, contratos, pipeline y UI visible</h2>
          <p style={styles.text}>
            Matriz ejecutiva para demostrar quÃ© existe por detrÃ¡s, quÃ© se consume,
            quÃ© ya se ve en frontend y quÃ© falta exponer para que el valor tÃ©cnico
            sea visible para administradores, operadores, analistas, ingenieros de
            datos, cientÃ­ficos de datos e inversionistas.
          </p>
        </div>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Areas audited</p>
          <p style={styles.metricValue}>{rows.length}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Complete UI</p>
          <p style={styles.metricValue}>{completeUi}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Partial UI</p>
          <p style={styles.metricValue}>{partialUi}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Missing UI</p>
          <p style={styles.metricValue}>{missingUi}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>AI ready</p>
          <p style={styles.metricValue}>{completeAi}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Missing exports</p>
          <p style={styles.metricValue}>{missingExports}</p>
        </div>
      </div>

      <div style={styles.card}>
        <p style={styles.text}>
          Lectura honesta: Aplomo ya tiene una base de datos, RLS, gobierno,
          health scoring, soporte e IA readiness bastante robustos. El hueco
          principal no es solo backend; es productizar visualmente mÃ¡s de lo que
          ya existe para que se vea el trabajo profundo.
        </p>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Area</th>
              <th style={styles.th}>DB / Source</th>
              <th style={styles.th}>Domain / Contracts</th>
              <th style={styles.th}>RLS</th>
              <th style={styles.th}>Repository</th>
              <th style={styles.th}>UI</th>
              <th style={styles.th}>CRUD</th>
              <th style={styles.th}>Export</th>
              <th style={styles.th}>Analytics</th>
              <th style={styles.th}>AI</th>
              <th style={styles.th}>Current value</th>
              <th style={styles.th}>Visible gap</th>
              <th style={styles.th}>Next action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.area}>
                <td style={styles.td}>
                  <strong>{row.area}</strong>
                </td>
                <td style={styles.td}>
                  <span style={styles.mono}>{row.dbTable}</span>
                </td>
                <td style={styles.td}><Status value={row.domainContracts} /></td>
                <td style={styles.td}><Status value={row.rls} /></td>
                <td style={styles.td}><Status value={row.repository} /></td>
                <td style={styles.td}><Status value={row.uiSurface} /></td>
                <td style={styles.td}><Status value={row.crud} /></td>
                <td style={styles.td}><Status value={row.exportStatus} /></td>
                <td style={styles.td}><Status value={row.analytics} /></td>
                <td style={styles.td}><Status value={row.aiReadiness} /></td>
                <td style={styles.td}>{row.currentValue}</td>
                <td style={styles.td}>{row.visibleGap}</td>
                <td style={styles.td}>{row.nextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
