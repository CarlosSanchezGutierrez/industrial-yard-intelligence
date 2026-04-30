import { getAplomoSupabaseClient } from "./supabaseClient.js";

export type AplomoCompanyRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AplomoCompanyLookupResult =
  | {
      ok: true;
      mode: "supabase";
      data: AplomoCompanyRow;
    }
  | {
      ok: false;
      mode: "local-demo" | "supabase";
      error: string;
    };

const cleanSlug = (slug: string): string => {
  return slug.trim().toLowerCase();
};

export const findAplomoCompanyBySlug = async (
  slug: string,
): Promise<AplomoCompanyLookupResult> => {
  const state = getAplomoSupabaseClient();

  if (!state.isConfigured) {
    return {
      ok: false,
      mode: "local-demo",
      error: state.reason,
    };
  }

  const normalizedSlug = cleanSlug(slug);

  if (!normalizedSlug) {
    return {
      ok: false,
      mode: "supabase",
      error: "Missing company slug.",
    };
  }

  const { data, error } = await state.client
    .from("companies")
    .select("id,name,slug,status,created_at,updated_at")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      mode: "supabase",
      error: error.message,
    };
  }

  if (!data) {
    return {
      ok: false,
      mode: "supabase",
      error: `Company not found for slug: ${normalizedSlug}`,
    };
  }

  return {
    ok: true,
    mode: "supabase",
    data: data as AplomoCompanyRow,
  };
};
