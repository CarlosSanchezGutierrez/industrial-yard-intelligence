import { useMemo, useState, type CSSProperties } from "react";

import {
  getAplomoGpsSyncStatus,
  syncAplomoGpsCapture,
  type AplomoGpsSyncInput,
  type AplomoGpsSyncResult,
} from "../integrations/gpsSyncService.js";

type FieldState = {
  companyId: string;
  notes: string;
  latitude: string;
  longitude: string;
  accuracyMeters: string;
};

const styles = {
  panel: {
    border: "1px solid rgba(148, 163, 184, 0.28)",
    borderRadius: 18,
    padding: 16,
    background:
      "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.98))",
    color: "#e5e7eb",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.28)",
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "0.01em",
  },
  text: {
    margin: "8px 0 0",
    fontSize: 13,
    lineHeight: 1.5,
    color: "#cbd5e1",
  },
  grid: {
    display: "grid",
    gap: 10,
    marginTop: 14,
  },
  label: {
    display: "grid",
    gap: 6,
    fontSize: 12,
    color: "#cbd5e1",
  },
  input: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.32)",
    background: "rgba(15, 23, 42, 0.92)",
    color: "#f8fafc",
    padding: "10px 12px",
    outline: "none",
  },
  button: {
    marginTop: 14,
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    background: "#38bdf8",
    color: "#020617",
    fontWeight: 800,
    cursor: "pointer",
  },
  mutedButton: {
    marginTop: 14,
    border: "1px solid rgba(148, 163, 184, 0.32)",
    borderRadius: 12,
    padding: "10px 14px",
    background: "rgba(15, 23, 42, 0.92)",
    color: "#94a3b8",
    fontWeight: 700,
    cursor: "not-allowed",
  },
  result: {
    marginTop: 14,
    borderRadius: 12,
    padding: 12,
    background: "rgba(15, 23, 42, 0.78)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    fontSize: 12,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    color: "#e2e8f0",
  },
} satisfies Record<string, CSSProperties>;

const toNumber = (value: string): number | undefined => {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const formatResult = (result: AplomoGpsSyncResult): string => {
  if (result.ok) {
    return [
      "Estado: sincronizado",
      `Modo: ${result.mode}`,
      `Capture ID: ${result.captureId}`,
      `Mensaje: ${result.message}`,
    ].join("\n");
  }

  return [
    `Estado: ${result.status}`,
    `Modo: ${result.mode}`,
    `Mensaje: ${result.message}`,
  ].join("\n");
};

export function AplomoCloudSyncDevPanel() {
  const syncStatus = useMemo(() => getAplomoGpsSyncStatus(), []);

  const [fields, setFields] = useState<FieldState>({
    companyId: "",
    notes: "Captura de prueba desde panel interno Aplomo.",
    latitude: "22.4070",
    longitude: "-97.9385",
    accuracyMeters: "8.5",
  });

  const [isSending, setIsSending] = useState(false);
  const [resultText, setResultText] = useState("");

  const canTrySync = fields.companyId.trim().length > 0 && !isSending;

  const updateField = (key: keyof FieldState, value: string) => {
    setFields((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleTrySync = async () => {
    if (!canTrySync) {
      return;
    }

    setIsSending(true);
    setResultText("");

    try {
      const latitude = toNumber(fields.latitude);
      const longitude = toNumber(fields.longitude);
      const accuracyMeters = toNumber(fields.accuracyMeters);
      const notes = fields.notes.trim();

      const payload: AplomoGpsSyncInput = {
        companyId: fields.companyId.trim(),
        captureType: "point",
        status: "draft",
      };

      if (typeof latitude === "number") {
        payload.latitude = latitude;
      }

      if (typeof longitude === "number") {
        payload.longitude = longitude;
      }

      if (typeof accuracyMeters === "number") {
        payload.accuracyMeters = accuracyMeters;
      }

      if (notes.length > 0) {
        payload.notes = notes;
      }

      if (typeof latitude === "number" && typeof longitude === "number") {
        payload.geometryGeojson = {
          type: "Point",
          coordinates: [longitude, latitude],
        };
      }

      const result = await syncAplomoGpsCapture(payload);

      setResultText(formatResult(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      setResultText(`Estado: error\nMensaje: ${message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section style={styles.panel} aria-label="Panel interno de sincronización cloud">
      <h2 style={styles.title}>Prueba interna cloud sync</h2>

      <p style={styles.text}>
        Modo backend: <strong>{syncStatus.backendMode}</strong>
      </p>

      <p style={styles.text}>{syncStatus.message}</p>

      <div style={styles.grid}>
        <label style={styles.label}>
          Company ID de Supabase
          <input
            style={styles.input}
            value={fields.companyId}
            onChange={(event) => updateField("companyId", event.target.value)}
            placeholder="UUID de companies.id"
          />
        </label>

        <label style={styles.label}>
          Nota
          <input
            style={styles.input}
            value={fields.notes}
            onChange={(event) => updateField("notes", event.target.value)}
          />
        </label>

        <label style={styles.label}>
          Latitud
          <input
            style={styles.input}
            value={fields.latitude}
            onChange={(event) => updateField("latitude", event.target.value)}
          />
        </label>

        <label style={styles.label}>
          Longitud
          <input
            style={styles.input}
            value={fields.longitude}
            onChange={(event) => updateField("longitude", event.target.value)}
          />
        </label>

        <label style={styles.label}>
          Precisión metros
          <input
            style={styles.input}
            value={fields.accuracyMeters}
            onChange={(event) => updateField("accuracyMeters", event.target.value)}
          />
        </label>
      </div>

      <button
        type="button"
        style={canTrySync ? styles.button : styles.mutedButton}
        disabled={!canTrySync}
        onClick={handleTrySync}
      >
        {isSending ? "Probando..." : "Probar sincronización cloud"}
      </button>

      {resultText ? <pre style={styles.result}>{resultText}</pre> : null}
    </section>
  );
}
