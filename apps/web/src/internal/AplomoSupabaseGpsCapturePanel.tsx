import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  createAplomoBrowserGpsCapture,
  loadAplomoSupabaseWritableContext,
  signInAplomoWithPassword,
  signOutAplomo,
  signUpAplomoWithPassword,
  type AplomoSupabaseWritableContext,
} from "../integrations/aplomoSupabaseGpsCaptureRepository.js";

const styles = {
  panel: {
    border: "1px solid rgba(168, 85, 247, 0.34)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(88, 28, 135, 0.46))",
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
    color: "#d8b4fe",
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    marginTop: 16,
  },
  label: {
    display: "grid",
    gap: 6,
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: 800,
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
    background: "#c084fc",
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
  card: {
    marginTop: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
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
    fontSize: 20,
    fontWeight: 950,
  },
  pill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(192, 132, 252, 0.14)",
    color: "#e9d5ff",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
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
  pre: {
    margin: "10px 0 0",
    whiteSpace: "pre-wrap",
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 1.5,
  },
} satisfies Record<string, CSSProperties>;

export function AplomoSupabaseGpsCapturePanel() {
  const [context, setContext] = useState<AplomoSupabaseWritableContext | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("Carlos");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [selectedStockpileId, setSelectedStockpileId] = useState("");
  const [captureType, setCaptureType] = useState("point");
  const [note, setNote] = useState("Captura GPS real desde navegador");
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const loadContext = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoSupabaseWritableContext();
      setContext(result);

      if (!selectedDeviceId && result.devices[0]) {
        setSelectedDeviceId(result.devices[0].id);
      }

      if (!selectedStockpileId && result.stockpiles[0]) {
        setSelectedStockpileId(result.stockpiles[0].id);
      }

      setStatus("Contexto Supabase cargado.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void loadContext();
  }, []);

  const selectedDevice = useMemo(() => {
    return context?.devices.find((device) => device.id === selectedDeviceId) ?? null;
  }, [context?.devices, selectedDeviceId]);

  const selectedStockpile = useMemo(() => {
    return (
      context?.stockpiles.find((stockpile) => stockpile.id === selectedStockpileId) ??
      null
    );
  }, [context?.stockpiles, selectedStockpileId]);

  const selectedSiteId =
    selectedDevice?.site_id ?? selectedStockpile?.site_id ?? context?.sites[0]?.id ?? null;

  const signIn = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      await signInAplomoWithPassword({ email, password, displayName });
      setStatus("SesiÃ³n iniciada.");
      await loadContext();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsBusy(false);
    }
  };

  const signUp = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      await signUpAplomoWithPassword({ email, password, displayName });
      setStatus("Usuario creado. Si Supabase pide confirmaciÃ³n por correo, confirma antes de iniciar sesiÃ³n.");
      await loadContext();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsBusy(false);
    }
  };

  const signOut = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      await signOutAplomo();
      setStatus("SesiÃ³n cerrada.");
      await loadContext();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsBusy(false);
    }
  };

  const captureGps = async () => {
    if (!context?.companyId) {
      setErrorMessage("No hay companyId. Inicia sesiÃ³n y confirma membership.");
      return;
    }

    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await createAplomoBrowserGpsCapture({
        companyId: context.companyId,
        siteId: selectedSiteId,
        deviceId: selectedDeviceId || null,
        stockpileId: selectedStockpileId || null,
        captureType,
        note,
      });

      setStatus(`Captura guardada: ${result.capture.id}`);
      await loadContext();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section style={styles.panel} aria-label="Login y escritura GPS Supabase">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Supabase Write MVP</p>
          <h2 style={styles.title}>Login real + captura GPS real</h2>
          <p style={styles.text}>
            Inicia sesiÃ³n con Supabase Auth y guarda una captura GPS real del navegador
            en aplomo_gps_captures. Si eliges dispositivo, tambiÃ©n actualiza
            aplomo_latest_device_positions.
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button type="button" style={styles.secondaryButton} disabled={isBusy} onClick={() => void loadContext()}>
            Recargar contexto
          </button>
          <button type="button" style={styles.secondaryButton} disabled={isBusy} onClick={() => void signOut()}>
            Cerrar sesiÃ³n
          </button>
        </div>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Usuario</p>
          <p style={styles.metricValue}>{context?.user?.email ?? "sin sesiÃ³n"}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Company</p>
          <p style={styles.metricValue}>{context?.companyId ? "activa" : "sin membership"}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Dispositivos</p>
          <p style={styles.metricValue}>{context?.devices.length ?? 0}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Stockpiles</p>
          <p style={styles.metricValue}>{context?.stockpiles.length ?? 0}</p>
        </div>
      </div>

      {!context?.user ? (
        <div style={styles.card}>
          <span style={styles.pill}>Auth</span>

          <div style={styles.grid}>
            <label style={styles.label}>
              Nombre
              <input
                style={styles.input}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </label>

            <label style={styles.label}>
              Email
              <input
                style={styles.input}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
              />
            </label>

            <label style={styles.label}>
              Password
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="mÃ­nimo 6 caracteres"
              />
            </label>
          </div>

          <div style={styles.buttonRow}>
            <button type="button" style={styles.button} disabled={isBusy} onClick={() => void signIn()}>
              Iniciar sesiÃ³n
            </button>
            <button type="button" style={styles.secondaryButton} disabled={isBusy} onClick={() => void signUp()}>
              Crear usuario
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <span style={styles.okPill}>SesiÃ³n activa</span>

          <div style={styles.grid}>
            <label style={styles.label}>
              Dispositivo
              <select
                style={styles.input}
                value={selectedDeviceId}
                onChange={(event) => setSelectedDeviceId(event.target.value)}
              >
                <option value="">Sin dispositivo</option>
                {(context?.devices ?? []).map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} Â· {device.type}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Stockpile
              <select
                style={styles.input}
                value={selectedStockpileId}
                onChange={(event) => setSelectedStockpileId(event.target.value)}
              >
                <option value="">Sin stockpile</option>
                {(context?.stockpiles ?? []).map((stockpile) => (
                  <option key={stockpile.id} value={stockpile.id}>
                    {stockpile.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Tipo de captura
              <select
                style={styles.input}
                value={captureType}
                onChange={(event) => setCaptureType(event.target.value)}
              >
                <option value="point">Punto</option>
                <option value="stockpile_boundary">LÃ­mite de stockpile</option>
                <option value="evidence_point">Punto de evidencia</option>
                <option value="device_checkin">Check-in de dispositivo</option>
              </select>
            </label>

            <label style={styles.label}>
              Nota
              <input
                style={styles.input}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
          </div>

          <div style={styles.buttonRow}>
            <button type="button" style={styles.button} disabled={isBusy} onClick={() => void captureGps()}>
              Guardar captura GPS real
            </button>
          </div>

          <p style={styles.text}>
            El navegador pedirÃ¡ permiso de ubicaciÃ³n. En producciÃ³n requiere HTTPS;
            en local funciona en localhost.
          </p>
        </div>
      )}

      {status ? (
        <div style={styles.card}>
          <span style={styles.okPill}>Status</span>
          <pre style={styles.pre}>{status}</pre>
        </div>
      ) : null}

      {errorMessage ? (
        <div style={styles.card}>
          <span style={styles.dangerPill}>Error</span>
          <pre style={styles.pre}>{errorMessage}</pre>
          <p style={styles.text}>
            Si es error de permisos, corre la migraciÃ³n SQL de write policies y confirma
            que tu usuario tenga membership en aplomo_company_memberships.
          </p>
        </div>
      ) : null}
    </section>
  );
}
