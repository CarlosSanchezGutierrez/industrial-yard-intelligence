import { industrialDarkTheme, themeToCssVariables } from "@iyi/design-tokens";
import { cooperSmokeSeed, type SmokeStockpile } from "@iyi/seed-data";
import type { CSSProperties } from "react";
import "./styles.css";

const smokeKpis = cooperSmokeSeed.kpis;
const smokeStockpiles = cooperSmokeSeed.stockpiles;
const smokeEquipment = cooperSmokeSeed.equipment;
const simulatedAlerts = cooperSmokeSeed.alerts;
const layers = cooperSmokeSeed.layers;
const movements = cooperSmokeSeed.movements;
const recommendations = cooperSmokeSeed.recommendations;
const scenarios = cooperSmokeSeed.scenarios;

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

function App() {
  return (
    <main className="app-shell" style={applyThemeVariables()}>
      <nav className="top-nav">
        <div>
          <strong>Industrial Yard Intelligence</strong>
          <span>{cooperSmokeSeed.terminalName}</span>
        </div>
        <div className="nav-actions">
          <span className="sync-chip">Offline-ready</span>
          <span className="sync-chip muted">Edge local</span>
        </div>
      </nav>

      <section className="hero-panel">
        <div>
          <p className="eyebrow">{cooperSmokeSeed.tenantName} · Simulación operativa</p>
          <h1>Patio industrial vivo, auditable y configurable.</h1>
          <p className="hero-copy">
            Cockpit local-first para visualizar materiales, equipos, movimientos, evidencias,
            recomendaciones y escenarios antes de integrar medición profesional real.
          </p>
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
              <h2>{cooperSmokeSeed.terminalName} · Universo configurable</h2>
            </div>
            <span className="badge">{cooperSmokeSeed.classification}</span>
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