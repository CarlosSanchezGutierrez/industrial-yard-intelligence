import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  loadAplomoSupabaseMvpSnapshot,
  type AplomoDbDeviceRow,
  type AplomoDbLatestPositionRow,
  type AplomoDbStockpileRow,
  type AplomoSupabaseMvpSnapshot,
} from "../integrations/aplomoSupabaseMvpRepository.js";

type MapPoint = {
  id: string;
  kind: "device" | "stockpile";
  label: string;
  sublabel: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  status: string;
  colorHint: "good" | "warning" | "neutral";
};

type Bounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

const styles = {
  panel: {
    border: "1px solid rgba(59, 130, 246, 0.32)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(30, 64, 175, 0.42))",
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
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
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
  mapShell: {
    marginTop: 16,
    border: "1px solid rgba(148, 163, 184, 0.24)",
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(2, 6, 23, 0.72)",
  },
  mapHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 14px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
    color: "#cbd5e1",
    fontSize: 12,
    flexWrap: "wrap",
  },
  mapCanvas: {
    width: "100%",
    height: "520px",
    display: "block",
    background:
      "radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.18), transparent 32%), rgba(2, 6, 23, 0.96)",
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
    minWidth: 920,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#bfdbfe",
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
    background: "rgba(96, 165, 250, 0.12)",
    color: "#bfdbfe",
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
  card: {
    marginTop: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
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

const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const formatNumber = (value: number | undefined, digits = 6): string => {
  if (!isNumber(value)) {
    return "no data";
  }

  return value.toFixed(digits);
};

const formatAccuracy = (value: number | undefined): string => {
  if (!isNumber(value)) {
    return "no data";
  }

  if (value < 1) {
    return `${value.toFixed(2)} m`;
  }

  return `${value.toFixed(1)} m`;
};

const deviceLabel = (
  device: AplomoDbDeviceRow | undefined,
  position: AplomoDbLatestPositionRow,
): string => {
  return device?.name ?? position.device_id;
};

const createMapPoints = (
  snapshot: AplomoSupabaseMvpSnapshot | null,
): MapPoint[] => {
  if (!snapshot) {
    return [];
  }

  const devicePoints: MapPoint[] = snapshot.latestPositions
    .filter((position) => isNumber(position.latitude) && isNumber(position.longitude))
    .map((position) => {
      const device = snapshot.devices.find((item) => item.id === position.device_id);
      const accuracy = position.accuracy_meters ?? undefined;

      return {
        id: `device-${position.device_id}`,
        kind: "device",
        label: deviceLabel(device, position),
        sublabel: `${device?.type ?? "device"} Â· ${position.source}`,
        latitude: position.latitude,
        longitude: position.longitude,
        ...(typeof accuracy === "number" ? { accuracyMeters: accuracy } : {}),
        status: position.status,
        colorHint: isNumber(accuracy) && accuracy <= 1 ? "good" : "warning",
      };
    });

  const stockpilePoints: MapPoint[] = snapshot.stockpiles
    .filter(
      (stockpile) =>
        isNumber(stockpile.centroid_latitude) && isNumber(stockpile.centroid_longitude),
    )
    .map((stockpile) => ({
      id: `stockpile-${stockpile.id}`,
      kind: "stockpile",
      label: stockpile.name,
      sublabel: "stockpile centroid",
      latitude: stockpile.centroid_latitude as number,
      longitude: stockpile.centroid_longitude as number,
      status: stockpile.status,
      colorHint: "neutral",
    }));

  return [...stockpilePoints, ...devicePoints];
};

const calculateBounds = (points: MapPoint[]): Bounds => {
  if (points.length === 0) {
    return {
      minLat: 22.405,
      maxLat: 22.409,
      minLng: -97.940,
      maxLng: -97.936,
    };
  }

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latPadding = Math.max((maxLat - minLat) * 0.2, 0.0008);
  const lngPadding = Math.max((maxLng - minLng) * 0.2, 0.0008);

  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLng: minLng - lngPadding,
    maxLng: maxLng + lngPadding,
  };
};

const projectPoint = (point: MapPoint, bounds: Bounds) => {
  const lngRange = Math.max(bounds.maxLng - bounds.minLng, 0.000001);
  const latRange = Math.max(bounds.maxLat - bounds.minLat, 0.000001);

  const x = ((point.longitude - bounds.minLng) / lngRange) * 1000;
  const y = (1 - (point.latitude - bounds.minLat) / latRange) * 520;

  return {
    x: Math.max(24, Math.min(976, x)),
    y: Math.max(24, Math.min(496, y)),
  };
};

const pointFill = (point: MapPoint): string => {
  if (point.kind === "stockpile") {
    return "#f59e0b";
  }

  if (point.colorHint === "good") {
    return "#22c55e";
  }

  if (point.colorHint === "warning") {
    return "#fbbf24";
  }

  return "#60a5fa";
};

const pointStroke = (point: MapPoint): string => {
  if (point.kind === "stockpile") {
    return "#fed7aa";
  }

  return "#dbeafe";
};

export function AplomoSupabaseLiveMapPanel() {
  const [snapshot, setSnapshot] = useState<AplomoSupabaseMvpSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const load = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoSupabaseMvpSnapshot();
      setSnapshot(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const timer = window.setInterval(() => {
      void load();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [autoRefresh]);

  const points = useMemo(() => createMapPoints(snapshot), [snapshot]);
  const bounds = useMemo(() => calculateBounds(points), [points]);

  const deviceCount = snapshot?.devices.length ?? 0;
  const livePositionCount = snapshot?.latestPositions.length ?? 0;
  const stockpileCount = snapshot?.stockpiles.length ?? 0;
  const highPrecisionCount =
    snapshot?.latestPositions.filter(
      (position) =>
        typeof position.accuracy_meters === "number" && position.accuracy_meters <= 1,
    ).length ?? 0;

  return (
    <section style={styles.panel} aria-label="Supabase live map">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Supabase Live Map</p>
          <h2 style={styles.title}>Mapa vivo real desde Supabase</h2>
          <p style={styles.text}>
            Visualiza posiciones reales de dispositivos y centroides reales de
            stockpiles usando las tablas del MVP: latest positions, devices y stockpiles.
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.button}
            disabled={isLoading}
            onClick={() => void load()}
          >
            {isLoading ? "Loading..." : "Reload"}
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => setAutoRefresh((value) => !value)}
          >
            Auto refresh: {autoRefresh ? "on" : "off"}
          </button>
        </div>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Devices</p>
          <p style={styles.metricValue}>{deviceCount}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Live positions</p>
          <p style={styles.metricValue}>{livePositionCount}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Stockpiles</p>
          <p style={styles.metricValue}>{stockpileCount}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>High precision</p>
          <p style={styles.metricValue}>{highPrecisionCount}</p>
        </div>
      </div>

      {errorMessage ? (
        <div style={styles.card}>
          <span style={styles.dangerPill}>Supabase error</span>
          <pre style={styles.pre}>{errorMessage}</pre>
        </div>
      ) : null}

      <div style={styles.mapShell}>
        <div style={styles.mapHeader}>
          <span>
            Bounds lat {formatNumber(bounds.minLat)} to {formatNumber(bounds.maxLat)}
          </span>
          <span>
            Bounds lng {formatNumber(bounds.minLng)} to {formatNumber(bounds.maxLng)}
          </span>
          <span>Loaded: {snapshot?.loadedAt ?? "pending"}</span>
        </div>

        <svg style={styles.mapCanvas} viewBox="0 0 1000 520" role="img">
          <defs>
            <pattern id="aplomo-live-map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(148, 163, 184, 0.16)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect x="0" y="0" width="1000" height="520" fill="url(#aplomo-live-map-grid)" />
          <rect
            x="18"
            y="18"
            width="964"
            height="484"
            rx="22"
            fill="rgba(15, 23, 42, 0.2)"
            stroke="rgba(147, 197, 253, 0.28)"
          />

          <text x="30" y="48" fill="#bfdbfe" fontSize="15" fontWeight="900">
            Aplomo Yard Live Layer
          </text>

          <text x="30" y="72" fill="#94a3b8" fontSize="11">
            Real Supabase data. Not simulator.
          </text>

          {points.length === 0 ? (
            <text x="380" y="260" fill="#cbd5e1" fontSize="16" fontWeight="800">
              No live points visible. Check RLS, membership or seed data.
            </text>
          ) : null}

          {points.map((point) => {
            const projected = projectPoint(point, bounds);
            const radius = point.kind === "stockpile" ? 16 : 11;

            return (
              <g key={point.id}>
                {point.kind === "stockpile" ? (
                  <rect
                    x={projected.x - radius}
                    y={projected.y - radius}
                    width={radius * 2}
                    height={radius * 2}
                    rx="6"
                    fill={pointFill(point)}
                    stroke={pointStroke(point)}
                    strokeWidth="2"
                    opacity="0.92"
                  />
                ) : (
                  <circle
                    cx={projected.x}
                    cy={projected.y}
                    r={radius}
                    fill={pointFill(point)}
                    stroke={pointStroke(point)}
                    strokeWidth="2"
                  />
                )}

                <text
                  x={projected.x + 18}
                  y={projected.y - 4}
                  fill="#f8fafc"
                  fontSize="12"
                  fontWeight="900"
                >
                  {point.label}
                </text>

                <text
                  x={projected.x + 18}
                  y={projected.y + 12}
                  fill="#cbd5e1"
                  fontSize="10"
                >
                  {point.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Point</th>
              <th style={styles.th}>Kind</th>
              <th style={styles.th}>Lat</th>
              <th style={styles.th}>Lng</th>
              <th style={styles.th}>Accuracy</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.id}>
                <td style={styles.td}>
                  <strong>{point.label}</strong>
                  <br />
                  <span style={{ ...styles.mono, color: "#94a3b8" }}>
                    {point.sublabel}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={point.kind === "device" ? styles.pill : styles.warningPill}>
                    {point.kind}
                  </span>
                </td>
                <td style={{ ...styles.td, ...styles.mono }}>
                  {formatNumber(point.latitude)}
                </td>
                <td style={{ ...styles.td, ...styles.mono }}>
                  {formatNumber(point.longitude)}
                </td>
                <td style={styles.td}>{formatAccuracy(point.accuracyMeters)}</td>
                <td style={styles.td}>{point.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
