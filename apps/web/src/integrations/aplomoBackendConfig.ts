export type AplomoBackendMode = "local-demo" | "supabase-ready";

export type AplomoSupabaseConfig = {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  mode: AplomoBackendMode;
  reason: string;
};

const readPublicEnv = (key: string): string => {
  const env = import.meta.env as unknown as Record<string, string | undefined>;
  const value = env[key];

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const looksLikePlaceholder = (value: string): boolean => {
  const normalized = value.toLowerCase();

  return (
    normalized.length === 0 ||
    normalized.includes("your-") ||
    normalized.includes("example") ||
    normalized.includes("placeholder")
  );
};

export const getAplomoSupabaseConfig = (): AplomoSupabaseConfig => {
  const url = readPublicEnv("VITE_SUPABASE_URL");
  const anonKey = readPublicEnv("VITE_SUPABASE_ANON_KEY");

  const isConfigured =
    !looksLikePlaceholder(url) &&
    !looksLikePlaceholder(anonKey) &&
    url.startsWith("https://");

  return {
    url,
    anonKey,
    isConfigured,
    mode: isConfigured ? "supabase-ready" : "local-demo",
    reason: isConfigured
      ? "Supabase public config is present."
      : "Supabase env vars are missing. Keep using local demo flows.",
  };
};

export const aplomoBackendConfig = getAplomoSupabaseConfig();
