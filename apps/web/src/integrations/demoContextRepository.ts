import { getAplomoSupabaseClient } from "./supabaseClient.js";

export type AplomoCompanyRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export type AplomoSiteRow = {
  id: string;
  company_id: string;
  name: string;
  type: string;
  status: string;
};

export type AplomoYardRow = {
  id: string;
  company_id: string;
  site_id: string;
  name: string;
  status: string;
};

export type AplomoZoneRow = {
  id: string;
  company_id: string;
  site_id: string;
  yard_id: string;
  name: string;
  type: string;
  status: string;
};

export type AplomoProfileRow = {
  id: string;
  company_id: string | null;
  full_name: string;
  email: string | null;
  role: string;
  status: string;
};

export type AplomoDemoContext = {
  company: AplomoCompanyRow;
  site: AplomoSiteRow | null;
  yard: AplomoYardRow | null;
  zone: AplomoZoneRow | null;
  operatorProfile: AplomoProfileRow | null;
  supervisorProfile: AplomoProfileRow | null;
};

export type AplomoDemoContextResult =
  | {
      ok: true;
      mode: "supabase";
      data: AplomoDemoContext;
    }
  | {
      ok: false;
      mode: "local-demo" | "supabase";
      error: string;
    };

const normalizeSlug = (slug: string): string => slug.trim().toLowerCase();

export const findAplomoDemoContextByCompanySlug = async (
  slug: string,
): Promise<AplomoDemoContextResult> => {
  const state = getAplomoSupabaseClient();

  if (!state.isConfigured) {
    return {
      ok: false,
      mode: "local-demo",
      error: state.reason,
    };
  }

  const normalizedSlug = normalizeSlug(slug);

  if (!normalizedSlug) {
    return {
      ok: false,
      mode: "supabase",
      error: "Missing company slug.",
    };
  }

  const companyResult = await state.client
    .from("companies")
    .select("id,name,slug,status")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (companyResult.error) {
    return {
      ok: false,
      mode: "supabase",
      error: companyResult.error.message,
    };
  }

  if (!companyResult.data) {
    return {
      ok: false,
      mode: "supabase",
      error: `Company not found for slug: ${normalizedSlug}`,
    };
  }

  const company = companyResult.data as AplomoCompanyRow;

  const siteResult = await state.client
    .from("sites")
    .select("id,company_id,name,type,status")
    .eq("company_id", company.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (siteResult.error) {
    return {
      ok: false,
      mode: "supabase",
      error: siteResult.error.message,
    };
  }

  const site = siteResult.data ? (siteResult.data as AplomoSiteRow) : null;

  let yard: AplomoYardRow | null = null;

  if (site) {
    const yardResult = await state.client
      .from("yards")
      .select("id,company_id,site_id,name,status")
      .eq("company_id", company.id)
      .eq("site_id", site.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (yardResult.error) {
      return {
        ok: false,
        mode: "supabase",
        error: yardResult.error.message,
      };
    }

    yard = yardResult.data ? (yardResult.data as AplomoYardRow) : null;
  }

  let zone: AplomoZoneRow | null = null;

  if (site && yard) {
    const zoneResult = await state.client
      .from("zones")
      .select("id,company_id,site_id,yard_id,name,type,status")
      .eq("company_id", company.id)
      .eq("site_id", site.id)
      .eq("yard_id", yard.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (zoneResult.error) {
      return {
        ok: false,
        mode: "supabase",
        error: zoneResult.error.message,
      };
    }

    zone = zoneResult.data ? (zoneResult.data as AplomoZoneRow) : null;
  }

  const operatorResult = await state.client
    .from("profiles")
    .select("id,company_id,full_name,email,role,status")
    .eq("company_id", company.id)
    .eq("role", "operator")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (operatorResult.error) {
    return {
      ok: false,
      mode: "supabase",
      error: operatorResult.error.message,
    };
  }

  const supervisorResult = await state.client
    .from("profiles")
    .select("id,company_id,full_name,email,role,status")
    .eq("company_id", company.id)
    .eq("role", "supervisor")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (supervisorResult.error) {
    return {
      ok: false,
      mode: "supabase",
      error: supervisorResult.error.message,
    };
  }

  return {
    ok: true,
    mode: "supabase",
    data: {
      company,
      site,
      yard,
      zone,
      operatorProfile: operatorResult.data
        ? (operatorResult.data as AplomoProfileRow)
        : null,
      supervisorProfile: supervisorResult.data
        ? (supervisorResult.data as AplomoProfileRow)
        : null,
    },
  };
};
