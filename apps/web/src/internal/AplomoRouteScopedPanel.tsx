import { useMemo, type ReactNode } from "react";

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
  | "internal_experiment";

export type AplomoRouteScopedPanelProps = {
  panelId: AplomoRouteScopedPanelId;
  children: ReactNode;
};

const allInternalRoutes: AplomoSaasRouteKind[] = [
  "internal_dev_tools",
  "aplomo_super_admin",
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
  cloud_sync_dev: allInternalRoutes,
  data_platform: ["tenant_data_hub", "aplomo_super_admin", "internal_dev_tools"],
  operational_intelligence: [
    "tenant_home",
    "tenant_operations",
    "tenant_analytics",
    "aplomo_super_admin",
    "internal_dev_tools",
  ] as AplomoSaasRouteKind[],
  internal_experiment: ["internal_dev_tools"],
};

export const canShowAplomoPanelOnCurrentRoute = (
  panelId: AplomoRouteScopedPanelId,
): boolean => {
  const resolved = getCurrentAplomoSaasRoute();
  const routeKind = resolved.route?.kind ?? "internal_dev_tools";

  return routeVisibility[panelId].includes(routeKind);
};

export function AplomoRouteScopedPanel({
  panelId,
  children,
}: AplomoRouteScopedPanelProps) {
  const isVisible = useMemo(() => canShowAplomoPanelOnCurrentRoute(panelId), [panelId]);

  if (!isVisible) {
    return null;
  }

  return <>{children}</>;
}
