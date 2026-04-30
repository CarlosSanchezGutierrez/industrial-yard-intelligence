import { useMemo, useState, type CSSProperties } from "react";

import {
  advanceAplomoGovernedIndustrialDemo,
  createAplomoGovernedIndustrialDemoStore,
  type AplomoGovernedTelemetryOutput,
} from "@iyi/sync-core";

type AdminFilterState = {
  search: string;
  deviceType: string;
  source: string;
  selectedDeviceId: string;
};

const styles = {
  panel: {
    border: "1px solid rgba(148, 163, 184, 0.26)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(15, 23, 42, 0.96))",
    color: "#e5e7eb",
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.36)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: "-0.02em",
  },
  eyebrow: {
    margin: "0 0 6px",
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
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
  filterGrid: {
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
    fontWeight: 700,
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
  sectionTitle: {
    margin: "20px 0 10px",
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: 900,
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    background: "rgba(2, 6, 23, 0.46)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 760,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#93c5fd",
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 12px",
    color: "#e2e8f0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
    verticalAlign: "top",
  },
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(56, 189, 248, 0.12)",
    color: "#7dd3fc",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  warningPill: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(251, 191, 36, 0.12)",
    color: "#fde68a",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  goodPill: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(34, 197, 94, 0.12)",
    color: "#86efac",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  result: {
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    background: "rgba(15, 23, 42, 0.78)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    fontSize: 12,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    color: "#e2e8f0",
  },
} satisfies Record<string, CSSProperties>;

const formatNumber = (value: number, digits = 2): string => {
  return Number.isFinite(value) ? value.toFixed(digits) : "0";
};

const getAverageAccuracy = (
  events: AplomoGovernedTelemetryOutput[],
): number => {
  const values = events
    .map((item) => item.event.quality?.accuracyMeters)
    .filter((value): value is number => typeof value === "number");

  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getAverageQualityScore = (
  events: AplomoGovernedTelemetryOutput[],
): number => {
  const scores = events.flatMap((item) =>
    item.envelope.governance.quality.map((quality) => quality.score),
  );

  if (scores.length === 0) {
    return 0;
  }

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

export function AplomoOperationsAdminPanel() {
  const [runtime, setRuntime] = useState(() =>
    createAplomoGovernedIndustrialDemoStore(),
  );
  const [tick, setTick] = useState(0);
  const [snapshot, setSnapshot] = useState(runtime.initialState.snapshot);
  const [governedEvents, setGovernedEvents] = useState<
    AplomoGovernedTelemetryOutput[]
  >(runtime.initialState.governedEvents);
  const [filters, setFilters] = useState<AdminFilterState>({
    search: "",
    deviceType: "all",
    source: "all",
    selectedDeviceId: "all",
  });

  const metrics = useMemo(() => {
    const activeSessions = snapshot.sessions.filter(
      (session) => session.status === "active",
    ).length;

    const onlineConnections = snapshot.connections.filter(
      (connection) => connection.status === "online",
    ).length;

    const highPrecisionEvents = governedEvents.filter((item) => {
      const accuracy = item.event.quality?.accuracyMeters;

      return typeof accuracy === "number" && accuracy <= 1;
    }).length;

    return {
      devices: snapshot.devices.length,
      activeSessions,
      onlineConnections,
      latestPositions: snapshot.latestPositions.length,
      telemetryEvents: snapshot.telemetryEvents.length,
      governedEvents: governedEvents.length,
      highPrecisionEvents,
      averageAccuracy: getAverageAccuracy(governedEvents),
      averageQualityScore: getAverageQualityScore(governedEvents),
    };
  }, [snapshot, governedEvents]);

  const deviceTypes = useMemo(() => {
    return Array.from(new Set(snapshot.devices.map((device) => device.type))).sort();
  }, [snapshot.devices]);

  const sources = useMemo(() => {
    return Array.from(
      new Set(snapshot.latestPositions.map((position) => position.source)),
    ).sort();
  }, [snapshot.latestPositions]);

  const filteredDevices = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return snapshot.devices
      .filter((device) => {
        if (filters.deviceType !== "all" && device.type !== filters.deviceType) {
          return false;
        }

        if (filters.selectedDeviceId !== "all" && device.id !== filters.selectedDeviceId) {
          return false;
        }

        if (!search) {
          return true;
        }

        return (
          device.name.toLowerCase().includes(search) ||
          device.id.toLowerCase().includes(search) ||
          device.type.toLowerCase().includes(search) ||
          (device.externalIdentifier?.toLowerCase().includes(search) ?? false)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [snapshot.devices, filters]);

  const filteredPositions = useMemo(() => {
    return snapshot.latestPositions
      .filter((position) => {
        if (filters.source !== "all" && position.source !== filters.source) {
          return false;
        }

        if (filters.selectedDeviceId !== "all" && position.deviceId !== filters.selectedDeviceId) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [snapshot.latestPositions, filters]);

  const recentEvents = useMemo(() => {
    return governedEvents
      .filter((item) => {
        if (filters.source !== "all" && item.event.source !== filters.source) {
          return false;
        }

        if (
          filters.selectedDeviceId !== "all" &&
          item.event.deviceId !== filters.selectedDeviceId
        ) {
          return false;
        }

        return true;
      })
      .slice(0, 12);
  }, [governedEvents, filters]);

  const updateFilter = (key: keyof AdminFilterState, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetDemo = () => {
    const nextRuntime = createAplomoGovernedIndustrialDemoStore();

    setRuntime(nextRuntime);
    setTick(0);
    setSnapshot(nextRuntime.initialState.snapshot);
    setGovernedEvents(nextRuntime.initialState.governedEvents);
    setFilters({
      search: "",
      deviceType: "all",
      source: "all",
      selectedDeviceId: "all",
    });
  };

  const advanceTicks = (count: number) => {
    let nextTick = tick;
    let latestSnapshot = snapshot;
    const generatedEvents: AplomoGovernedTelemetryOutput[] = [];

    for (let index = 0; index < count; index += 1) {
      nextTick += 1;
      const result = advanceAplomoGovernedIndustrialDemo(runtime.store, nextTick);
      latestSnapshot = result.snapshot;
      generatedEvents.push(...result.governedEvents);
    }

    setTick(nextTick);
    setSnapshot(latestSnapshot);
    setGovernedEvents((current) => [...generatedEvents, ...current].slice(0, 250));
  };

  return (
    <section style={styles.panel} aria-label="Panel interno de administración operativa">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Aplomo Admin Ops</p>
          <h2 style={styles.title}>Centro operativo de dispositivos vivos</h2>
          <p style={styles.text}>
            Panel interno para administradores: simulación gobernada de emisores,
            receptores, conexiones, precisión GPS, calidad de datos y eventos listos
            para analítica e IA.
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button type="button" style={styles.button} onClick={() => advanceTicks(1)}>
            Avanzar 1 tick
          </button>
          <button type="button" style={styles.secondaryButton} onClick={() => advanceTicks(10)}>
            Avanzar 10 ticks
          </button>
          <button type="button" style={styles.secondaryButton} onClick={resetDemo}>
            Reiniciar demo
          </button>
        </div>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Dispositivos</p>
          <p style={styles.metricValue}>{metrics.devices}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Sesiones activas</p>
          <p style={styles.metricValue}>{metrics.activeSessions}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Conexiones online</p>
          <p style={styles.metricValue}>{metrics.onlineConnections}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Posiciones vivas</p>
          <p style={styles.metricValue}>{metrics.latestPositions}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Eventos gobernados</p>
          <p style={styles.metricValue}>{metrics.governedEvents}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Alta precisión</p>
          <p style={styles.metricValue}>{metrics.highPrecisionEvents}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Precisión promedio</p>
          <p style={styles.metricValue}>{formatNumber(metrics.averageAccuracy, 2)} m</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Calidad de datos</p>
          <p style={styles.metricValue}>{formatNumber(metrics.averageQualityScore, 2)}</p>
        </div>
      </div>

      <div style={styles.filterGrid}>
        <label style={styles.label}>
          Buscar
          <input
            style={styles.input}
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Nombre, ID, tipo, identificador..."
          />
        </label>

        <label style={styles.label}>
          Tipo de dispositivo
          <select
            style={styles.input}
            value={filters.deviceType}
            onChange={(event) => updateFilter("deviceType", event.target.value)}
          >
            <option value="all">Todos</option>
            {deviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Fuente GPS
          <select
            style={styles.input}
            value={filters.source}
            onChange={(event) => updateFilter("source", event.target.value)}
          >
            <option value="all">Todas</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Dispositivo específico
          <select
            style={styles.input}
            value={filters.selectedDeviceId}
            onChange={(event) => updateFilter("selectedDeviceId", event.target.value)}
          >
            <option value="all">Todos</option>
            {snapshot.devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h3 style={styles.sectionTitle}>Dispositivos registrados</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Capacidades</th>
              <th style={styles.th}>ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device) => (
              <tr key={device.id}>
                <td style={styles.td}>{device.name}</td>
                <td style={styles.td}>
                  <span style={styles.pill}>{device.type}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.goodPill}>{device.status}</span>
                </td>
                <td style={styles.td}>{device.capabilities.join(", ")}</td>
                <td style={{ ...styles.td, ...styles.mono }}>{device.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={styles.sectionTitle}>Posiciones vivas</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Dispositivo</th>
              <th style={styles.th}>Fuente</th>
              <th style={styles.th}>Latitud</th>
              <th style={styles.th}>Longitud</th>
              <th style={styles.th}>Precisión</th>
              <th style={styles.th}>Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {filteredPositions.map((position) => {
              const device = snapshot.devices.find((item) => item.id === position.deviceId);
              const accuracy = position.quality?.accuracyMeters;

              return (
                <tr key={position.deviceId}>
                  <td style={styles.td}>{device?.name ?? position.deviceId}</td>
                  <td style={styles.td}>
                    <span style={styles.pill}>{position.source}</span>
                  </td>
                  <td style={{ ...styles.td, ...styles.mono }}>
                    {position.position.latitude}
                  </td>
                  <td style={{ ...styles.td, ...styles.mono }}>
                    {position.position.longitude}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={
                        typeof accuracy === "number" && accuracy <= 1
                          ? styles.goodPill
                          : styles.warningPill
                      }
                    >
                      {typeof accuracy === "number" ? `${accuracy} m` : "sin dato"}
                    </span>
                  </td>
                  <td style={{ ...styles.td, ...styles.mono }}>{position.updatedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 style={styles.sectionTitle}>Eventos gobernados recientes</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Evento</th>
              <th style={styles.th}>Dispositivo</th>
              <th style={styles.th}>Contrato</th>
              <th style={styles.th}>IA</th>
              <th style={styles.th}>Calidad</th>
              <th style={styles.th}>Lineage</th>
            </tr>
          </thead>
          <tbody>
            {recentEvents.map((item) => {
              const device = snapshot.devices.find(
                (candidate) => candidate.id === item.event.deviceId,
              );

              const averageQuality =
                item.envelope.governance.quality.reduce(
                  (sum, quality) => sum + quality.score,
                  0,
                ) / item.envelope.governance.quality.length;

              return (
                <tr key={item.event.id}>
                  <td style={{ ...styles.td, ...styles.mono }}>{item.event.id}</td>
                  <td style={styles.td}>{device?.name ?? item.event.deviceId}</td>
                  <td style={{ ...styles.td, ...styles.mono }}>
                    {item.envelope.governance.dataContractId}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.warningPill}>
                      {item.envelope.governance.aiUsagePolicy}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.goodPill}>{formatNumber(averageQuality, 2)}</span>
                  </td>
                  <td style={styles.td}>
                    {item.envelope.governance.lineage[0]?.sourceSystem ?? "sin lineage"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <pre style={styles.result}>
{[
  `Tick actual: ${tick}`,
  `Data contract: ${runtime.telemetryContract.id}`,
  `Latest position contract: ${runtime.latestPositionContract.id}`,
  "Modo: simulación local gobernada",
  "Siguiente evolución: conectar este panel a mapa visual, API interna y persistencia real.",
].join("\n")}
      </pre>
    </section>
  );
}
