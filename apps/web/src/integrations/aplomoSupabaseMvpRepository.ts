import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AplomoSupabaseMvpConfig = {
  isConfigured: boolean;
  url: string;
  anonKeyPreview: string;
};

export type AplomoDbDeviceRow = {
  id: string;
  company_id: string;
  site_id: string | null;
  name: string;
  type: string;
  status: string;
  role: string;
  capabilities: string[];
  protocol: string | null;
  physical_link: string | null;
  ip_address: string | null;
  mac_address: string | null;
  serial_number: string | null;
  external_identifier: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoDbLatestPositionRow = {
  id: string;
  company_id: string;
  device_id: string;
  gps_capture_id: string | null;
  source: string;
  status: string;
  latitude: number;
  longitude: number;
  altitude_meters: number | null;
  accuracy_meters: number | null;
  heading_degrees: number | null;
  speed_meters_per_second: number | null;
  fix_type: string | null;
  rtk_status: string | null;
  satellite_count: number | null;
  hdop: number | null;
  vdop: number | null;
  updated_at: string;
};

export type AplomoDbGpsCaptureRow = {
  id: string;
  company_id: string;
  site_id: string | null;
  device_id: string | null;
  stockpile_id: string | null;
  captured_by_profile_id: string | null;
  capture_type: string;
  source: string;
  latitude: number;
  longitude: number;
  altitude_meters: number | null;
  accuracy_meters: number | null;
  heading_degrees: number | null;
  speed_meters_per_second: number | null;
  fix_type: string | null;
  rtk_status: string | null;
  satellite_count: number | null;
  hdop: number | null;
  vdop: number | null;
  raw_payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  captured_at: string;
  received_at: string;
  created_at: string;
};

export type AplomoDbStockpileRow = {
  id: string;
  company_id: string;
  site_id: string | null;
  material_type_id: string | null;
  name: string;
  status: string;
  estimated_volume_m3: number | null;
  estimated_weight_tons: number | null;
  geometry_geojson: Record<string, unknown> | null;
  centroid_latitude: number | null;
  centroid_longitude: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoDbMaterialTypeRow = {
  id: string;
  company_id: string;
  name: string;
  category: string | null;
  hazard_class: string | null;
  color: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoSupabaseMvpSnapshot = {
  loadedAt: string;
  userId: string | null;
  devices: AplomoDbDeviceRow[];
  latestPositions: AplomoDbLatestPositionRow[];
  gpsCaptures: AplomoDbGpsCaptureRow[];
  stockpiles: AplomoDbStockpileRow[];
  materialTypes: AplomoDbMaterialTypeRow[];
};

let cachedClient: SupabaseClient | null = null;

const readEnvValue = (key: string): string => {
  const env = import.meta.env as Record<string, string | boolean | undefined>;
  const value = env[key];

  return typeof value === "string" ? value.trim() : "";
};

export const getAplomoSupabaseMvpConfig = (): AplomoSupabaseMvpConfig => {
  const url = readEnvValue("VITE_SUPABASE_URL");
  const anonKey = readEnvValue("VITE_SUPABASE_ANON_KEY");

  return {
    isConfigured: url.length > 0 && anonKey.length > 0,
    url,
    anonKeyPreview:
      anonKey.length > 12 ? `${anonKey.slice(0, 8)}...${anonKey.slice(-4)}` : "",
  };
};

export const getAplomoSupabaseMvpClient = (): SupabaseClient => {
  const config = getAplomoSupabaseMvpConfig();
  const anonKey = readEnvValue("VITE_SUPABASE_ANON_KEY");

  if (!config.isConfigured) {
    throw new Error(
      "Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.",
    );
  }

  if (!cachedClient) {
    cachedClient = createClient(config.url, anonKey);
  }

  return cachedClient;
};

const throwIfError = (
  error: { message: string } | null,
  context: string,
): void => {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
};

export const loadAplomoSupabaseMvpSnapshot =
  async (): Promise<AplomoSupabaseMvpSnapshot> => {
    const supabase = getAplomoSupabaseMvpClient();

    const userResult = await supabase.auth.getUser();
    const userId = userResult.data.user?.id ?? null;

    const [
      devicesResult,
      latestPositionsResult,
      gpsCapturesResult,
      stockpilesResult,
      materialTypesResult,
    ] = await Promise.all([
      supabase
        .from("aplomo_devices")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("aplomo_latest_device_positions")
        .select("*")
        .order("updated_at", { ascending: false }),
      supabase
        .from("aplomo_gps_captures")
        .select("*")
        .order("captured_at", { ascending: false })
        .limit(100),
      supabase
        .from("aplomo_stockpiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("aplomo_material_types")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    throwIfError(devicesResult.error, "leer aplomo_devices");
    throwIfError(
      latestPositionsResult.error,
      "leer aplomo_latest_device_positions",
    );
    throwIfError(gpsCapturesResult.error, "leer aplomo_gps_captures");
    throwIfError(stockpilesResult.error, "leer aplomo_stockpiles");
    throwIfError(materialTypesResult.error, "leer aplomo_material_types");

    return {
      loadedAt: new Date().toISOString(),
      userId,
      devices: (devicesResult.data ?? []) as AplomoDbDeviceRow[],
      latestPositions: (latestPositionsResult.data ??
        []) as AplomoDbLatestPositionRow[],
      gpsCaptures: (gpsCapturesResult.data ?? []) as AplomoDbGpsCaptureRow[],
      stockpiles: (stockpilesResult.data ?? []) as AplomoDbStockpileRow[],
      materialTypes: (materialTypesResult.data ??
        []) as AplomoDbMaterialTypeRow[],
    };
  };
