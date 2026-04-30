import { useMemo, useState, type CSSProperties } from "react";

import { findAplomoDemoContextByCompanySlug } from "../integrations/demoContextRepository.js";
import {
  listRecentAplomoGpsCaptures,
  type AplomoGpsCaptureRow,
} from "../integrations/gpsCaptureRepository.js";
import {
  getAplomoGpsSyncStatus,
  syncAplomoGpsCapture,
  type AplomoGpsSyncInput,
  type AplomoGpsSyncResult,
} from "../integrations/gpsSyncService.js";

type FieldState = {
  companyId: string;
  siteId: string;
  yardId: string;
  zoneId: string;
  capturedByProfileId: string;
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
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  button: {
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    background: "#38bdf8",
    color: "#020617",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid rgba(148, 163, 184, 0.32)",
    borderRadius: 12,
    padding: "10px 14px",
    background: "rgba(15, 23, 42, 0.92)",
    color: "#e2e8f0",
    fontWeight: 700,
    cursor: "pointer",
  },
  mutedButton: {
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

const demoCompanySlug = "cooper-t-smith";

const toNumber = (value: string): number | undefined => {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const formatCoordinate = (value: number): string => value.toFixed(7);

const formatAccuracy = (value: number): string => value.toFixed(1);

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

const formatCapture = (capture: AplomoGpsCaptureRow, index: number): string => {
  return [
    `#${index + 1}`,
    `ID: ${capture.id}`,
    `Estado: ${capture.status}`,
    `Tipo: ${capture.capture_type}`,
    `Lat/Lng: ${capture.latitude ?? "sin lat"}, ${capture.longitude ?? "sin lng"}`,
    `Creada: ${capture.created_at}`,
  ].join("\n");
};

export function AplomoCloudSyncDevPanel() {
  const syncStatus = useMemo(() => getAplomoGpsSyncStatus(), []);

  const [fields, setFields] = useState<FieldState>({
    companyId: "",
    siteId: "",
    yardId: "",
    zoneId: "",
    capturedByProfileId: "",
    notes: "Captura de prueba desde panel interno Aplomo.",
    latitude: "22.4070",
    longitude: "-97.9385",
    accuracyMeters: "8.5",
  });

  const [isSending, setIsSending] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isLoadingCaptures, setIsLoadingCaptures] = useState(false);
  const [isReadingGps, setIsReadingGps] = useState(false);
  const [resultText, setResultText] = useState("");

  const canTrySync = fields.companyId.trim().length > 0 && !isSending;
  const canLoadContext = !isLoadingContext;
  const canListCaptures = fields.companyId.trim().length > 0 && !isLoadingCaptures;
  const canReadGps = !isReadingGps;

  const updateField = (key: keyof FieldState, value: string) => {
    setFields((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleUseDeviceGps = async () => {
    if (!canReadGps) {
      return;
    }

    if (!("geolocation" in navigator)) {
      setResultText("Estado: GPS no disponible\nMensaje: Este navegador no soporta geolocalización.");
      return;
    }

    setIsReadingGps(true);
    setResultText("Estado: solicitando GPS\nMensaje: Autoriza ubicación en el navegador.");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        setFields((current) => ({
          ...current,
          latitude: formatCoordinate(latitude),
          longitude: formatCoordinate(longitude),
          accuracyMeters: formatAccuracy(accuracy),
        }));

        setResultText(
          [
            "Estado: GPS leído",
            `Latitud: ${formatCoordinate(latitude)}`,
            `Longitud: ${formatCoordinate(longitude)}`,
            `Precisión: ${formatAccuracy(accuracy)} m`,
          ].join("\n"),
        );

        setIsReadingGps(false);
      },
      (error) => {
        setResultText(
          [
            "Estado: GPS falló",
            `Código: ${error.code}`,
            `Mensaje: ${error.message}`,
          ].join("\n"),
        );

        setIsReadingGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  const handleLoadDemoContext = async () => {
    if (!canLoadContext) {
      return;
    }

    setIsLoadingContext(true);
    setResultText("");

    try {
      const result = await findAplomoDemoContextByCompanySlug(demoCompanySlug);

      if (!result.ok) {
        setResultText(
          [
            "Estado: no se pudo cargar contexto demo",
            `Modo: ${result.mode}`,
            `Mensaje: ${result.error}`,
          ].join("\n"),
        );
        return;
      }

      setFields((current) => ({
        ...current,
        companyId: result.data.company.id,
        siteId: result.data.site?.id ?? "",
        yardId: result.data.yard?.id ?? "",
        zoneId: result.data.zone?.id ?? "",
        capturedByProfileId: result.data.operatorProfile?.id ?? "",
      }));

      setResultText(
        [
          "Estado: contexto demo cargado",
          `Empresa: ${result.data.company.name}`,
          `Sitio: ${result.data.site?.name ?? "sin sitio"}`,
          `Patio: ${result.data.yard?.name ?? "sin patio"}`,
          `Zona: ${result.data.zone?.name ?? "sin zona"}`,
          `Operador: ${result.data.operatorProfile?.full_name ?? "sin operador"}`,
          `Supervisor: ${result.data.supervisorProfile?.full_name ?? "sin supervisor"}`,
        ].join("\n"),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      setResultText(`Estado: error\nMensaje: ${message}`);
    } finally {
      setIsLoadingContext(false);
    }
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

      if (fields.siteId.trim()) {
        payload.siteId = fields.siteId.trim();
      }

      if (fields.yardId.trim()) {
        payload.yardId = fields.yardId.trim();
      }

      if (fields.zoneId.trim()) {
        payload.zoneId = fields.zoneId.trim();
      }

      if (fields.capturedByProfileId.trim()) {
        payload.capturedByProfileId = fields.capturedByProfileId.trim();
      }

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

  const handleListCaptures = async () => {
    if (!canListCaptures) {
      return;
    }

    setIsLoadingCaptures(true);
    setResultText("");

    try {
      const result = await listRecentAplomoGpsCaptures(fields.companyId.trim(), 5);

      if (!result.ok) {
        setResultText(
          [
            "Estado: no se pudieron listar capturas",
            `Modo: ${result.mode}`,
            `Mensaje: ${result.error}`,
          ].join("\n"),
        );
        return;
      }

      if (result.data.length === 0) {
        setResultText("Estado: consulta correcta\nCapturas recientes: 0");
        return;
      }

      setResultText(
        [
          "Estado: capturas recientes cargadas",
          `Total mostrado: ${result.data.length}`,
          "",
          ...result.data.map((capture, index) => formatCapture(capture, index)),
        ].join("\n\n"),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      setResultText(`Estado: error\nMensaje: ${message}`);
    } finally {
      setIsLoadingCaptures(false);
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
          Company ID
          <input
            style={styles.input}
            value={fields.companyId}
            onChange={(event) => updateField("companyId", event.target.value)}
            placeholder="UUID de companies.id"
          />
        </label>

        <label style={styles.label}>
          Site ID
          <input
            style={styles.input}
            value={fields.siteId}
            onChange={(event) => updateField("siteId", event.target.value)}
            placeholder="UUID de sites.id"
          />
        </label>

        <label style={styles.label}>
          Yard ID
          <input
            style={styles.input}
            value={fields.yardId}
            onChange={(event) => updateField("yardId", event.target.value)}
            placeholder="UUID de yards.id"
          />
        </label>

        <label style={styles.label}>
          Zone ID
          <input
            style={styles.input}
            value={fields.zoneId}
            onChange={(event) => updateField("zoneId", event.target.value)}
            placeholder="UUID de zones.id"
          />
        </label>

        <label style={styles.label}>
          Operador Profile ID
          <input
            style={styles.input}
            value={fields.capturedByProfileId}
            onChange={(event) => updateField("capturedByProfileId", event.target.value)}
            placeholder="UUID de profiles.id"
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

      <div style={styles.buttonRow}>
        <button
          type="button"
          style={canLoadContext ? styles.secondaryButton : styles.mutedButton}
          disabled={!canLoadContext}
          onClick={handleLoadDemoContext}
        >
          {isLoadingContext ? "Buscando..." : "Cargar contexto demo"}
        </button>

        <button
          type="button"
          style={canReadGps ? styles.secondaryButton : styles.mutedButton}
          disabled={!canReadGps}
          onClick={handleUseDeviceGps}
        >
          {isReadingGps ? "Leyendo GPS..." : "Usar GPS del dispositivo"}
        </button>

        <button
          type="button"
          style={canTrySync ? styles.button : styles.mutedButton}
          disabled={!canTrySync}
          onClick={handleTrySync}
        >
          {isSending ? "Probando..." : "Probar sincronización cloud"}
        </button>

        <button
          type="button"
          style={canListCaptures ? styles.secondaryButton : styles.mutedButton}
          disabled={!canListCaptures}
          onClick={handleListCaptures}
        >
          {isLoadingCaptures ? "Consultando..." : "Listar capturas"}
        </button>
      </div>

      {resultText ? <pre style={styles.result}>{resultText}</pre> : null}
    </section>
  );
}
