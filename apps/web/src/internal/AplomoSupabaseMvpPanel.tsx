import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  getAplomoSupabaseMvpConfig,
  loadAplomoSupabaseMvpSnapshot,
  type AplomoSupabaseMvpSnapshot,
} from "../integrations/aplomoSupabaseMvpRepository.js";

const styles = {
  panel: {
    border: "1px solid rgba(34, 197, 94, 0.3)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(22, 101, 52, 0.42))",
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
    color: "#86efac",
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
  button: {
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    background: "#22c55e",
    color: "#020617",
    fontWeight: 900,
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
    minWidth: 920,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#bbf7d0",
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
  code: {
    margin: "8px 0 0",
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

const formatNumber = (value: number | null | undefined, digits = 5): string => {
  if (typeof value !== "number") {
    return "sin dato";
  }

  return value.toFixed(digits);
};

const formatAccuracy = (value: number | null | undefined): string => {
  if (typeof value !== "number") {
    return "sin dato";
  }

  if (value < 1) {
    return `${value.toFixed(2)} m`;
  }

  return `${value.toFixed(1)} m`;
};

export function AplomoSupabaseMvpPanel() {
  const config = useMemo(() => getAplomoSupabaseMvpConfig(), []);
  const [snapshot, setSnapshot] = useState<AplomoSupabaseMvpSnapshot | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const load = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoSupabaseMvpSnapshot();
      setSnapshot(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (config.isConfigured) {
      void load();
    }
  }, [config.isConfigured]);

  const positionByDeviceId = useMemo(() => {
    return new Map(
      snapshot?.latestPositions.map((position) => [
        position.device_id,
        position,
      ]) ?? [],
    );
  }, [snapshot]);

  return (
    <section style={styles.panel} aria-label="Supabase MVP real">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Supabase Real MVP</p>
          <h2 style={styles.title}>Lectura real desde la base de datos</h2>
          <p style={styles.text}>
            Este panel comprueba que la app ya puede leer las tablas reales:
            dispositivos, posiciones, capturas GPS, stockpiles y materiales.
          </p>
        </div>

        <button
          type="button"
          style={styles.button}
          disabled={isLoading || !config.isConfigured}
          onClick={() => void load()}
        >
          {isLoading ? "Cargando..." : "Recargar Supabase"}
        </button>
      </div>

      {!config.isConfigured ? (
        <div style={styles.card}>
          <span style={styles.dangerPill}>Falta configuración</span>
          <pre style={styles.code}>
{`Crea apps/web/.env.local con:

VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_PUBLIC_KEY

Luego reinicia pnpm dev.`}
          </pre>
        </div>
      ) : (
        <div style={styles.card}>
          <span style={styles.pill}>Configurado</span>
          <pre style={styles.code}>
{`URL: ${config.url}
Anon key: ${config.anonKeyPreview}
Usuario actual: ${snapshot?.userId ?? "sin sesión / no logueado"}
Última carga: ${snapshot?.loadedAt ?? "pendiente"}`}
          </pre>
        </div>
      )}

      {errorMessage ? (
        <div style={styles.card}>
          <span style={styles.dangerPill}>Error Supabase</span>
          <pre style={styles.code}>{errorMessage}</pre>
          <p style={styles.text}>
            Si aparecen cero datos o un error de RLS, revisa que tu usuario exista
            en Auth y que tenga membership en aplomo_company_memberships.
          </p>
        </div>
      ) : null}

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Dispositivos</p>
          <p style={styles.metricValue}>{snapshot?.devices.length ?? 0}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Posiciones</p>
          <p style={styles.metricValue}>{snapshot?.latestPositions.length ?? 0}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Capturas GPS</p>
          <p style={styles.metricValue}>{snapshot?.gpsCaptures.length ?? 0}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Stockpiles</p>
          <p style={styles.metricValue}>{snapshot?.stockpiles.length ?? 0}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Materiales</p>
          <p style={styles.metricValue}>{snapshot?.materialTypes.length ?? 0}</p>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Dispositivo</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Protocolo</th>
              <th style={styles.th}>Link físico</th>
              <th style={styles.th}>IP</th>
              <th style={styles.th}>Latitud</th>
              <th style={styles.th}>Longitud</th>
              <th style={styles.th}>Precisión</th>
              <th style={styles.th}>Fix</th>
            </tr>
          </thead>
          <tbody>
            {(snapshot?.devices ?? []).map((device) => {
              const position = positionByDeviceId.get(device.id);

              return (
                <tr key={device.id}>
                  <td style={styles.td}>
                    <strong>{device.name}</strong>
                    <br />
                    <span style={{ ...styles.mono, color: "#94a3b8" }}>
                      {device.external_identifier ?? device.id}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.pill}>{device.type}</span>
                  </td>
                  <td style={styles.td}>{device.role}</td>
                  <td style={styles.td}>{device.protocol ?? "sin dato"}</td>
                  <td style={styles.td}>{device.physical_link ?? "sin dato"}</td>
                  <td style={styles.td}>{device.ip_address ?? "sin dato"}</td>
                  <td style={{ ...styles.td, ...styles.mono }}>
                    {formatNumber(position?.latitude)}
                  </td>
                  <td style={{ ...styles.td, ...styles.mono }}>
                    {formatNumber(position?.longitude)}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={
                        typeof position?.accuracy_meters === "number" &&
                        position.accuracy_meters <= 1
                          ? styles.pill
                          : styles.warningPill
                      }
                    >
                      {formatAccuracy(position?.accuracy_meters)}
                    </span>
                  </td>
                  <td style={styles.td}>{position?.fix_type ?? "sin dato"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Stockpile</th>
              <th style={styles.th}>Material</th>
              <th style={styles.th}>Volumen m3</th>
              <th style={styles.th}>Peso tons</th>
              <th style={styles.th}>Centro lat</th>
              <th style={styles.th}>Centro lng</th>
              <th style={styles.th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {(snapshot?.stockpiles ?? []).map((stockpile) => {
              const material = snapshot?.materialTypes.find(
                (item) => item.id === stockpile.material_type_id,
              );

              return (
                <tr key={stockpile.id}>
                  <td style={styles.td}>
                    <strong>{stockpile.name}</strong>
                  </td>
                  <td style={styles.td}>{material?.name ?? "sin material"}</td>
                  <td style={styles.td}>
                    {stockpile.estimated_volume_m3 ?? "sin dato"}
                  </td>
                  <td style={styles.td}>
                    {stockpile.estimated_weight_tons ?? "sin dato"}
                  </td>
                  <td style={{ ...styles.td, ...styles.mono }}>
                    {formatNumber(stockpile.centroid_latitude)}
                  </td>
                  <td style={{ ...styles.td, ...styles.mono }}>
                    {formatNumber(stockpile.centroid_longitude)}
                  </td>
                  <td style={styles.td}>{stockpile.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
