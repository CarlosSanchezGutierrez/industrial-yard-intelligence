import { getAplomoSupabaseMvpClient } from "./aplomoSupabaseMvpRepository.js";

export const aplomoTenantAdminRoles = [
  "tenant_owner",
  "tenant_admin",
  "operations_manager",
  "site_supervisor",
  "capture_operator",
  "machine_operator",
  "analyst",
  "data_engineer",
  "data_scientist",
  "viewer",
] as const;

export type AplomoTenantAdminRole = (typeof aplomoTenantAdminRoles)[number];

export const aplomoTenantAdminMembershipStatuses = [
  "active",
  "inactive",
  "invited",
  "suspended",
] as const;

export type AplomoTenantAdminMembershipStatus =
  (typeof aplomoTenantAdminMembershipStatuses)[number];

export type AplomoTenantCompanyRow = {
  id: string;
  name: string;
  legal_name: string | null;
  slug: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoTenantMembershipRow = {
  id: string;
  company_id: string;
  profile_id: string;
  role: AplomoTenantAdminRole;
  status: AplomoTenantAdminMembershipStatus;
  permissions_override: string[];
  scope: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoTenantSiteRow = {
  id: string;
  company_id: string;
  name: string;
  kind: string;
  status: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  boundaries_geojson: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoTenantDeviceRow = {
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

export type AplomoTenantMaterialTypeRow = {
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

export type AplomoTenantStockpileRow = {
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

export type AplomoTenantAdminContext = {
  loadedAt: string;
  userId: string | null;
  companyId: string | null;
  company: AplomoTenantCompanyRow | null;
  ownMemberships: AplomoTenantMembershipRow[];
  memberships: AplomoTenantMembershipRow[];
  sites: AplomoTenantSiteRow[];
  devices: AplomoTenantDeviceRow[];
  materialTypes: AplomoTenantMaterialTypeRow[];
  stockpiles: AplomoTenantStockpileRow[];
};

export type AplomoCreateTenantSiteInput = {
  companyId: string;
  name: string;
  kind: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
};

export type AplomoCreateTenantDeviceInput = {
  companyId: string;
  siteId: string | null;
  name: string;
  type: string;
  role: string;
  protocol: string | null;
  physicalLink: string | null;
  ipAddress: string | null;
  externalIdentifier: string | null;
};

export type AplomoCreateTenantMaterialTypeInput = {
  companyId: string;
  name: string;
  category: string | null;
  hazardClass: string | null;
  color: string | null;
};

export type AplomoCreateTenantStockpileInput = {
  companyId: string;
  siteId: string | null;
  materialTypeId: string | null;
  name: string;
  estimatedVolumeM3: number | null;
  estimatedWeightTons: number | null;
  centroidLatitude: number | null;
  centroidLongitude: number | null;
};

const throwIfError = (
  error: { message: string } | null,
  context: string,
): void => {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
};

const firstActiveCompanyId = (
  memberships: AplomoTenantMembershipRow[],
): string | null => {
  return memberships.find((membership) => membership.status === "active")?.company_id ?? null;
};

export const loadAplomoTenantAdminContext =
  async (): Promise<AplomoTenantAdminContext> => {
    const supabase = getAplomoSupabaseMvpClient();

    const userResult = await supabase.auth.getUser();
    throwIfError(userResult.error, "read current user");

    const user = userResult.data.user;

    if (!user) {
      return {
        loadedAt: new Date().toISOString(),
        userId: null,
        companyId: null,
        company: null,
        ownMemberships: [],
        memberships: [],
        sites: [],
        devices: [],
        materialTypes: [],
        stockpiles: [],
      };
    }

    const ownMembershipsResult = await supabase
      .from("aplomo_company_memberships")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    throwIfError(ownMembershipsResult.error, "read own memberships");

    const ownMemberships =
      (ownMembershipsResult.data ?? []) as AplomoTenantMembershipRow[];
    const companyId = firstActiveCompanyId(ownMemberships);

    if (!companyId) {
      return {
        loadedAt: new Date().toISOString(),
        userId: user.id,
        companyId: null,
        company: null,
        ownMemberships,
        memberships: [],
        sites: [],
        devices: [],
        materialTypes: [],
        stockpiles: [],
      };
    }

    const [
      companyResult,
      membershipsResult,
      sitesResult,
      devicesResult,
      materialTypesResult,
      stockpilesResult,
    ] = await Promise.all([
      supabase
        .from("aplomo_companies")
        .select("*")
        .eq("id", companyId)
        .maybeSingle(),
      supabase
        .from("aplomo_company_memberships")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false }),
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
        .from("aplomo_material_types")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false }),
      supabase
        .from("aplomo_stockpiles")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false }),
    ]);

    throwIfError(companyResult.error, "read company");
    throwIfError(membershipsResult.error, "read company memberships");
    throwIfError(sitesResult.error, "read sites");
    throwIfError(devicesResult.error, "read devices");
    throwIfError(materialTypesResult.error, "read material types");
    throwIfError(stockpilesResult.error, "read stockpiles");

    return {
      loadedAt: new Date().toISOString(),
      userId: user.id,
      companyId,
      company: (companyResult.data as AplomoTenantCompanyRow | null) ?? null,
      ownMemberships,
      memberships: (membershipsResult.data ?? []) as AplomoTenantMembershipRow[],
      sites: (sitesResult.data ?? []) as AplomoTenantSiteRow[],
      devices: (devicesResult.data ?? []) as AplomoTenantDeviceRow[],
      materialTypes: (materialTypesResult.data ?? []) as AplomoTenantMaterialTypeRow[],
      stockpiles: (stockpilesResult.data ?? []) as AplomoTenantStockpileRow[],
    };
  };

export const updateAplomoTenantMembership = async (input: {
  companyId: string;
  membershipId: string;
  role: AplomoTenantAdminRole;
  status: AplomoTenantAdminMembershipStatus;
}): Promise<AplomoTenantMembershipRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase
    .from("aplomo_company_memberships")
    .update({
      role: input.role,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.membershipId)
    .eq("company_id", input.companyId)
    .select("*")
    .single();

  throwIfError(result.error, "update membership");

  return result.data as AplomoTenantMembershipRow;
};

export const createAplomoTenantSite = async (
  input: AplomoCreateTenantSiteInput,
): Promise<AplomoTenantSiteRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase
    .from("aplomo_sites")
    .insert({
      company_id: input.companyId,
      name: input.name,
      kind: input.kind,
      status: "active",
      timezone: input.timezone,
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address,
      metadata: {
        source: "tenant_admin_panel",
      },
    })
    .select("*")
    .single();

  throwIfError(result.error, "create site");

  return result.data as AplomoTenantSiteRow;
};

export const createAplomoTenantDevice = async (
  input: AplomoCreateTenantDeviceInput,
): Promise<AplomoTenantDeviceRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase
    .from("aplomo_devices")
    .insert({
      company_id: input.companyId,
      site_id: input.siteId,
      name: input.name,
      type: input.type,
      status: "active",
      role: input.role,
      capabilities: ["gps"],
      protocol: input.protocol,
      physical_link: input.physicalLink,
      ip_address: input.ipAddress,
      external_identifier: input.externalIdentifier,
      metadata: {
        source: "tenant_admin_panel",
      },
    })
    .select("*")
    .single();

  throwIfError(result.error, "create device");

  return result.data as AplomoTenantDeviceRow;
};

export const createAplomoTenantMaterialType = async (
  input: AplomoCreateTenantMaterialTypeInput,
): Promise<AplomoTenantMaterialTypeRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase
    .from("aplomo_material_types")
    .insert({
      company_id: input.companyId,
      name: input.name,
      category: input.category,
      hazard_class: input.hazardClass,
      color: input.color,
      metadata: {
        source: "tenant_admin_panel",
      },
    })
    .select("*")
    .single();

  throwIfError(result.error, "create material type");

  return result.data as AplomoTenantMaterialTypeRow;
};

export const createAplomoTenantStockpile = async (
  input: AplomoCreateTenantStockpileInput,
): Promise<AplomoTenantStockpileRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase
    .from("aplomo_stockpiles")
    .insert({
      company_id: input.companyId,
      site_id: input.siteId,
      material_type_id: input.materialTypeId,
      name: input.name,
      status: "active",
      estimated_volume_m3: input.estimatedVolumeM3,
      estimated_weight_tons: input.estimatedWeightTons,
      centroid_latitude: input.centroidLatitude,
      centroid_longitude: input.centroidLongitude,
      metadata: {
        source: "tenant_admin_panel",
      },
    })
    .select("*")
    .single();

  throwIfError(result.error, "create stockpile");

  return result.data as AplomoTenantStockpileRow;
};
