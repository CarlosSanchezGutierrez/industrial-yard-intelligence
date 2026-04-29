import { industrialDarkTheme, themeToCssVariables } from "@iyi/design-tokens";
import { cooperSmokeSeed, type SmokeStockpile, type SmokeTenantSeed } from "@iyi/seed-data";
import type { CSSProperties, ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  exportEdgeSyncStore,
  importEdgeSyncStore,
  loadCooperSmokeSeed,
  loadEdgeSyncSnapshot,
  resolveSyncConflict,
  submitDemoSyncBatch,
  type EdgeConflictResolution,
  type EdgeSyncEvent,
  type EdgeSyncSummary,
  type SmokeSeedSource,
  type SubmitSyncDemoResult
} from "./data/edge-client.js";
import "./styles.css";

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
  const [seed, setSeed] = useState<SmokeTenantSeed>(cooperSmokeSeed);
  const [seedSource, setSeedSource] = useState<SmokeSeedSource>("local_fallback");
  const [seedMessage, setSeedMessage] = useState("Usando seed local inicial.");
  const [isLoadingSeed, setIsLoadingSeed] = useState(true);
  const [syncResult, setSyncResult] = useState<SubmitSyncDemoResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [edgeSummary, setEdgeSummary] = useState<EdgeSyncSummary | null>(null);
  const [edgeEvents, setEdgeEvents] = useState<readonly EdgeSyncEvent[]>([]);
  const [conflictResolutions, setConflictResolutions] = useState<readonly EdgeConflictResolution[]>([]);
  const [edgeMonitorMessage, setEdgeMonitorMessage] = useState("Esperando conexión al edge.");
  const [transferMessage, setTransferMessage] = useState("Exporta o restaura el historial local del edge como JSON.");
  const [isTransferring, setIsTransferring] = useState(false);
  const [resolvingConflictEventId, setResolvingConflictEventId] = useState<string | null>(null);

  async function refreshEdgeMonitor(): Promise<void> {
    const snapshot = await loadEdgeSyncSnapshot();
    setEdgeSummary(snapshot.summary);
    setEdgeEvents(snapshot.events);
    setConflictResolutions(snapshot.conflictResolutions);
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
      setEdgeMonitorMessage(snapshot.message);
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

  async function handleResolveConflict(eventId: string): Promise<void> {
    setResolvingConflictEventId(eventId);
    const result = await resolveSyncConflict(eventId);
    setEdgeMonitorMessage(result.message);
    await refreshEdgeMonitor();
    setResolvingConflictEventId(null);
  }

  async function handleExportStore(): Promise<void> {
    setIsTransferring(true);
    const result = await exportEdgeSyncStore();

    if (result.ok && result.store !== null) {
      downloadJsonFile(`iyi-edge-sync-store-${Date.now()}.json`, result.store);
    }

    setTransferMessage(result.message);
    setIsTransferring(false);
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

  return (
    <main className="app-shell" style={applyThemeVariables()}>
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

          <div className="offline-transfer-panel">
            <p className="eyebrow">Offline transfer</p>
            <h2>Exportar / importar edge store</h2>
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