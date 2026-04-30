import { getAplomoSupabaseClient } from "./supabaseClient.js";

export type AplomoGpsCaptureInput = {
  companyId: string;
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

export type AplomoGpsCaptureRow = {
  id: string;
  company_id: string;
  site_id: string | null;
  yard_id: string | null;
  zone_id: string | null;
  stockpile_id: string | null;
  captured_by_profile_id: string | null;
  capture_type: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_meters: number | null;
  geometry_geojson: Record<string, unknown> | null;
  status: string;
  notes: string | null;
  captured_at: string;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AplomoRepositoryResult<T> =
  | {
      ok: true;
      mode: "supabase";
      data: T;
    }
  | {
      ok: false;
      mode: "local-demo" | "supabase";
      error: string;
    };

const setString = (
  target: Record<string, unknown>,
  key: string,
  value: string | undefined,
): void => {
  if (typeof value === "string" && value.trim().length > 0) {
    target[key] = value.trim();
  }
};

const setNumber = (
  target: Record<string, unknown>,
  key: string,
  value: number | undefined,
): void => {
  if (typeof value === "number" && Number.isFinite(value)) {
    target[key] = value;
  }
};

export const createAplomoGpsCapture = async (
  input: AplomoGpsCaptureInput,
): Promise<AplomoRepositoryResult<AplomoGpsCaptureRow>> => {
  const state = getAplomoSupabaseClient();

  if (!state.isConfigured) {
    return {
      ok: false,
      mode: "local-demo",
      error: state.reason,
    };
  }

  const payload: Record<string, unknown> = {
    company_id: input.companyId,
    capture_type: input.captureType ?? "point",
    status: input.status ?? "draft",
  };

  setString(payload, "site_id", input.siteId);
  setString(payload, "yard_id", input.yardId);
  setString(payload, "zone_id", input.zoneId);
  setString(payload, "stockpile_id", input.stockpileId);
  setString(payload, "captured_by_profile_id", input.capturedByProfileId);
  setString(payload, "notes", input.notes);

  setNumber(payload, "latitude", input.latitude);
  setNumber(payload, "longitude", input.longitude);
  setNumber(payload, "accuracy_meters", input.accuracyMeters);

  if (input.geometryGeojson) {
    payload.geometry_geojson = input.geometryGeojson;
  }

  const { data, error } = await state.client
    .from("gps_captures")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      mode: "supabase",
      error: error.message,
    };
  }

  return {
    ok: true,
    mode: "supabase",
    data: data as AplomoGpsCaptureRow,
  };
};

export const listRecentAplomoGpsCaptures = async (
  companyId: string,
  limit = 25,
): Promise<AplomoRepositoryResult<AplomoGpsCaptureRow[]>> => {
  const state = getAplomoSupabaseClient();

  if (!state.isConfigured) {
    return {
      ok: false,
      mode: "local-demo",
      error: state.reason,
    };
  }

  const safeLimit = Math.max(1, Math.min(limit, 100));

  const { data, error } = await state.client
    .from("gps_captures")
    .select("*")
    .eq("company_id", companyId)
    .order("captured_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    return {
      ok: false,
      mode: "supabase",
      error: error.message,
    };
  }

  return {
    ok: true,
    mode: "supabase",
    data: (data ?? []) as AplomoGpsCaptureRow[],
  };
};
