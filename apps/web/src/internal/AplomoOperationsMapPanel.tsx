import { useMemo, useState, type CSSProperties } from "react";

import { useAplomoOperationsRuntime } from "./AplomoOperationsRuntime.js";

type MapLayerState = {
  showPhones: boolean;
  showDrones: boolean;
  showRtk: boolean;
  showVehicles: boolean;
  showReceivers: boolean;
  showAccuracy: boolean;
  showLabels: boolean;
  selectedSource: string;
};

type BooleanLayerKey = Exclude<keyof MapLayerState, "selectedSource">;

const styles = {
  panel: {
    border: "1px solid rgba(56, 189, 248, 0.24)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(8, 47, 73, 0.72))",
    color: "#e5e7eb",
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.34)",
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
    color: "#67e8f9",
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
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 300px",
    gap: 14,
    marginTop: 16,
  },
  mapCard: {
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(2, 6, 23, 0.74)",
    minHeight: 460,
  },
  sidebar: {
    display: "grid",
    gap: 10,
    alignContent: "start",
  },
  card: {
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: 16,
    padding: 12,
    background: "rgba(15, 23, 42, 0.72)",
  },
  cardTitle: {
    margin: "0 0 8px",
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: 900,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 8,
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
  metric: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 6,
  },
  metricStrong: {
    color: "#f8fafc",
    fontWeight: 900,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  tableWrap: {
    marginTop: 14,
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
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(56, 189, 248, 0.12)",
    color: "#7dd3fc",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  goodPill: {
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
} satisfies Record<string, CSSProperties>;

const viewWidth = 1000;
const viewHeight = 620;

const getDeviceColor = (type: string): string => {
  if (type === "drone") {
    return "#a78bfa";
  }

  if (type === "rtk_rover" || type === "rtk_base" || type === "gnss_receiver") {
    return "#22c55e";
  }

  if (type === "truck" || type === "machine") {
    return "#f97316";
  }

  if (type === "tablet" || type === "browser_console") {
    return "#38bdf8";
  }

  return "#facc15";
};

const getDeviceGlyph = (type: string): string => {
  if (type === "drone") {
    return "DR";
  }

  if (type === "rtk_rover") {
    return "RTK";
  }

  if (type === "rtk_base") {
    return "BASE";
  }

  if (type === "truck") {
    return "TR";
  }

  if (type === "tablet") {
    return "TAB";
  }

  if (type === "phone") {
    return "PH";
  }

  return "DEV";
};

const formatAccuracy = (value: number | undefined): string => {
  if (typeof value !== "number") {
    return "sin dato";
  }

  if (value < 1) {
    return `${value.toFixed(2)} m`;
  }

  return `${value.toFixed(1)} m`;
};

export function AplomoOperationsMapPanel() {
  const { tick, snapshot, advanceTicks, resetDemo } = useAplomoOperationsRuntime();

  const [layers, setLayers] = useState<MapLayerState>({
    showPhones: true,
    showDrones: true,
    showRtk: true,
    showVehicles: true,
    showReceivers: true,
    showAccuracy: true,
    showLabels: true,
    selectedSource: "all",
  });

  const positionsWithDevices = useMemo(() => {
    return snapshot.latestPositions
      .map((position) => {
        const device = snapshot.devices.find((item) => item.id === position.deviceId);

        if (!device) {
          return null;
        }

        return {
          position,
          device,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter((item) => {
        const type = item.device.type;

        if (!layers.showPhones && (type === "phone" || type === "tablet")) {
          return false;
        }

        if (!layers.showDrones && type === "drone") {
          return false;
        }

        if (
          !layers.showRtk &&
          (type === "rtk_base" || type === "rtk_rover" || type === "gnss_receiver")
        ) {
          return false;
        }

        if (!layers.showVehicles && (type === "truck" || type === "machine")) {
          return false;
        }

        if (layers.selectedSource !== "all" && item.position.source !== layers.selectedSource) {
          return false;
        }

        return true;
      });
  }, [snapshot, layers]);

  const bounds = useMemo(() => {
    const lats = positionsWithDevices.map((item) => item.position.position.latitude);
    const lngs = positionsWithDevices.map((item) => item.position.position.longitude);

    if (lats.length === 0 || lngs.length === 0) {
      return {
        minLat: 22.406,
        maxLat: 22.408,
        minLng: -97.94,
        maxLng: -97.937,
      };
    }

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latPad = Math.max((maxLat - minLat) * 0.2, 0.0003);
    const lngPad = Math.max((maxLng - minLng) * 0.2, 0.0003);

    return {
      minLat: minLat - latPad,
      maxLat: maxLat + latPad,
      minLng: minLng - lngPad,
      maxLng: maxLng + lngPad,
    };
  }, [positionsWithDevices]);

  const sources = useMemo(() => {
    return Array.from(
      new Set(snapshot.latestPositions.map((item) => item.source)),
    ).sort();
  }, [snapshot.latestPositions]);

  const mapPoints = useMemo(() => {
    const latRange = bounds.maxLat - bounds.minLat || 1;
    const lngRange = bounds.maxLng - bounds.minLng || 1;

    return positionsWithDevices.map((item) => {
      const x =
        ((item.position.position.longitude - bounds.minLng) / lngRange) *
          (viewWidth - 120) +
        60;

      const y =
        viewHeight -
        60 -
        ((item.position.position.latitude - bounds.minLat) / latRange) *
          (viewHeight - 120);

      return {
        ...item,
        x,
        y,
        color: getDeviceColor(item.device.type),
        glyph: getDeviceGlyph(item.device.type),
      };
    });
  }, [positionsWithDevices, bounds]);

  const metrics = useMemo(() => {
    const accuracyValues = positionsWithDevices
      .map((item) => item.position.quality?.accuracyMeters)
      .filter((value): value is number => typeof value === "number");

    const averageAccuracy =
      accuracyValues.length > 0
        ? accuracyValues.reduce((sum, value) => sum + value, 0) / accuracyValues.length
        : 0;

    const subMeter = accuracyValues.filter((value) => value <= 1).length;

    return {
      visibleDevices: positionsWithDevices.length,
      allDevices: snapshot.devices.length,
      averageAccuracy,
      subMeter,
      activeConnections: snapshot.connections.filter(
        (connection) => connection.status === "online",
      ).length,
    };
  }, [positionsWithDevices, snapshot]);

  const setBooleanLayer = (key: BooleanLayerKey, value: boolean) => {
    setLayers((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const setSelectedSource = (value: string) => {
    setLayers((current) => ({
      ...current,
      selectedSource: value,
    }));
  };

  return (
    <section style={styles.panel} aria-label="Mapa interno de operación Aplomo">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Aplomo Live Map</p>
          <h2 style={styles.title}>Mapa operativo de dispositivos vivos</h2>
          <p style={styles.text}>
            Vista visual interna compartida con el panel administrativo:
            emisores, receptores, precisión GPS, RTK, drones, camiones y fuentes
            de telemetría.
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button type="button" style={styles.button} onClick={() => advanceTicks(1)}>
            Avanzar mapa
          </button>
          <button type="button" style={styles.secondaryButton} onClick={() => advanceTicks(10)}>
            Simular 10 ticks
          </button>
          <button type="button" style={styles.secondaryButton} onClick={resetDemo}>
            Reiniciar mapa
          </button>
        </div>
      </div>

      <div style={styles.layout}>
        <div style={styles.mapCard}>
          <svg
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            width="100%"
            height="100%"
            role="img"
            aria-label="Mapa SVG de dispositivos Aplomo"
          >
            <defs>
              <pattern
                id="aplomo-grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeWidth="1"
                />
              </pattern>

              <linearGradient id="yard-bg" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(15, 23, 42, 1)" />
                <stop offset="100%" stopColor="rgba(8, 47, 73, 1)" />
              </linearGradient>
            </defs>

            <rect width={viewWidth} height={viewHeight} fill="url(#yard-bg)" />
            <rect width={viewWidth} height={viewHeight} fill="url(#aplomo-grid)" />

            <rect
              x="90"
              y="95"
              width="820"
              height="400"
              rx="34"
              fill="rgba(15, 23, 42, 0.44)"
              stroke="rgba(125, 211, 252, 0.28)"
              strokeWidth="3"
            />

            <path
              d="M 140 415 C 260 340, 380 455, 510 360 S 740 300, 850 220"
              fill="none"
              stroke="rgba(251, 191, 36, 0.45)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="18 16"
            />

            <text x="115" y="135" fill="#7dd3fc" fontSize="22" fontWeight="800">
              Patio industrial simulado
            </text>

            <text x="115" y="165" fill="#94a3b8" fontSize="14">
              Runtime compartido · tick {tick}
            </text>

            {layers.showReceivers
              ? snapshot.devices
                  .filter((device) => device.type === "tablet" || device.type === "browser_console")
                  .map((device, index) => (
                    <g key={`receiver-${device.id}`}>
                      <rect
                        x={720 + index * 12}
                        y={105 + index * 12}
                        width="120"
                        height="54"
                        rx="14"
                        fill="rgba(56, 189, 248, 0.16)"
                        stroke="rgba(125, 211, 252, 0.44)"
                      />
                      <text
                        x={738 + index * 12}
                        y={136 + index * 12}
                        fill="#e0f2fe"
                        fontSize="14"
                        fontWeight="800"
                      >
                        Receptor
                      </text>
                    </g>
                  ))
              : null}

            {mapPoints.map((point) => {
              const accuracy = point.position.quality?.accuracyMeters;
              const accuracyRadius =
                typeof accuracy === "number"
                  ? Math.max(18, Math.min(90, accuracy * 7))
                  : 40;

              return (
                <g key={point.position.deviceId}>
                  {layers.showAccuracy ? (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={accuracyRadius}
                      fill={point.color}
                      opacity="0.12"
                      stroke={point.color}
                      strokeOpacity="0.36"
                      strokeWidth="2"
                    />
                  ) : null}

                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="22"
                    fill={point.color}
                    stroke="#020617"
                    strokeWidth="4"
                  />

                  <text
                    x={point.x}
                    y={point.y + 4}
                    textAnchor="middle"
                    fill="#020617"
                    fontSize={point.glyph.length > 2 ? "10" : "12"}
                    fontWeight="950"
                  >
                    {point.glyph}
                  </text>

                  {layers.showLabels ? (
                    <g>
                      <rect
                        x={point.x + 28}
                        y={point.y - 25}
                        width="210"
                        height="52"
                        rx="12"
                        fill="rgba(2, 6, 23, 0.86)"
                        stroke="rgba(148, 163, 184, 0.28)"
                      />

                      <text
                        x={point.x + 40}
                        y={point.y - 6}
                        fill="#f8fafc"
                        fontSize="13"
                        fontWeight="800"
                      >
                        {point.device.name}
                      </text>

                      <text
                        x={point.x + 40}
                        y={point.y + 13}
                        fill="#cbd5e1"
                        fontSize="11"
                      >
                        {point.position.source} · {formatAccuracy(accuracy)}
                      </text>
                    </g>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>

        <aside style={styles.sidebar}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Estado del mapa</h3>
            <div style={styles.metric}>
              <span>Tick compartido</span>
              <strong style={styles.metricStrong}>{tick}</strong>
            </div>
            <div style={styles.metric}>
              <span>Dispositivos visibles</span>
              <strong style={styles.metricStrong}>
                {metrics.visibleDevices}/{metrics.allDevices}
              </strong>
            </div>
            <div style={styles.metric}>
              <span>Conexiones online</span>
              <strong style={styles.metricStrong}>{metrics.activeConnections}</strong>
            </div>
            <div style={styles.metric}>
              <span>Precisión promedio</span>
              <strong style={styles.metricStrong}>
                {metrics.averageAccuracy.toFixed(2)} m
              </strong>
            </div>
            <div style={styles.metric}>
              <span>Submétricos</span>
              <strong style={styles.metricStrong}>{metrics.subMeter}</strong>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Capas</h3>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={layers.showPhones}
                onChange={(event) => setBooleanLayer("showPhones", event.target.checked)}
              />
              Celulares/tablets
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={layers.showDrones}
                onChange={(event) => setBooleanLayer("showDrones", event.target.checked)}
              />
              Drones
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={layers.showRtk}
                onChange={(event) => setBooleanLayer("showRtk", event.target.checked)}
              />
              RTK/GNSS
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={layers.showVehicles}
                onChange={(event) => setBooleanLayer("showVehicles", event.target.checked)}
              />
              Vehículos
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={layers.showReceivers}
                onChange={(event) => setBooleanLayer("showReceivers", event.target.checked)}
              />
              Receptores
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={layers.showAccuracy}
                onChange={(event) => setBooleanLayer("showAccuracy", event.target.checked)}
              />
              Radio de precisión
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={layers.showLabels}
                onChange={(event) => setBooleanLayer("showLabels", event.target.checked)}
              />
              Etiquetas
            </label>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Filtro por fuente</h3>
            <select
              style={styles.input}
              value={layers.selectedSource}
              onChange={(event) => setSelectedSource(event.target.value)}
            >
              <option value="all">Todas</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Leyenda</h3>
            <div style={styles.legendItem}>
              <span style={{ ...styles.dot, background: "#facc15" }} />
              Celular / operador
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.dot, background: "#38bdf8" }} />
              Receptor / supervisor
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.dot, background: "#a78bfa" }} />
              Dron
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.dot, background: "#22c55e" }} />
              GNSS / RTK
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.dot, background: "#f97316" }} />
              Vehículo / máquina
            </div>
          </div>
        </aside>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Dispositivo</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Fuente</th>
              <th style={styles.th}>Latitud</th>
              <th style={styles.th}>Longitud</th>
              <th style={styles.th}>Precisión</th>
              <th style={styles.th}>Fix</th>
            </tr>
          </thead>
          <tbody>
            {positionsWithDevices.map((item) => {
              const accuracy = item.position.quality?.accuracyMeters;
              const highPrecision =
                typeof accuracy === "number" && accuracy <= 1;

              return (
                <tr key={item.position.deviceId}>
                  <td style={styles.td}>{item.device.name}</td>
                  <td style={styles.td}>
                    <span style={styles.pill}>{item.device.type}</span>
                  </td>
                  <td style={styles.td}>{item.position.source}</td>
                  <td style={{ ...styles.td, ...styles.mono }}>
                    {item.position.position.latitude}
                  </td>
                  <td style={{ ...styles.td, ...styles.mono }}>
                    {item.position.position.longitude}
                  </td>
                  <td style={styles.td}>
                    <span style={highPrecision ? styles.goodPill : styles.warningPill}>
                      {formatAccuracy(accuracy)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {item.position.quality?.fixType ?? "unknown"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
