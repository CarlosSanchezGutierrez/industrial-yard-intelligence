import { StockpileStatusPanel } from "./components/StockpileStatusPanel.js";
import { StockpileCreatePanel } from "./components/StockpileCreatePanel.js";
import {
  loadCloudApiDashboardSnapshot,
  type CloudApiDashboardSnapshot
} from "./data/api-client.js";
import { industrialDarkTheme, themeToCssVariables } from "@iyi/design-tokens";
import { cooperSmokeSeed, type SmokeStockpile, type SmokeTenantSeed } from "@iyi/seed-data";
import type { CSSProperties, ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  exportDemoPackage,
  exportEdgeSyncStore,
  importDemoPackage,
  importEdgeSyncStore,
  loadCooperSmokeSeed,
  loadDemoExecutiveReport,
  loadEdgeSyncSnapshot,
  registerDemoEvidence,
  resetEdgeDemoState,
  verifyDemoPackageIntegrity,
  verifyUploadedDemoPackage,
  resolveSyncConflict,
  runGuidedDemoScenario,
  submitDemoSyncBatch,
  type EdgeAuditEntry,
  type EdgeAuditSummary,
  type EdgeConflictResolution,
  type EdgeEvidenceItem,
  type EdgeEvidenceSummary,
  type EdgeEvidenceVerification,
  type EdgeDemoExecutiveReport,
  type DemoReadinessReport,
  type EdgeSyncEvent,
  type EdgeSyncSummary,
  type SmokeSeedSource,
  type SubmitSyncDemoResult,
  exportEdgeDbSnapshot,
  loadEdgeDbSummary,
  saveEdgeDbSnapshot,
  type EdgeDbProjectionSummary
} from "./data/edge-client.js";
import "./styles.css";

import { StockpileLifecyclePanel } from "./components/StockpileLifecyclePanel.js";
import { AuditMutationPanel } from "./components/AuditMutationPanel.js";
import { CloudEdgeSyncPanel } from "./components/CloudEdgeSyncPanel.js";
import { DemoCommandCenter } from "./components/DemoCommandCenter.js";
import { DemoNavigationPanel } from "./components/DemoNavigationPanel.js";
import { OperatorWorkflowProgressPanel } from "./components/OperatorWorkflowProgressPanel.js";
function applyThemeVariables(): CSSProperties {
  return themeToCssVariables(industrialDarkTheme) as CSSProperties;
}

function formatTons(value: number): string {
  return new Intl.NumberFormat("es-MX").format(value);
}

function getStatusLabel(status: SmokeStockpile["status"]): string {
  if (status === "validated") {
    return "Validado";
  }

  if (status === "pending_review") {
    return "Pendiente";
  }

  return "Operacional";
}

function getSourceLabel(source: SmokeSeedSource): string {
  if (source === "edge") {
    return "Edge conectado";
  }

  return "Fallback local";
}

function getConflictLabel(event: EdgeSyncEvent): string {
  if (event.conflictType !== undefined && event.conflictType.length > 0) {
    return event.conflictType;
  }

  return "sync_conflict";
}

function getConflictDescription(event: EdgeSyncEvent): string {
  if (event.message !== undefined && event.message.length > 0) {
    return event.message;
  }

  return "El edge detectó que el evento no puede aplicarse automáticamente y requiere revisión.";
}

function shortenHash(hash: string): string {
  if (hash.length <= 16) {
    return hash;
  }

  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

function downloadJsonFile(fileName: string, value: unknown): void {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const packageInputRef = useRef<HTMLInputElement | null>(null);
  const packageImportInputRef = useRef<HTMLInputElement | null>(null);
  const [seed, setSeed] = useState<SmokeTenantSeed>(cooperSmokeSeed);
  const [seedSource, setSeedSource] = useState<SmokeSeedSource>("local_fallback");
  const [seedMessage, setSeedMessage] = useState("Usando seed local inicial.");
  const [cloudApiSnapshot, setCloudApiSnapshot] = useState<CloudApiDashboardSnapshot | null>(null);
  const [cloudApiMessage, setCloudApiMessage] = useState("Sin API cloud cargada todavía.");
  const [isLoadingCloudApi, setIsLoadingCloudApi] = useState(false);  const [isLoadingSeed, setIsLoadingSeed] = useState(true);
  const [syncResult, setSyncResult] = useState<SubmitSyncDemoResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [guidedDemoMessage, setGuidedDemoMessage] = useState(
    "Ejecuta el flujo completo: sync aceptado, conflicto, evidencia y refresh de monitores."
  );
  const [isRunningGuidedDemo, setIsRunningGuidedDemo] = useState(false);
  const [isResettingDemoState, setIsResettingDemoState] = useState(false);
  const [edgeSummary, setEdgeSummary] = useState<EdgeSyncSummary | null>(null);
  const [edgeEvents, setEdgeEvents] = useState<readonly EdgeSyncEvent[]>([]);
  const [conflictResolutions, setConflictResolutions] = useState<readonly EdgeConflictResolution[]>([]);
  const [auditSummary, setAuditSummary] = useState<EdgeAuditSummary | null>(null);
  const [auditEntries, setAuditEntries] = useState<readonly EdgeAuditEntry[]>([]);
  const [evidenceSummary, setEvidenceSummary] = useState<EdgeEvidenceSummary | null>(null);
  const [evidenceItems, setEvidenceItems] = useState<readonly EdgeEvidenceItem[]>([]);
  const [evidenceVerification, setEvidenceVerification] = useState<EdgeEvidenceVerification | null>(null);
  const [demoReadiness, setDemoReadiness] = useState<DemoReadinessReport | null>(null);
  const [demoReport, setDemoReport] = useState<EdgeDemoExecutiveReport | null>(null);
  const [demoReportMessage, setDemoReportMessage] = useState("Sin reporte ejecutivo cargado todavía.");
  const [edgeDbSummary, setEdgeDbSummary] = useState<EdgeDbProjectionSummary | null>(null);
  const [edgeDbMessage, setEdgeDbMessage] = useState("Sin proyección DB cargada todavía.");
  const [isLoadingEdgeDb, setIsLoadingEdgeDb] = useState(false);
  const [isExportingEdgeDbSnapshot, setIsExportingEdgeDbSnapshot] = useState(false);
  const [isSavingEdgeDbSnapshot, setIsSavingEdgeDbSnapshot] = useState(false);  const [isExportingDemoPackage, setIsExportingDemoPackage] = useState(false);
  const [isVerifyingDemoPackage, setIsVerifyingDemoPackage] = useState(false);
  const [isVerifyingUploadedPackage, setIsVerifyingUploadedPackage] = useState(false);
  const [isImportingDemoPackage, setIsImportingDemoPackage] = useState(false);
  const [evidenceMessage, setEvidenceMessage] = useState("Registra evidencia simulada para generar hash SHA-256.");
  const [isRegisteringEvidence, setIsRegisteringEvidence] = useState(false);
  const [edgeMonitorMessage, setEdgeMonitorMessage] = useState("Esperando conexión al edge.");
  const [transferMessage, setTransferMessage] = useState("Exporta o restaura el historial local del edge como JSON.");
  const [isTransferring, setIsTransferring] = useState(false);
  const [resolvingConflictEventId, setResolvingConflictEventId] = useState<string | null>(null);

  async function refreshEdgeMonitor(): Promise<void> {
    const [snapshot, reportResult] = await Promise.all([
      loadEdgeSyncSnapshot(),
      loadDemoExecutiveReport()
    ]);
    setEdgeSummary(snapshot.summary);
    setEdgeEvents(snapshot.events);
    setConflictResolutions(snapshot.conflictResolutions);
    setAuditSummary(snapshot.auditSummary);
    setAuditEntries(snapshot.auditEntries);
    setEvidenceSummary(snapshot.evidenceSummary);
    setEvidenceItems(snapshot.evidenceItems);
    setEvidenceVerification(snapshot.evidenceVerification);
    setDemoReadiness(snapshot.demoReadiness);
    setDemoReport(reportResult.report);
    setDemoReportMessage(reportResult.message);
    setEdgeMonitorMessage(snapshot.message);
  }

  useEffect(() => {
    let isMounted = true;

    void loadCooperSmokeSeed().then((result) => {
      if (!isMounted) {
        return;
      }

      setSeed(result.seed);
      setSeedSource(result.source);
      setSeedMessage(result.message);
      setIsLoadingSeed(false);
    });

    void loadEdgeSyncSnapshot().then((snapshot) => {
      if (!isMounted) {
        return;
      }

      setEdgeSummary(snapshot.summary);
      setEdgeEvents(snapshot.events);
      setConflictResolutions(snapshot.conflictResolutions);
      setAuditSummary(snapshot.auditSummary);
      setAuditEntries(snapshot.auditEntries);
      setEvidenceSummary(snapshot.evidenceSummary);
      setEvidenceItems(snapshot.evidenceItems);
      setEvidenceVerification(snapshot.evidenceVerification);
      setDemoReadiness(snapshot.demoReadiness);
      setEdgeMonitorMessage(snapshot.message);
    });
    void loadDemoExecutiveReport().then((result) => {
      if (!isMounted) {
        return;
      }

      setDemoReport(result.report);
      setDemoReportMessage(result.message);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmitSyncDemo(): Promise<void> {
    setIsSyncing(true);
    const result = await submitDemoSyncBatch();
    setSyncResult(result);
    await refreshEdgeMonitor();
    setIsSyncing(false);
  }

  async function handleRunGuidedDemo(): Promise<void> {
    setIsRunningGuidedDemo(true);
    const result = await runGuidedDemoScenario();
    setGuidedDemoMessage(result.message);
    await refreshEdgeMonitor();
    setIsRunningGuidedDemo(false);
  }

  async function handleResetDemoState(): Promise<void> {
    setIsResettingDemoState(true);
    const result = await resetEdgeDemoState();
    setGuidedDemoMessage(result.message);
    setSyncResult(null);
    setEvidenceMessage("Registra evidencia simulada para generar hash SHA-256.");
    await refreshEdgeMonitor();
    setIsResettingDemoState(false);
  }

  async function handleResolveConflict(eventId: string): Promise<void> {
    setResolvingConflictEventId(eventId);
    const result = await resolveSyncConflict(eventId);
    setEdgeMonitorMessage(result.message);
    await refreshEdgeMonitor();
    setResolvingConflictEventId(null);
  }

  async function handleRegisterEvidence(): Promise<void> {
    setIsRegisteringEvidence(true);
    const result = await registerDemoEvidence();
    setEvidenceMessage(result.message);
    await refreshEdgeMonitor();
    setIsRegisteringEvidence(false);
  }

  async function handleExportStore(): Promise<void> {
    setIsTransferring(true);
    const result = await exportEdgeSyncStore();

    if (result.ok && result.store !== null) {
      downloadJsonFile(`iyi-edge-offline-backup-${Date.now()}.json`, result.store);
    }

    setTransferMessage(result.message);
    setIsTransferring(false);
  }
  function handleExportDemoReport(): void {
    if (demoReport === null) {
      setDemoReportMessage("No hay reporte ejecutivo disponible para exportar.");
      return;
    }

    downloadJsonFile(`iyi-demo-report-${Date.now()}.json`, demoReport);
    setDemoReportMessage(`Exported executive report ${demoReport.reportId}.`);
  }

  function handleVerifyUploadedPackageClick(): void {
    packageInputRef.current?.click();
  }

  async function handleVerifyUploadedPackageFile(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (file === undefined) {
      return;
    }

    setIsVerifyingUploadedPackage(true);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const result = await verifyUploadedDemoPackage(parsed);

      setDemoReportMessage(result.message);
    } catch {
      setDemoReportMessage("No se pudo leer o verificar el demo package JSON seleccionado.");
    } finally {
      event.target.value = "";
      setIsVerifyingUploadedPackage(false);
    }
  }
  function handleImportDemoPackageClick(): void {
    packageImportInputRef.current?.click();
  }

  async function handleImportDemoPackageFile(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (file === undefined) {
      return;
    }

    setIsImportingDemoPackage(true);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const result = await importDemoPackage(parsed, true);

      setDemoReportMessage(result.message);
      await refreshEdgeMonitor();
    } catch {
      setDemoReportMessage("No se pudo leer o importar el demo package JSON seleccionado.");
    } finally {
      event.target.value = "";
      setIsImportingDemoPackage(false);
    }
  }  async function handleExportDemoPackage(): Promise<void> {
    setIsExportingDemoPackage(true);
    const result = await exportDemoPackage();

    if (result.ok && result.packageData !== null) {
      downloadJsonFile(`iyi-demo-package-${Date.now()}.json`, result.packageData);
    }

    setDemoReportMessage(result.message);
    setIsExportingDemoPackage(false);
  }
  async function handleVerifyDemoPackage(): Promise<void> {
    setIsVerifyingDemoPackage(true);
    const result = await verifyDemoPackageIntegrity();
    setDemoReportMessage(result.message);
    setIsVerifyingDemoPackage(false);
  }

  function handleImportClick(): void {
    fileInputRef.current?.click();
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (file === undefined) {
      return;
    }

    setIsTransferring(true);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const result = await importEdgeSyncStore(parsed, true);

      setTransferMessage(result.message);
      await refreshEdgeMonitor();
    } catch {
      setTransferMessage("No se pudo leer o importar el archivo JSON seleccionado.");
    } finally {
      event.target.value = "";
      setIsTransferring(false);
    }
  }

  const smokeKpis = seed.kpis;
  const smokeStockpiles = seed.stockpiles;
  const smokeEquipment = seed.equipment;
  const simulatedAlerts = seed.alerts;
  const layers = seed.layers;
  const movements = seed.movements;
  const recommendations = seed.recommendations;
  const scenarios = seed.scenarios;
  const resolvedConflictEventIds = new Set(conflictResolutions.map((resolution) => resolution.eventId));
  const conflictEvents = edgeEvents.filter(
    (event) => event.status === "conflict" && !resolvedConflictEventIds.has(event.eventId)
  );

  async function handleRefreshEdgeDbProjection(): Promise<void> {
    setIsLoadingEdgeDb(true);
    const result = await loadEdgeDbSummary();
    setEdgeDbSummary(result.summary);
    setEdgeDbMessage(result.message);
    setIsLoadingEdgeDb(false);
  }

  async function handleExportEdgeDbSnapshot(): Promise<void> {
    setIsExportingEdgeDbSnapshot(true);
    const result = await exportEdgeDbSnapshot();

    if (result.ok && result.snapshot !== null) {
      downloadJsonFile(`iyi-edge-db-snapshot-${Date.now()}.json`, result.snapshot);
    }

    setEdgeDbMessage(result.message);
    setIsExportingEdgeDbSnapshot(false);
  }

  async function handleSaveEdgeDbSnapshot(): Promise<void> {
    setIsSavingEdgeDbSnapshot(true);
    const result = await saveEdgeDbSnapshot();

    if (result.snapshot !== null) {
      const summaryResult = await loadEdgeDbSummary();
      setEdgeDbSummary(summaryResult.summary);
    }

    setEdgeDbMessage(result.message);
    setIsSavingEdgeDbSnapshot(false);
  }
  async function handleRefreshCloudApi(): Promise<void> {
    setIsLoadingCloudApi(true);
    const result = await loadCloudApiDashboardSnapshot();
    setCloudApiSnapshot(result.snapshot);
    setCloudApiMessage(result.message);
    setIsLoadingCloudApi(false);
  }
  return (
    <main className="app-shell" style={applyThemeVariables()}>
            <DemoCommandCenter />
            <DemoNavigationPanel />
            <OperatorWorkflowProgressPanel />
      <nav className="top-nav">
        <div>
          <strong>Industrial Yard Intelligence</strong>
          <span>{seed.terminalName}</span>
        </div>
        <div className="nav-actions">
          <span className={`sync-chip ${seedSource === "edge" ? "" : "warning"}`}>
            {isLoadingSeed ? "Cargando edge" : getSourceLabel(seedSource)}
          </span>
          <span className="sync-chip muted">Edge local</span>
        </div>
      </nav>

      <section className="hero-panel">
        <div>
          <p className="eyebrow">{seed.tenantName} · Simulación operativa</p>
          <h1>Patio industrial vivo, auditable y configurable.</h1>
          <p className="hero-copy">
            Cockpit local-first para visualizar materiales, equipos, movimientos, evidencias,
            recomendaciones y escenarios antes de integrar medición profesional real.
          </p>
          <p className="connection-note">{seedMessage}</p>
        </div>

        <div className="status-card">
          <span className="status-dot" />
          <div>
            <strong>Operación sin internet</strong>
            <span>Preparado para sincronización móvil ↔ edge</span>
          </div>
        </div>
      </section>

      <section className="kpi-grid">
        {smokeKpis.map((kpi) => (
          <article className="kpi-card" key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <small>{kpi.classification}</small>
          </article>
        ))}
      </section>

      <StockpileCreatePanel snapshot={cloudApiSnapshot} onCreated={() => void handleRefreshCloudApi()} />
      <CloudEdgeSyncPanel />
      <AuditMutationPanel />
      <StockpileLifecyclePanel />
      <StockpileStatusPanel snapshot={cloudApiSnapshot} onUpdated={() => void handleRefreshCloudApi()} />
      <section className="cloud-api-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Cloud API</p>
            <h2>Backend principal</h2>
          </div>
          <span className="cloud-api-status">
            {cloudApiSnapshot === null ? "OFFLINE" : "ONLINE"}
          </span>
        </div>

        <p className="cloud-api-message">{cloudApiMessage}</p>

        <div className="cloud-api-actions">
          <button
            className="secondary-button"
            disabled={isLoadingCloudApi}
            onClick={() => void handleRefreshCloudApi()}
          >
            {isLoadingCloudApi ? "Cargando API..." : "Actualizar Cloud API"}
          </button>
        </div>

        {cloudApiSnapshot === null ? (
          <div className="empty-state">
            Sin datos del backend cloud. Levanta apps/api y presiona “Actualizar Cloud API”.
          </div>
        ) : (
          <>
            <div className="cloud-api-metric-grid">
              <article>
                <span>Tenants</span>
                <strong>{cloudApiSnapshot.overview.tenantCount}</strong>
              </article>
              <article>
                <span>Terminals</span>
                <strong>{cloudApiSnapshot.overview.terminalCount}</strong>
              </article>
              <article>
                <span>Stockpiles</span>
                <strong>{cloudApiSnapshot.overview.stockpileCount}</strong>
              </article>
              <article>
                <span>Repository mode</span>
                <strong>{cloudApiSnapshot.health.repositoryMode}</strong>
              </article>
            </div>

            <div className="cloud-api-grid">
              <article>
                <h3>Tenants</h3>
                {cloudApiSnapshot.tenants.map((tenant) => (
                  <div className="cloud-api-line-item" key={tenant.id}>
                    <strong>{tenant.name}</strong>
                    <span>{tenant.id} · {tenant.status}</span>
                  </div>
                ))}
              </article>

              <article>
                <h3>Stockpiles</h3>
                {cloudApiSnapshot.stockpiles.slice(0, 6).map((stockpile) => (
                  <div className="cloud-api-line-item" key={stockpile.id}>
                    <strong>{stockpile.name}</strong>
                    <span>{stockpile.material} · {stockpile.estimatedTons} tons · {stockpile.status}</span>
                  </div>
                ))}
              </article>
            </div>
          </>
        )}
      </section>
      <section className="db-projection-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">DB Projection</p>
            <h2>Snapshot unificado del edge</h2>
          </div>
          <span className="db-projection-status">
            {edgeDbSummary === null ? "NO DATA" : `${edgeDbSummary.totalRows} ROWS`}
          </span>
        </div>

        <p className="db-projection-message">{edgeDbMessage}</p>

        <div className="db-projection-actions">
          <button
            className="secondary-button"
            disabled={isLoadingEdgeDb}
            onClick={() => void handleRefreshEdgeDbProjection()}
          >
            {isLoadingEdgeDb ? "Cargando DB..." : "Actualizar DB projection"}
          </button>
          <button
            className="secondary-button"
            disabled={isExportingEdgeDbSnapshot}
            onClick={() => void handleExportEdgeDbSnapshot()}
          >
            {isExportingEdgeDbSnapshot ? "Exportando snapshot..." : "Exportar DB snapshot"}
          </button>
          <button
            className="secondary-button"
            disabled={isSavingEdgeDbSnapshot}
            onClick={() => void handleSaveEdgeDbSnapshot()}
          >
            {isSavingEdgeDbSnapshot ? "Guardando snapshot..." : "Guardar snapshot en edge"}
          </button>
        </div>

        {edgeDbSummary === null ? (
          <div className="empty-state">
            Sin resumen DB. Levanta edge y presiona “Actualizar DB projection”.
          </div>
        ) : (
          <div className="db-table-count-grid">
            {Object.entries(edgeDbSummary.tableCounts).map(([tableName, rowCount]) => (
              <article key={tableName}>
                <span>{tableName}</span>
                <strong>{Number(rowCount)}</strong>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="executive-report-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Executive Demo Report</p>
            <h2>{demoReport?.title ?? "Industrial Yard Intelligence Demo Report"}</h2>
          </div>
          <span className={`executive-report-status executive-${demoReport?.status ?? "empty_demo_state"}`}>
            {demoReport?.status ?? "empty_demo_state"}
          </span>
        </div>

        <p className="executive-report-message">{demoReportMessage}</p>

        <div className="executive-report-actions">
          <button className="secondary-button" onClick={() => void refreshEdgeMonitor()}>
            Actualizar reporte
          </button>
          <button className="secondary-button" disabled={demoReport === null} onClick={handleExportDemoReport}>
            Exportar reporte JSON
          </button>
          <button
            className="secondary-button"
            disabled={isVerifyingDemoPackage}
            onClick={() => void handleVerifyDemoPackage()}
          >
            {isVerifyingDemoPackage ? "Verificando..." : "Verificar package actual"}
          </button>
          <button
            className="secondary-button"
            disabled={isVerifyingUploadedPackage}
            onClick={handleVerifyUploadedPackageClick}
          >
            {isVerifyingUploadedPackage ? "Verificando JSON..." : "Verificar JSON exportado"}
          </button>
          <input
            ref={packageInputRef}
            accept="application/json,.json"
            className="hidden-file-input"
            type="file"
            onChange={(event) => void handleVerifyUploadedPackageFile(event)}
          />
          <button
            className="secondary-button"
            disabled={isImportingDemoPackage}
            onClick={handleImportDemoPackageClick}
          >
            {isImportingDemoPackage ? "Importando package..." : "Importar demo package"}
          </button>
          <input
            ref={packageImportInputRef}
            accept="application/json,.json"
            className="hidden-file-input"
            type="file"
            onChange={(event) => void handleImportDemoPackageFile(event)}
          />
          <button
            className="secondary-button"
            disabled={isExportingDemoPackage}
            onClick={() => void handleExportDemoPackage()}
          >
            {isExportingDemoPackage ? "Exportando package..." : "Exportar demo package"}
          </button>
        </div>

        {demoReport === null ? (
          <div className="empty-state">
            Sin reporte ejecutivo. Verifica que el edge esté corriendo y que exista el endpoint /admin/demo-report.
          </div>
        ) : (
          <>
            <div className="executive-metric-grid">
              {demoReport.metrics.map((metric) => (
                <article key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.detail}</small>
                </article>
              ))}
            </div>

            <div className="executive-report-grid">
              <article>
                <h3>Proof points</h3>
                {demoReport.proofPoints.map((proofPoint) => (
                  <div className="executive-line-item" key={proofPoint.label}>
                    <strong>{proofPoint.label}</strong>
                    <span>{proofPoint.detail}</span>
                  </div>
                ))}
              </article>

              <article>
                <h3>Demo script</h3>
                {demoReport.demoScript.map((step) => (
                  <div className="executive-line-item" key={step}>
                    <strong>{step}</strong>
                  </div>
                ))}
              </article>

              <article>
                <h3>Next steps</h3>
                {demoReport.recommendedNextSteps.map((step) => (
                  <div className="executive-line-item" key={step}>
                    <strong>{step}</strong>
                  </div>
                ))}
              </article>
            </div>
          </>
        )}
      </section>
      <section className="demo-readiness-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Demo Readiness Report</p>
            <h2>Preparación para demo Cooper/T. Smith</h2>
          </div>
          <span className={`readiness-status readiness-${demoReadiness?.status ?? "empty"}`}>
            {demoReadiness?.status ?? "empty"}
          </span>
        </div>

        <div className="readiness-check-grid">
          {(demoReadiness?.checks ?? []).map((check) => (
            <article className={`readiness-check ${check.ok ? "ok" : "fail"}`} key={check.id}>
              <strong>{check.label}</strong>
              <span>{check.detail}</span>
            </article>
          ))}
        </div>

        {demoReadiness === null ? (
          <div className="empty-state">Sin reporte de preparación. Verifica que el edge esté corriendo.</div>
        ) : null}
      </section>
      <section className="workspace-grid">
        <article className="map-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Mapa-plano representativo</p>
              <h2>{seed.terminalName} · Universo configurable</h2>
            </div>
            <span className="badge">{seed.classification}</span>
          </div>

          <div className="layer-bar">
            {layers.map((layer) => (
              <span className={`layer-pill ${layer.enabled ? "enabled" : "disabled"}`} key={layer.id}>
                {layer.label}
              </span>
            ))}
          </div>

          <div className="yard-map" aria-label="Mapa representativo de patio industrial">
            <div className="orthomosaic-texture" />
            <div className="water" />
            <div className="dock dock-one">Muelle 1</div>
            <div className="dock dock-two">Muelle 2</div>
            <div className="rail">Espuela de Ferrocarril</div>
            <div className="warehouse">Bodega</div>
            <div className="scale">Básculas</div>
            <div className="belt-system">Sistema de Bandas</div>

            {smokeStockpiles.map((stockpile) => (
              <button
                className={`stockpile stockpile-${stockpile.status}`}
                key={stockpile.id}
                style={{
                  left: `${stockpile.x}%`,
                  top: `${stockpile.y}%`,
                  width: `${stockpile.width}%`,
                  height: `${stockpile.height}%`
                }}
                title={`${stockpile.name} · ${stockpile.material}`}
              >
                <span>{stockpile.material}</span>
              </button>
            ))}

            {smokeEquipment.map((equipment) => (
              <div
                className="equipment-marker"
                key={equipment.id}
                style={{
                  left: `${equipment.x}%`,
                  top: `${equipment.y}%`
                }}
                title={`${equipment.name} · ${equipment.status}`}
              >
                {equipment.name}
              </div>
            ))}
          </div>
        </article>

        <aside className="side-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Trazabilidad</p>
              <h2>Materiales visibles</h2>
            </div>
          </div>

          <div className="stockpile-list">
            {smokeStockpiles.map((stockpile) => (
              <article className="stockpile-card" key={stockpile.id}>
                <div>
                  <strong>{stockpile.name}</strong>
                  <span>
                    {stockpile.material} · {stockpile.category}
                  </span>
                </div>
                <div className="stockpile-meta">
                  <span>{formatTons(stockpile.estimatedTons)} t</span>
                  <span>{getStatusLabel(stockpile.status)}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="sync-demo-panel">
            <p className="eyebrow">Sync demo</p>
            <h2>Enviar evento simulado al edge</h2>
            <p>
              Construye un batch local y lo manda a <code>POST /sync/batches</code>.
            </p>
            <button className="sync-demo-button" disabled={isSyncing} onClick={handleSubmitSyncDemo}>
              {isSyncing ? "Sincronizando..." : "Enviar sync batch"}
            </button>

            {syncResult ? (
              <div className={`sync-result ${syncResult.ok ? "success" : "failure"}`}>
                <strong>{syncResult.status}</strong>
                <span>{syncResult.message}</span>
              </div>
            ) : null}
          </div>

          <div className="guided-demo-panel">
            <p className="eyebrow">Guided demo</p>
            <h2>Ejecutar flujo completo</h2>
            <p>{guidedDemoMessage}</p>
            <div className="guided-demo-actions">
              <button
                className="guided-demo-button"
                disabled={isRunningGuidedDemo || isResettingDemoState}
                onClick={() => void handleRunGuidedDemo()}
              >
                {isRunningGuidedDemo ? "Ejecutando demo..." : "Ejecutar demo guiada"}
              </button>
              <button
                className="guided-demo-reset-button"
                disabled={isRunningGuidedDemo || isResettingDemoState}
                onClick={() => void handleResetDemoState()}
              >
                {isResettingDemoState ? "Reseteando..." : "Reset demo state"}
              </button>
            </div>
          </div>
          <div className="offline-transfer-panel">
            <p className="eyebrow">Offline transfer</p>
            <h2>Exportar / importar edge backup</h2>
            <p>{transferMessage}</p>

            <div className="offline-transfer-actions">
              <button className="secondary-button" disabled={isTransferring} onClick={handleExportStore}>
                Exportar JSON
              </button>
              <button className="secondary-button" disabled={isTransferring} onClick={handleImportClick}>
                Importar JSON
              </button>
            </div>

            <input
              ref={fileInputRef}
              accept="application/json,.json"
              className="hidden-file-input"
              type="file"
              onChange={(event) => void handleImportFile(event)}
            />
          </div>

          <div className="alerts">
            <p className="eyebrow">Alertas y notas</p>
            {simulatedAlerts.map((alert) => (
              <div className="alert-item" key={alert}>
                {alert}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="edge-monitor-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Edge Sync Monitor</p>
            <h2>Historial local persistido del edge</h2>
          </div>
          <button className="secondary-button" onClick={() => void refreshEdgeMonitor()}>
            Actualizar
          </button>
        </div>

        <p className="monitor-message">{edgeMonitorMessage}</p>

        <div className="sync-summary-grid">
          <article>
            <span>Batches</span>
            <strong>{edgeSummary?.totalBatches ?? 0}</strong>
          </article>
          <article>
            <span>Eventos</span>
            <strong>{edgeSummary?.totalEvents ?? 0}</strong>
          </article>
          <article>
            <span>Aceptados</span>
            <strong>{edgeSummary?.accepted ?? 0}</strong>
          </article>
          <article>
            <span>Conflictos</span>
            <strong>{edgeSummary?.conflicts ?? 0}</strong>
          </article>
        </div>
      </section>

      <section className="conflict-review-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Conflict Review Queue</p>
            <h2>Eventos que requieren revisión de supervisor</h2>
          </div>
          <span className="conflict-count">{conflictEvents.length}</span>
        </div>

        {conflictEvents.length === 0 ? (
          <div className="empty-state">
            Sin conflictos pendientes. Envía varios sync batches contra el mismo agregado para simular versión stale.
          </div>
        ) : (
          <div className="conflict-list">
            {conflictEvents.slice(0, 6).map((event) => (
              <article className="conflict-card" key={`${event.eventId}-${event.receivedAtEdge}`}>
                <div className="conflict-card-main">
                  <span className="conflict-type">{getConflictLabel(event)}</span>
                  <strong>{event.eventType}</strong>
                  <p>{getConflictDescription(event)}</p>
                  <small>
                    {event.aggregateType} · {event.aggregateId} · {event.deviceId}
                  </small>
                </div>
                <div className="conflict-card-side">
                  <span>{event.validationState}</span>
                  <strong>{event.receivedAtEdge}</strong>
                  <button
                    className="conflict-resolve-button"
                    disabled={resolvingConflictEventId === event.eventId}
                    onClick={() => void handleResolveConflict(event.eventId)}
                  >
                    {resolvingConflictEventId === event.eventId ? "Revisando..." : "Marcar revisado"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="audit-chain-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Audit Chain Monitor</p>
            <h2>Cadena de custodia hash-chain</h2>
          </div>
          <span className={`audit-status ${auditSummary?.chainValid ? "valid" : "invalid"}`}>
            {auditSummary?.chainValid ? "VALID" : "NO DATA"}
          </span>
        </div>

        <div className="audit-summary-grid">
          <article>
            <span>Audit entries</span>
            <strong>{auditSummary?.totalEntries ?? 0}</strong>
          </article>
          <article>
            <span>Chain status</span>
            <strong>{auditSummary?.chainValid ? "OK" : "Pending"}</strong>
          </article>
          <article>
            <span>Verification</span>
            <strong>{auditSummary?.verificationMessage ?? "No audit chain loaded."}</strong>
          </article>
        </div>

        <div className="audit-entry-list">
          {auditEntries.length === 0 ? (
            <div className="empty-state">
              Sin entradas auditadas. Marca un conflicto como revisado para generar una entrada hash-chain.
            </div>
          ) : (
            auditEntries.slice(0, 5).map((entry) => (
              <article className="audit-entry-card" key={entry.integrityHash}>
                <div>
                  <span className="audit-action">{entry.actionType}</span>
                  <strong>{entry.affectedEntityType} · {entry.affectedEntityId}</strong>
                  <small>
                    {entry.userId} · {entry.deviceId} · {entry.createdAt}
                  </small>
                </div>
                <div className="audit-hashes">
                  <span>prev: {entry.previousHash === null ? "GENESIS" : shortenHash(entry.previousHash)}</span>
                  <strong>hash: {shortenHash(entry.integrityHash)}</strong>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
      <section className="evidence-integrity-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Evidence Integrity Monitor</p>
            <h2>Evidencia con SHA-256 verificable</h2>
          </div>
          <span className={`evidence-status ${evidenceVerification?.ok ? "valid" : "invalid"}`}>
            {evidenceVerification?.ok ? "VERIFIED" : "NO DATA"}
          </span>
        </div>

        <div className="evidence-actions-row">
          <p>{evidenceMessage}</p>
          <button
            className="secondary-button"
            disabled={isRegisteringEvidence}
            onClick={() => void handleRegisterEvidence()}
          >
            {isRegisteringEvidence ? "Registrando..." : "Registrar evidencia simulada"}
          </button>
        </div>

        <div className="evidence-summary-grid">
          <article>
            <span>Evidencias</span>
            <strong>{evidenceSummary?.totalEvidenceItems ?? 0}</strong>
          </article>
          <article>
            <span>Verificadas</span>
            <strong>{evidenceSummary?.verifiedItems ?? 0}</strong>
          </article>
          <article>
            <span>Fallidas</span>
            <strong>{evidenceSummary?.failedItems ?? 0}</strong>
          </article>
          <article>
            <span>Check</span>
            <strong>{evidenceVerification?.ok ? "OK" : "Pending"}</strong>
          </article>
        </div>

        <div className="evidence-list">
          {evidenceItems.length === 0 ? (
            <div className="empty-state">
              Sin evidencia registrada. Presiona el botón para simular un GeoJSON con hash de integridad.
            </div>
          ) : (
            evidenceItems.slice(0, 5).map((item) => (
              <article className="evidence-card" key={item.metadata.integrity.hashValue}>
                <div>
                  <span className="evidence-kind">{item.metadata.evidenceKind}</span>
                  <strong>{item.metadata.fileName ?? item.metadata.storageKey}</strong>
                  <small>
                    {item.metadata.storageProvider} · {item.metadata.integrity.byteSize} bytes · immutable
                  </small>
                </div>
                <div className="evidence-hash">
                  <span>{item.metadata.integrity.algorithm}</span>
                  <strong>{shortenHash(item.metadata.integrity.hashValue)}</strong>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="intel-grid">
        <article className="timeline-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Timeline operativo</p>
              <h2>Últimos eventos</h2>
            </div>
          </div>

          <div className="timeline-list">
            {movements.map((movement) => (
              <article className={`timeline-item timeline-${movement.status}`} key={movement.id}>
                <span className="timeline-time">{movement.timestamp}</span>
                <div>
                  <strong>{movement.title}</strong>
                  <p>{movement.description}</p>
                  <small>
                    {movement.type} · {movement.actor}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="recommendation-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Motor de reglas</p>
              <h2>Recomendaciones</h2>
            </div>
          </div>

          <div className="recommendation-list">
            {recommendations.map((recommendation) => (
              <article
                className={`recommendation-card recommendation-${recommendation.severity}`}
                key={recommendation.id}
              >
                <div>
                  <strong>{recommendation.title}</strong>
                  <p>{recommendation.reason}</p>
                </div>
                <span>{recommendation.score}</span>
              </article>
            ))}
          </div>
        </article>

        <article className="scenario-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Simulación</p>
              <h2>Escenarios editables</h2>
            </div>
          </div>

          <div className="scenario-list">
            {scenarios.map((scenario) => (
              <article className="scenario-card" key={scenario.id}>
                <strong>{scenario.name}</strong>
                <p>{scenario.description}</p>
                <span>{scenario.impact}</span>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;