import { getAplomoSupabaseMvpClient } from "./aplomoSupabaseMvpRepository.js";

export type AplomoPlatformCompanyRow = {
  id: string;
  name: string;
  legal_name: string | null;
  slug: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoPlatformProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  role: string;
  platform_role: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoPlatformMembershipRow = {
  id: string;
  company_id: string;
  profile_id: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AplomoPlatformSiteRow = {
  id: string;
  company_id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AplomoPlatformDeviceRow = {
  id: string;
  company_id: string;
  site_id: string | null;
  name: string;
  type: string;
  status: string;
  role: string;
  protocol: string | null;
  physical_link: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
};

export type AplomoPlatformStockpileRow = {
  id: string;
  company_id: string;
  site_id: string | null;
  name: string;
  status: string;
  estimated_volume_m3: number | null;
  estimated_weight_tons: number | null;
  created_at: string;
  updated_at: string;
};

export type AplomoPlatformLatestPositionRow = {
  id: string;
  company_id: string;
  device_id: string;
  source: string;
  status: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  updated_at: string;
};

export type AplomoPlatformCompanySummary = {
  company: AplomoPlatformCompanyRow;
  userCount: number;
  activeUserCount: number;
  adminCount: number;
  siteCount: number;
  deviceCount: number;
  onlineDeviceCount: number;
  stockpileCount: number;
  livePositionCount: number;
  highPrecisionPositionCount: number;
  estimatedVolumeM3: number;
  estimatedWeightTons: number;
  lastActivityAt: string | null;
};

export type AplomoPlatformAdminSnapshot = {
  loadedAt: string;
  userId: string | null;
  email: string | null;
  platformRole: string;
  companies: AplomoPlatformCompanyRow[];
  profiles: AplomoPlatformProfileRow[];
  memberships: AplomoPlatformMembershipRow[];
  sites: AplomoPlatformSiteRow[];
  devices: AplomoPlatformDeviceRow[];
  stockpiles: AplomoPlatformStockpileRow[];
  latestPositions: AplomoPlatformLatestPositionRow[];
  companySummaries: AplomoPlatformCompanySummary[];
};

const throwIfError = (
  error: { message: string } | null,
  context: string,
): void => {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
};

const countByCompany = <T extends { company_id: string }>(
  items: T[],
  companyId: string,
): number => {
  return items.filter((item) => item.company_id === companyId).length;
};

const sumByCompany = <T extends { company_id: string }>(
  items: T[],
  companyId: string,
  selector: (item: T) => number | null,
): number => {
  return items
    .filter((item) => item.company_id === companyId)
    .reduce((sum, item) => sum + (selector(item) ?? 0), 0);
};

const latestDate = (dates: Array<string | null | undefined>): string | null => {
  const validDates = dates
    .filter((date): date is string => typeof date === "string" && date.length > 0)
    .map((date) => new Date(date).getTime())
    .filter((time) => Number.isFinite(time));

  if (validDates.length === 0) {
    return null;
  }

  return new Date(Math.max(...validDates)).toISOString();
};

const createCompanySummary = (
  company: AplomoPlatformCompanyRow,
  input: {
    memberships: AplomoPlatformMembershipRow[];
    sites: AplomoPlatformSiteRow[];
    devices: AplomoPlatformDeviceRow[];
    stockpiles: AplomoPlatformStockpileRow[];
    latestPositions: AplomoPlatformLatestPositionRow[];
  },
): AplomoPlatformCompanySummary => {
  const companyMemberships = input.memberships.filter(
    (item) => item.company_id === company.id,
  );
  const companyDevices = input.devices.filter((item) => item.company_id === company.id);
  const companyPositions = input.latestPositions.filter(
    (item) => item.company_id === company.id,
  );
  const companyStockpiles = input.stockpiles.filter(
    (item) => item.company_id === company.id,
  );

  return {
    company,
    userCount: companyMemberships.length,
    activeUserCount: companyMemberships.filter((item) => item.status === "active").length,
    adminCount: companyMemberships.filter((item) =>
      ["tenant_owner", "tenant_admin"].includes(item.role),
    ).length,
    siteCount: countByCompany(input.sites, company.id),
    deviceCount: companyDevices.length,
    onlineDeviceCount: companyDevices.filter((item) => item.status === "active").length,
    stockpileCount: companyStockpiles.length,
    livePositionCount: companyPositions.length,
    highPrecisionPositionCount: companyPositions.filter(
      (item) =>
        typeof item.accuracy_meters === "number" && item.accuracy_meters <= 1,
    ).length,
    estimatedVolumeM3: sumByCompany(
      input.stockpiles,
      company.id,
      (item) => item.estimated_volume_m3,
    ),
    estimatedWeightTons: sumByCompany(
      input.stockpiles,
      company.id,
      (item) => item.estimated_weight_tons,
    ),
    lastActivityAt: latestDate([
      company.updated_at,
      ...companyDevices.map((item) => item.updated_at),
      ...companyPositions.map((item) => item.updated_at),
      ...companyStockpiles.map((item) => item.updated_at),
    ]),
  };
};

export const loadAplomoPlatformAdminSnapshot =
  async (): Promise<AplomoPlatformAdminSnapshot> => {
    const supabase = getAplomoSupabaseMvpClient();

    const userResult = await supabase.auth.getUser();
    throwIfError(userResult.error, "read current user");

    const user = userResult.data.user ?? null;

    if (!user) {
      return {
        loadedAt: new Date().toISOString(),
        userId: null,
        email: null,
        platformRole: "none",
        companies: [],
        profiles: [],
        memberships: [],
        sites: [],
        devices: [],
        stockpiles: [],
        latestPositions: [],
        companySummaries: [],
      };
    }

    const profileResult = await supabase
      .from("aplomo_profiles")
      .select("platform_role")
      .eq("id", user.id)
      .maybeSingle();

    throwIfError(profileResult.error, "read platform profile");

    const platformRole = String(
      (profileResult.data as { platform_role?: string } | null)?.platform_role ?? "none",
    );

    const [
      companiesResult,
      profilesResult,
      membershipsResult,
      sitesResult,
      devicesResult,
      stockpilesResult,
      latestPositionsResult,
    ] = await Promise.all([
      supabase
        .from("aplomo_companies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("aplomo_profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("aplomo_company_memberships")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase
        .from("aplomo_sites")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("aplomo_devices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase
        .from("aplomo_stockpiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase
        .from("aplomo_latest_device_positions")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(2000),
    ]);

    throwIfError(companiesResult.error, "read platform companies");
    throwIfError(profilesResult.error, "read platform profiles");
    throwIfError(membershipsResult.error, "read platform memberships");
    throwIfError(sitesResult.error, "read platform sites");
    throwIfError(devicesResult.error, "read platform devices");
    throwIfError(stockpilesResult.error, "read platform stockpiles");
    throwIfError(latestPositionsResult.error, "read platform latest positions");

    const companies = (companiesResult.data ?? []) as AplomoPlatformCompanyRow[];
    const profiles = (profilesResult.data ?? []) as AplomoPlatformProfileRow[];
    const memberships =
      (membershipsResult.data ?? []) as AplomoPlatformMembershipRow[];
    const sites = (sitesResult.data ?? []) as AplomoPlatformSiteRow[];
    const devices = (devicesResult.data ?? []) as AplomoPlatformDeviceRow[];
    const stockpiles =
      (stockpilesResult.data ?? []) as AplomoPlatformStockpileRow[];
    const latestPositions =
      (latestPositionsResult.data ?? []) as AplomoPlatformLatestPositionRow[];

    const companySummaries = companies.map((company) =>
      createCompanySummary(company, {
        memberships,
        sites,
        devices,
        stockpiles,
        latestPositions,
      }),
    );

    return {
      loadedAt: new Date().toISOString(),
      userId: user.id,
      email: user.email ?? null,
      platformRole,
      companies,
      profiles,
      memberships,
      sites,
      devices,
      stockpiles,
      latestPositions,
      companySummaries,
    };
  };
