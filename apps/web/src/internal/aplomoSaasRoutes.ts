export const aplomoSaasRouteKinds = [
  "public_landing",
  "tenant_home",
  "tenant_admin",
  "tenant_operations",
  "tenant_capture",
  "tenant_data_hub",
  "aplomo_super_admin",
  "internal_dev_tools",
] as const;

export type AplomoSaasRouteKind = (typeof aplomoSaasRouteKinds)[number];

export type AplomoSaasRouteDefinition = {
  kind: AplomoSaasRouteKind;
  path: string;
  label: string;
  description: string;
  surface: string;
  requiresAuth: boolean;
  internalOnly: boolean;
};

export const aplomoSaasRoutes: AplomoSaasRouteDefinition[] = [
  {
    kind: "tenant_home",
    path: "/app",
    label: "Tenant Home",
    description: "Main authenticated customer portal.",
    surface: "tenant_home",
    requiresAuth: true,
    internalOnly: false,
  },
  {
    kind: "tenant_admin",
    path: "/app/admin",
    label: "Tenant Admin",
    description: "Customer admin tools for users, roles, devices, sites and catalogs.",
    surface: "tenant_admin",
    requiresAuth: true,
    internalOnly: false,
  },
  {
    kind: "tenant_operations",
    path: "/app/operations",
    label: "Operations",
    description: "Maps, live positions, alerts, scores and plant performance.",
    surface: "tenant_operations",
    requiresAuth: true,
    internalOnly: false,
  },
  {
    kind: "tenant_capture",
    path: "/app/capture",
    label: "Capture",
    description: "Field capture tools for GPS points and evidence.",
    surface: "tenant_capture",
    requiresAuth: true,
    internalOnly: false,
  },
  {
    kind: "tenant_data_hub",
    path: "/app/data",
    label: "Data Hub",
    description: "Exports, BI, data products, connectors and AI-ready datasets.",
    surface: "tenant_data_hub",
    requiresAuth: true,
    internalOnly: false,
  },
  {
    kind: "aplomo_super_admin",
    path: "/aplomo-admin",
    label: "Aplomo Super Admin",
    description: "Internal cross-tenant platform administration.",
    surface: "aplomo_super_admin",
    requiresAuth: true,
    internalOnly: true,
  },
  {
    kind: "internal_dev_tools",
    path: "/dev-tools",
    label: "Dev Tools",
    description: "Internal development and validation console.",
    surface: "internal_dev_tools",
    requiresAuth: true,
    internalOnly: true,
  },
];

export type AplomoResolvedSaasRoute = {
  shouldMountSaasShell: boolean;
  isLegacyQueryMode: boolean;
  pathname: string;
  route: AplomoSaasRouteDefinition | null;
};

export const resolveAplomoSaasRoute = (
  locationLike: Pick<Location, "pathname" | "search"> = window.location,
): AplomoResolvedSaasRoute => {
  const params = new URLSearchParams(locationLike.search);
  const isLegacyQueryMode = params.get("aplomoInternal") === "1";
  const pathname = locationLike.pathname.replace(/\/+$/, "") || "/";

  if (isLegacyQueryMode) {
    return {
      shouldMountSaasShell: true,
      isLegacyQueryMode,
      pathname,
      route:
        aplomoSaasRoutes.find((candidate) => candidate.kind === "internal_dev_tools") ??
        null,
    };
  }

  const route =
    aplomoSaasRoutes.find((candidate) => candidate.path === pathname) ?? null;

  return {
    shouldMountSaasShell: Boolean(route),
    isLegacyQueryMode,
    pathname,
    route,
  };
};

export const shouldMountAplomoSaasRoute = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return resolveAplomoSaasRoute(window.location).shouldMountSaasShell;
};

export const getCurrentAplomoSaasRoute = (): AplomoResolvedSaasRoute => {
  if (typeof window === "undefined") {
    return {
      shouldMountSaasShell: false,
      isLegacyQueryMode: false,
      pathname: "/",
      route: null,
    };
  }

  return resolveAplomoSaasRoute(window.location);
};
