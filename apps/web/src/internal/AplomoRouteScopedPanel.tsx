import { useEffect, useMemo, useState, type ReactNode } from "react";

import { getAplomoSupabaseMvpClient } from "../integrations/aplomoSupabaseMvpRepository.js";
import {
  getCurrentAplomoSaasRoute,
  type AplomoSaasRouteKind,
} from "./aplomoSaasRoutes.js";

export type AplomoRouteScopedPanelId =
  | "supabase_mvp"
  | "gps_capture"
  | "live_map"
  | "tenant_admin"
  | "tenant_invite"
  | "operations_map"
  | "cloud_sync_dev"
  | "data_platform"
  | "operational_intelligence"
  | "internal_experiment"
  | "platform_admin";

export type AplomoRouteScopedPanelProps = {
  panelId: AplomoRouteScopedPanelId;
  children?: ReactNode;
};

export type AplomoSaasAccessState = {
  status: "loading" | "ready" | "error";
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  platformRole: string;
  activeCompanyIds: string[];
  tenantRoles: string[];
  errorMessage: string | null;
  loadedAt: string;
};

export type AplomoSaasRouteAccessDecision = {
  allowed: boolean;
  reason: string;
  routeKind: AplomoSaasRouteKind | null;
  required: string;
};

type AplomoProfileAccessRow = {
  platform_role: string | null;
};

type AplomoMembershipAccessRow = {
  company_id: string;
  role: string;
  status: string;
};

const platformAdminRoles = ["aplomo_owner", "aplomo_admin"];
const platformReadRoles = [
  "aplomo_owner",
  "aplomo_admin",
  "aplomo_support",
  "aplomo_viewer",
];

const allTenantRoles = [
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
];

const tenantAdminRoles = ["tenant_owner", "tenant_admin"];
const captureRoles = [
  "tenant_owner",
  "tenant_admin",
  "operations_manager",
  "site_supervisor",
  "capture_operator",
  "machine_operator",
];
const operationsRoles = [
  "tenant_owner",
  "tenant_admin",
  "operations_manager",
  "site_supervisor",
  "machine_operator",
  "analyst",
  "viewer",
];
const dataRoles = [
  "tenant_owner",
  "tenant_admin",
  "analyst",
  "data_engineer",
  "data_scientist",
];

const routeVisibility: Record<AplomoRouteScopedPanelId, AplomoSaasRouteKind[]> = {
  supabase_mvp: [
    "tenant_home",
    "tenant_operations",
    "tenant_data_hub",
    "aplomo_super_admin",
    "internal_dev_tools",
  ],
  gps_capture: ["tenant_capture", "internal_dev_tools"],
  live_map: [
    "tenant_home",
    "tenant_operations",
    "aplomo_super_admin",
    "internal_dev_tools",
  ],
  tenant_admin: ["tenant_admin", "aplomo_super_admin", "internal_dev_tools"],
  tenant_invite: ["tenant_admin", "aplomo_super_admin", "internal_dev_tools"],
  operations_map: ["tenant_home", "tenant_operations", "internal_dev_tools"],
  cloud_sync_dev: ["aplomo_super_admin", "internal_dev_tools"],
  data_platform: ["tenant_data_hub", "aplomo_super_admin", "internal_dev_tools"],
  operational_intelligence: [
    "tenant_home",
    "tenant_operations",
    "aplomo_super_admin",
    "internal_dev_tools",
  ],
  internal_experiment: ["internal_dev_tools"],
  platform_admin: ["aplomo_super_admin", "internal_dev_tools"],
};

const panelTenantRoles: Record<AplomoRouteScopedPanelId, string[]> = {
  supabase_mvp: allTenantRoles,
  gps_capture: captureRoles,
  live_map: operationsRoles,
  tenant_admin: tenantAdminRoles,
  tenant_invite: tenantAdminRoles,
  operations_map: operationsRoles,
  cloud_sync_dev: [],
  data_platform: dataRoles,
  operational_intelligence: operationsRoles,
  internal_experiment: [],
  platform_admin: [],
};

let accessStatePromise: Promise<AplomoSaasAccessState> | null = null;

const uniqueStrings = (items: string[]): string[] => {
  return Array.from(new Set(items.filter((item) => item.trim().length > 0)));
};

const hasAny = (actual: string[], allowed: string[]): boolean => {
  return actual.some((item) => allowed.includes(item));
};

const isPlatformAdmin = (platformRole: string): boolean => {
  return platformAdminRoles.includes(platformRole);
};

const isPlatformReader = (platformRole: string): boolean => {
  return platformReadRoles.includes(platformRole);
};

export const resetAplomoSaasAccessStateCache = (): void => {
  accessStatePromise = null;
};

export const loadAplomoSaasAccessState =
  async (): Promise<AplomoSaasAccessState> => {
    if (accessStatePromise) {
      return accessStatePromise;
    }

    accessStatePromise = (async () => {
      try {
        const supabase = getAplomoSupabaseMvpClient();
        const sessionResult = await supabase.auth.getSession();

        if (sessionResult.error) {
          throw new Error(`read session: ${sessionResult.error.message}`);
        }

        const user = sessionResult.data.session?.user ?? null;

        if (!user) {
          return {
            status: "ready",
            isAuthenticated: false,
            userId: null,
            email: null,
            platformRole: "none",
            activeCompanyIds: [],
            tenantRoles: [],
            errorMessage: null,
            loadedAt: new Date().toISOString(),
          };
        }

        const [profileResult, membershipsResult] = await Promise.all([
          supabase
            .from("aplomo_profiles")
            .select("platform_role")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("aplomo_company_memberships")
            .select("company_id,role,status")
            .eq("profile_id", user.id)
            .eq("status", "active"),
        ]);

        if (profileResult.error) {
          throw new Error(`read profile access: ${profileResult.error.message}`);
        }

        if (membershipsResult.error) {
          throw new Error(`read membership access: ${membershipsResult.error.message}`);
        }

        const profile = profileResult.data as AplomoProfileAccessRow | null;
        const memberships =
          (membershipsResult.data ?? []) as AplomoMembershipAccessRow[];

        return {
          status: "ready",
          isAuthenticated: true,
          userId: user.id,
          email: user.email ?? null,
          platformRole: profile?.platform_role ?? "none",
          activeCompanyIds: uniqueStrings(
            memberships.map((membership) => membership.company_id),
          ),
          tenantRoles: uniqueStrings(memberships.map((membership) => membership.role)),
          errorMessage: null,
          loadedAt: new Date().toISOString(),
        };
      } catch (error) {
        return {
          status: "error",
          isAuthenticated: false,
          userId: null,
          email: null,
          platformRole: "none",
          activeCompanyIds: [],
          tenantRoles: [],
          errorMessage: error instanceof Error ? error.message : "Unknown access error",
          loadedAt: new Date().toISOString(),
        };
      }
    })();

    return accessStatePromise;
  };

export const useAplomoSaasAccessState = (): AplomoSaasAccessState => {
  const [state, setState] = useState<AplomoSaasAccessState>({
    status: "loading",
    isAuthenticated: false,
    userId: null,
    email: null,
    platformRole: "none",
    activeCompanyIds: [],
    tenantRoles: [],
    errorMessage: null,
    loadedAt: new Date().toISOString(),
  });

  useEffect(() => {
    let isMounted = true;

    loadAplomoSaasAccessState()
      .then((result) => {
        if (isMounted) {
          setState(result);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({
            status: "error",
            isAuthenticated: false,
            userId: null,
            email: null,
            platformRole: "none",
            activeCompanyIds: [],
            tenantRoles: [],
            errorMessage:
              error instanceof Error ? error.message : "Unknown access error",
            loadedAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
};

export const evaluateAplomoCurrentRouteAccess = (
  access: AplomoSaasAccessState,
): AplomoSaasRouteAccessDecision => {
  const resolved = getCurrentAplomoSaasRoute();
  const routeKind = resolved.route?.kind ?? null;

  if (!resolved.shouldMountSaasShell || !routeKind) {
    return {
      allowed: true,
      reason: "Public route.",
      routeKind,
      required: "none",
    };
  }

  if (access.status === "loading") {
    return {
      allowed: false,
      reason: "Checking session and access.",
      routeKind,
      required: "loading",
    };
  }

  if (access.status === "error") {
    return {
      allowed: false,
      reason: access.errorMessage ?? "Access state error.",
      routeKind,
      required: "valid access state",
    };
  }

  if (!access.isAuthenticated) {
    return {
      allowed: false,
      reason: "Sign in is required.",
      routeKind,
      required: "authenticated user",
    };
  }

  if (routeKind === "aplomo_super_admin" || routeKind === "internal_dev_tools") {
    const allowed = isPlatformReader(access.platformRole);

    return {
      allowed,
      reason: allowed
        ? "Allowed by Aplomo platform role."
        : "Aplomo platform role is required.",
      routeKind,
      required: platformReadRoles.join(", "),
    };
  }

  if (isPlatformAdmin(access.platformRole)) {
    return {
      allowed: true,
      reason: "Allowed by Aplomo admin platform role.",
      routeKind,
      required: "aplomo_owner or aplomo_admin",
    };
  }

  if (access.activeCompanyIds.length === 0) {
    return {
      allowed: false,
      reason: "No active tenant membership.",
      routeKind,
      required: "active company membership",
    };
  }

  const requiredRolesByRoute: Partial<Record<AplomoSaasRouteKind, string[]>> = {
    tenant_home: allTenantRoles,
    tenant_admin: tenantAdminRoles,
    tenant_operations: operationsRoles,
    tenant_capture: captureRoles,
    tenant_data_hub: dataRoles,
  };

  const requiredRoles = requiredRolesByRoute[routeKind] ?? [];
  const allowed = hasAny(access.tenantRoles, requiredRoles);

  return {
    allowed,
    reason: allowed
      ? "Allowed by active tenant role."
      : "Tenant role does not allow this route.",
    routeKind,
    required: requiredRoles.join(", "),
  };
};

export const canShowAplomoPanelOnCurrentRoute = (
  panelId: AplomoRouteScopedPanelId,
  access: AplomoSaasAccessState,
): boolean => {
  const resolved = getCurrentAplomoSaasRoute();
  const routeKind = resolved.route?.kind ?? "internal_dev_tools";

  if (!routeVisibility[panelId].includes(routeKind)) {
    return false;
  }

  const routeDecision = evaluateAplomoCurrentRouteAccess(access);

  if (!routeDecision.allowed) {
    return false;
  }

  if (routeKind === "internal_dev_tools" || routeKind === "aplomo_super_admin") {
    return isPlatformReader(access.platformRole);
  }

  if (isPlatformAdmin(access.platformRole)) {
    return true;
  }

  return hasAny(access.tenantRoles, panelTenantRoles[panelId]);
};

export function AplomoRouteScopedPanel({
  panelId,
  children,
}: AplomoRouteScopedPanelProps) {
  const access = useAplomoSaasAccessState();

  const isVisible = useMemo(
    () => canShowAplomoPanelOnCurrentRoute(panelId, access),
    [panelId, access],
  );

  if (!isVisible) {
    return null;
  }

  return <>{children}</>;
}
