import type { ThemeTokens } from "./types.js";

export interface TenantBrandingInput {
  readonly displayName: string;
  readonly primaryColor?: string;
  readonly logoUri?: string;
}

export interface TenantBranding {
  readonly displayName: string;
  readonly primaryColor: string;
  readonly logoUri?: string;
}

export function createTenantBranding(
  input: TenantBrandingInput,
  theme: ThemeTokens
): TenantBranding {
  const displayName = input.displayName.trim();

  if (displayName.length === 0) {
    throw new Error("Tenant branding display name must not be empty.");
  }

  return {
    displayName,
    primaryColor: input.primaryColor ?? theme.colors.primary,
    ...(input.logoUri !== undefined ? { logoUri: input.logoUri } : {})
  };
}