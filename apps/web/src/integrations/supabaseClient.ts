import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { aplomoBackendConfig } from "./aplomoBackendConfig.js";

export type AplomoSupabaseClientState =
  | {
      isConfigured: true;
      client: SupabaseClient;
      reason: string;
    }
  | {
      isConfigured: false;
      client: null;
      reason: string;
    };

let cachedClient: SupabaseClient | null = null;

export const getAplomoSupabaseClient = (): AplomoSupabaseClientState => {
  if (!aplomoBackendConfig.isConfigured) {
    return {
      isConfigured: false,
      client: null,
      reason: aplomoBackendConfig.reason,
    };
  }

  if (!cachedClient) {
    cachedClient = createClient(
      aplomoBackendConfig.url,
      aplomoBackendConfig.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    );
  }

  return {
    isConfigured: true,
    client: cachedClient,
    reason: aplomoBackendConfig.reason,
  };
};
