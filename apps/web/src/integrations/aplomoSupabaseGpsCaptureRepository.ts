import type { User } from "@supabase/supabase-js";

import {
  getAplomoSupabaseMvpClient,
  type AplomoDbDeviceRow,
  type AplomoDbGpsCaptureRow,
  type AplomoDbLatestPositionRow,
  type AplomoDbStockpileRow,
} from "./aplomoSupabaseMvpRepository.js";

export type AplomoSupabaseMembershipRow = {
  company_id: string;
  profile_id: string;
  role: string;
  status: string;
};

export type AplomoSupabaseSiteRow = {
  id: string;
  company_id: string;
  name: string;
  kind: string;
  status: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoSupabaseWritableContext = {
  loadedAt: string;
  user: User | null;
  companyId: string | null;
  memberships: AplomoSupabaseMembershipRow[];
  sites: AplomoSupabaseSiteRow[];
  devices: AplomoDbDeviceRow[];
  stockpiles: AplomoDbStockpileRow[];
};

export type AplomoPasswordAuthInput = {
  email: string;
  password: string;
  displayName?: string;
};

export type AplomoCreateBrowserGpsCaptureInput = {
  companyId: string;
  siteId: string | null;
  deviceId: string | null;
  stockpileId: string | null;
  captureType: string;
  note: string;
};

export type AplomoCreateBrowserGpsCaptureResult = {
  capture: AplomoDbGpsCaptureRow;
  latestPosition: AplomoDbLatestPositionRow | null;
};

const throwIfError = (
  error: { message: string } | null,
  context: string,
): void => {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
};

const getCurrentBrowserPosition = async (): Promise<GeolocationPosition> => {
  if (!("geolocation" in navigator)) {
    throw new Error("Este navegador no soporta geolocalizaciÃ³n.");
  }

  return await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000,
    });
  });
};

export const signUpAplomoWithPassword = async (
  input: AplomoPasswordAuthInput,
): Promise<User | null> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        display_name: input.displayName ?? input.email,
      },
    },
  });

  throwIfError(result.error, "crear usuario");

  if (result.data.user) {
    await ensureAplomoProfile(result.data.user, input.displayName ?? input.email);
  }

  return result.data.user;
};

export const signInAplomoWithPassword = async (
  input: AplomoPasswordAuthInput,
): Promise<User | null> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  throwIfError(result.error, "iniciar sesiÃ³n");

  if (result.data.user) {
    await ensureAplomoProfile(result.data.user, input.displayName ?? input.email);
  }

  return result.data.user;
};

export const signOutAplomo = async (): Promise<void> => {
  const supabase = getAplomoSupabaseMvpClient();
  const result = await supabase.auth.signOut();

  throwIfError(result.error, "cerrar sesiÃ³n");
};

export const ensureAplomoProfile = async (
  user: User,
  displayName: string,
): Promise<void> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase.from("aplomo_profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      email: user.email ?? null,
      role: "user",
      metadata: {
        source: "web_auth",
      },
    },
    {
      onConflict: "id",
    },
  );

  throwIfError(result.error, "asegurar perfil");
};

export const loadAplomoSupabaseWritableContext =
  async (): Promise<AplomoSupabaseWritableContext> => {
    const supabase = getAplomoSupabaseMvpClient();

    const userResult = await supabase.auth.getUser();
    throwIfError(userResult.error, "leer usuario actual");

    const user = userResult.data.user;

    if (!user) {
      return {
        loadedAt: new Date().toISOString(),
        user: null,
        companyId: null,
        memberships: [],
        sites: [],
        devices: [],
        stockpiles: [],
      };
    }

    const membershipsResult = await supabase
      .from("aplomo_company_memberships")
      .select("company_id, profile_id, role, status")
      .eq("profile_id", user.id)
      .eq("status", "active");

    throwIfError(membershipsResult.error, "leer memberships");

    const memberships = (membershipsResult.data ?? []) as AplomoSupabaseMembershipRow[];
    const companyId = memberships[0]?.company_id ?? null;

    if (!companyId) {
      return {
        loadedAt: new Date().toISOString(),
        user,
        companyId: null,
        memberships,
        sites: [],
        devices: [],
        stockpiles: [],
      };
    }

    const [sitesResult, devicesResult, stockpilesResult] = await Promise.all([
      supabase
        .from("aplomo_sites")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false }),
      supabase
        .from("aplomo_devices")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false }),
      supabase
        .from("aplomo_stockpiles")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false }),
    ]);

    throwIfError(sitesResult.error, "leer sitios");
    throwIfError(devicesResult.error, "leer dispositivos");
    throwIfError(stockpilesResult.error, "leer stockpiles");

    return {
      loadedAt: new Date().toISOString(),
      user,
      companyId,
      memberships,
      sites: (sitesResult.data ?? []) as AplomoSupabaseSiteRow[],
      devices: (devicesResult.data ?? []) as AplomoDbDeviceRow[],
      stockpiles: (stockpilesResult.data ?? []) as AplomoDbStockpileRow[],
    };
  };

export const createAplomoBrowserGpsCapture = async (
  input: AplomoCreateBrowserGpsCaptureInput,
): Promise<AplomoCreateBrowserGpsCaptureResult> => {
  const supabase = getAplomoSupabaseMvpClient();

  const userResult = await supabase.auth.getUser();
  throwIfError(userResult.error, "leer usuario actual");

  const user = userResult.data.user;

  if (!user) {
    throw new Error("Necesitas iniciar sesiÃ³n antes de guardar una captura GPS.");
  }

  const browserPosition = await getCurrentBrowserPosition();
  const coords = browserPosition.coords;
  const capturedAt = new Date(browserPosition.timestamp).toISOString();
  const receivedAt = new Date().toISOString();

  const insertPayload = {
    company_id: input.companyId,
    site_id: input.siteId,
    device_id: input.deviceId,
    stockpile_id: input.stockpileId,
    captured_by_profile_id: user.id,
    capture_type: input.captureType,
    source: "browser_geolocation",
    latitude: coords.latitude,
    longitude: coords.longitude,
    altitude_meters: coords.altitude,
    accuracy_meters: coords.accuracy,
    heading_degrees: coords.heading,
    speed_meters_per_second: coords.speed,
    fix_type: "browser_gps",
    rtk_status: null,
    satellite_count: null,
    hdop: null,
    vdop: null,
    raw_payload: {
      browserTimestamp: browserPosition.timestamp,
      userAgent: navigator.userAgent,
    },
    metadata: {
      note: input.note,
      sourcePanel: "AplomoSupabaseGpsCapturePanel",
    },
    captured_at: capturedAt,
    received_at: receivedAt,
  };

  const captureResult = await supabase
    .from("aplomo_gps_captures")
    .insert(insertPayload)
    .select("*")
    .single();

  throwIfError(captureResult.error, "insertar captura GPS");

  const capture = captureResult.data as AplomoDbGpsCaptureRow;

  let latestPosition: AplomoDbLatestPositionRow | null = null;

  if (input.deviceId) {
    const latestPayload = {
      company_id: input.companyId,
      device_id: input.deviceId,
      gps_capture_id: capture.id,
      source: "browser_geolocation",
      status: "fresh",
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude_meters: coords.altitude,
      accuracy_meters: coords.accuracy,
      heading_degrees: coords.heading,
      speed_meters_per_second: coords.speed,
      fix_type: "browser_gps",
      rtk_status: null,
      satellite_count: null,
      hdop: null,
      vdop: null,
      updated_at: receivedAt,
    };

    const latestResult = await supabase
      .from("aplomo_latest_device_positions")
      .upsert(latestPayload, {
        onConflict: "company_id,device_id",
      })
      .select("*")
      .single();

    throwIfError(latestResult.error, "actualizar latest position");

    latestPosition = latestResult.data as AplomoDbLatestPositionRow;
  }

  await supabase.from("aplomo_audit_logs").insert({
    company_id: input.companyId,
    profile_id: user.id,
    action: "gps_capture.created",
    entity_type: "aplomo_gps_captures",
    entity_id: capture.id,
    payload: {
      deviceId: input.deviceId,
      stockpileId: input.stockpileId,
      source: "browser_geolocation",
    },
  });

  return {
    capture,
    latestPosition,
  };
};
