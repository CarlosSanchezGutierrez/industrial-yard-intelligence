import { aplomoBackendConfig } from "./aplomoBackendConfig.js";
import {
  createAplomoGpsCapture,
  type AplomoGpsCaptureInput,
  type AplomoGpsCaptureRow,
} from "./gpsCaptureRepository.js";

export type AplomoGpsSyncMode = "local-demo" | "supabase";

export type AplomoGpsSyncInput = {
  companyId?: string;
  siteId?: string;
  yardId?: string;
  zoneId?: string;
  stockpileId?: string;
  capturedByProfileId?: string;
  captureType?: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  geometryGeojson?: Record<string, unknown>;
  status?: string;
  notes?: string;
};

export type AplomoGpsSyncResult =
  | {
      ok: true;
      status: "synced";
      mode: "supabase";
      captureId: string;
      message: string;
      data: AplomoGpsCaptureRow;
    }
  | {
      ok: false;
      status: "skipped";
      mode: AplomoGpsSyncMode;
      message: string;
    }
  | {
      ok: false;
      status: "failed";
      mode: "supabase";
      message: string;
    };

export type AplomoGpsSyncStatus = {
  backendMode: "local-demo" | "supabase-ready";
  canSyncToCloud: boolean;
  message: string;
};

const cleanText = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

const cleanNumber = (value: number | undefined): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return undefined;
};

export const getAplomoGpsSyncStatus = (): AplomoGpsSyncStatus => {
  return {
    backendMode: aplomoBackendConfig.mode,
    canSyncToCloud: aplomoBackendConfig.isConfigured,
    message: aplomoBackendConfig.isConfigured
      ? "Cloud sync is ready."
      : "Cloud sync is not configured. Local demo mode remains active.",
  };
};

export const syncAplomoGpsCapture = async (
  input: AplomoGpsSyncInput,
): Promise<AplomoGpsSyncResult> => {
  const companyId = cleanText(input.companyId);

  if (!companyId) {
    return {
      ok: false,
      status: "skipped",
      mode: aplomoBackendConfig.isConfigured ? "supabase" : "local-demo",
      message: "Missing companyId. GPS capture was not synced.",
    };
  }

  if (!aplomoBackendConfig.isConfigured) {
    return {
      ok: false,
      status: "skipped",
      mode: "local-demo",
      message: aplomoBackendConfig.reason,
    };
  }

  const payload: AplomoGpsCaptureInput = {
    companyId,
    captureType: cleanText(input.captureType) ?? "point",
    status: cleanText(input.status) ?? "draft",
  };

  const siteId = cleanText(input.siteId);
  if (siteId) {
    payload.siteId = siteId;
  }

  const yardId = cleanText(input.yardId);
  if (yardId) {
    payload.yardId = yardId;
  }

  const zoneId = cleanText(input.zoneId);
  if (zoneId) {
    payload.zoneId = zoneId;
  }

  const stockpileId = cleanText(input.stockpileId);
  if (stockpileId) {
    payload.stockpileId = stockpileId;
  }

  const capturedByProfileId = cleanText(input.capturedByProfileId);
  if (capturedByProfileId) {
    payload.capturedByProfileId = capturedByProfileId;
  }

  const notes = cleanText(input.notes);
  if (notes) {
    payload.notes = notes;
  }

  const latitude = cleanNumber(input.latitude);
  if (typeof latitude === "number") {
    payload.latitude = latitude;
  }

  const longitude = cleanNumber(input.longitude);
  if (typeof longitude === "number") {
    payload.longitude = longitude;
  }

  const accuracyMeters = cleanNumber(input.accuracyMeters);
  if (typeof accuracyMeters === "number") {
    payload.accuracyMeters = accuracyMeters;
  }

  if (input.geometryGeojson) {
    payload.geometryGeojson = input.geometryGeojson;
  }

  const result = await createAplomoGpsCapture(payload);

  if (!result.ok) {
    return {
      ok: false,
      status: "failed",
      mode: "supabase",
      message: result.error,
    };
  }

  return {
    ok: true,
    status: "synced",
    mode: "supabase",
    captureId: result.data.id,
    message: "GPS capture synced to Supabase.",
    data: result.data,
  };
};
