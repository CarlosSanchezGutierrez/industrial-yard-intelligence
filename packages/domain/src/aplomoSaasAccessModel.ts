export const aplomoPlatformRoles = [
  "none",
  "aplomo_owner",
  "aplomo_admin",
  "aplomo_support",
  "aplomo_viewer",
] as const;

export type AplomoPlatformRole = (typeof aplomoPlatformRoles)[number];

export const aplomoTenantRoles = [
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

export type AplomoTenantRole = (typeof aplomoTenantRoles)[number];

export const aplomoSaasSurfaces = [
  "aplomo_super_admin",
  "tenant_admin",
  "tenant_operations",
  "tenant_capture",
  "tenant_data_hub",
  "tenant_analytics",
  "internal_dev_tools",
] as const;

export type AplomoSaasSurface = (typeof aplomoSaasSurfaces)[number];

export const aplomoSaasPermissions = [
  "platform:cross_tenant_read",
  "platform:cross_tenant_support",
  "platform:manage_companies",
  "platform:manage_billing",
  "platform:view_global_health",
  "platform:use_dev_tools",

  "company:read",
  "company:update",
  "company:manage_settings",
  "company:manage_users",
  "company:manage_roles",

  "sites:read",
  "sites:write",
  "sites:delete",

  "devices:read",
  "devices:write",
  "devices:delete",
  "devices:assign",

  "connections:read",
  "connections:diagnose",

  "stockpiles:read",
  "stockpiles:write",
  "stockpiles:delete",

  "materials:read",
  "materials:write",
  "materials:delete",

  "gps_captures:read",
  "gps_captures:create",
  "gps_captures:update",
  "gps_captures:delete",

  "operations:read",
  "operations:manage",
  "operations:view_scores",
  "operations:view_alerts",
  "operations:resolve_alerts",

  "analytics:view",
  "analytics:export",
  "analytics:view_employee_performance",
  "analytics:view_site_performance",

  "data_products:read",
  "data_products:manage",
  "exports:create",
  "exports:download",
  "connectors:read",
  "connectors:manage",

  "llm_tools:read",
  "llm_tools:invoke",
  "llm_tools:manage",

  "audit_logs:read",
] as const;

export type AplomoSaasPermission = (typeof aplomoSaasPermissions)[number];

export type AplomoRolePolicy = {
  role: AplomoPlatformRole | AplomoTenantRole;
  label: string;
  description: string;
  surfaces: readonly AplomoSaasSurface[];
  permissions: readonly AplomoSaasPermission[];
};

export type AplomoTenantMembershipAccess = {
  companyId: string;
  role: AplomoTenantRole;
  status: "active" | "inactive" | "invited" | "suspended";
  permissionsOverride?: readonly AplomoSaasPermission[];
  scope?: {
    siteIds?: readonly string[];
    deviceIds?: readonly string[];
    stockpileIds?: readonly string[];
  };
};

export type AplomoAccessSubject = {
  userId: string;
  platformRole: AplomoPlatformRole;
  tenantMemberships: readonly AplomoTenantMembershipAccess[];
};

export type AplomoAccessCheckInput = {
  subject: AplomoAccessSubject;
  companyId?: string;
  surface: AplomoSaasSurface;
  permission: AplomoSaasPermission;
};

export type AplomoAccessDecision = {
  allowed: boolean;
  reason: string;
  evaluatedAt: string;
  platformRole: AplomoPlatformRole;
  tenantRole?: AplomoTenantRole;
  companyId?: string;
  surface: AplomoSaasSurface;
  permission: AplomoSaasPermission;
  effectivePermissions: AplomoSaasPermission[];
};

const uniquePermissions = (
  permissions: readonly AplomoSaasPermission[],
): AplomoSaasPermission[] => {
  return Array.from(new Set(permissions));
};

const allPermissions = (): AplomoSaasPermission[] => {
  return [...aplomoSaasPermissions];
};

const platformReadPermissions: AplomoSaasPermission[] = [
  "platform:cross_tenant_read",
  "platform:view_global_health",
  "company:read",
  "sites:read",
  "devices:read",
  "connections:read",
  "stockpiles:read",
  "materials:read",
  "gps_captures:read",
  "operations:read",
  "operations:view_scores",
  "operations:view_alerts",
  "analytics:view",
  "data_products:read",
  "exports:download",
  "connectors:read",
  "llm_tools:read",
  "audit_logs:read",
];

export const createAplomoPlatformRolePolicies = (): AplomoRolePolicy[] => [
  {
    role: "none",
    label: "No platform access",
    description: "Regular tenant user with no Aplomo internal access.",
    surfaces: [],
    permissions: [],
  },
  {
    role: "aplomo_owner",
    label: "Aplomo Owner",
    description: "Internal owner with full platform access across tenants.",
    surfaces: ["aplomo_super_admin", "internal_dev_tools"],
    permissions: allPermissions(),
  },
  {
    role: "aplomo_admin",
    label: "Aplomo Admin",
    description: "Internal admin for customer support, onboarding and operations.",
    surfaces: ["aplomo_super_admin", "internal_dev_tools"],
    permissions: uniquePermissions([
      ...platformReadPermissions,
      "platform:cross_tenant_support",
      "platform:manage_companies",
      "company:update",
      "company:manage_settings",
      "company:manage_users",
      "devices:write",
      "operations:manage",
      "exports:create",
      "connectors:manage",
    ]),
  },
  {
    role: "aplomo_support",
    label: "Aplomo Support",
    description: "Internal support role with read and diagnostic access.",
    surfaces: ["aplomo_super_admin"],
    permissions: uniquePermissions([
      ...platformReadPermissions,
      "platform:cross_tenant_support",
      "connections:diagnose",
    ]),
  },
  {
    role: "aplomo_viewer",
    label: "Aplomo Viewer",
    description: "Internal read-only role for business visibility.",
    surfaces: ["aplomo_super_admin"],
    permissions: platformReadPermissions,
  },
];

export const createAplomoTenantRolePolicies = (): AplomoRolePolicy[] => [
  {
    role: "tenant_owner",
    label: "Tenant Owner",
    description: "Customer account owner with full access inside one company.",
    surfaces: [
      "tenant_admin",
      "tenant_operations",
      "tenant_capture",
      "tenant_data_hub",
      "tenant_analytics",
    ],
    permissions: [
      "company:read",
      "company:update",
      "company:manage_settings",
      "company:manage_users",
      "company:manage_roles",
      "sites:read",
      "sites:write",
      "sites:delete",
      "devices:read",
      "devices:write",
      "devices:delete",
      "devices:assign",
      "connections:read",
      "connections:diagnose",
      "stockpiles:read",
      "stockpiles:write",
      "stockpiles:delete",
      "materials:read",
      "materials:write",
      "materials:delete",
      "gps_captures:read",
      "gps_captures:create",
      "gps_captures:update",
      "gps_captures:delete",
      "operations:read",
      "operations:manage",
      "operations:view_scores",
      "operations:view_alerts",
      "operations:resolve_alerts",
      "analytics:view",
      "analytics:export",
      "analytics:view_employee_performance",
      "analytics:view_site_performance",
      "data_products:read",
      "data_products:manage",
      "exports:create",
      "exports:download",
      "connectors:read",
      "connectors:manage",
      "llm_tools:read",
      "llm_tools:invoke",
      "llm_tools:manage",
      "audit_logs:read",
    ],
  },
  {
    role: "tenant_admin",
    label: "Tenant Admin",
    description: "Customer admin that can manage users, devices, sites and operations.",
    surfaces: ["tenant_admin", "tenant_operations", "tenant_data_hub", "tenant_analytics"],
    permissions: [
      "company:read",
      "company:update",
      "company:manage_settings",
      "company:manage_users",
      "sites:read",
      "sites:write",
      "devices:read",
      "devices:write",
      "devices:assign",
      "connections:read",
      "connections:diagnose",
      "stockpiles:read",
      "stockpiles:write",
      "materials:read",
      "materials:write",
      "gps_captures:read",
      "operations:read",
      "operations:manage",
      "operations:view_scores",
      "operations:view_alerts",
      "operations:resolve_alerts",
      "analytics:view",
      "analytics:export",
      "analytics:view_employee_performance",
      "analytics:view_site_performance",
      "data_products:read",
      "exports:create",
      "exports:download",
      "connectors:read",
      "llm_tools:read",
      "audit_logs:read",
    ],
  },
  {
    role: "operations_manager",
    label: "Operations Manager",
    description: "Customer operations manager focused on plants, patios and performance.",
    surfaces: ["tenant_operations", "tenant_analytics"],
    permissions: [
      "company:read",
      "sites:read",
      "devices:read",
      "connections:read",
      "connections:diagnose",
      "stockpiles:read",
      "stockpiles:write",
      "materials:read",
      "gps_captures:read",
      "operations:read",
      "operations:manage",
      "operations:view_scores",
      "operations:view_alerts",
      "operations:resolve_alerts",
      "analytics:view",
      "analytics:export",
      "analytics:view_employee_performance",
      "analytics:view_site_performance",
    ],
  },
  {
    role: "site_supervisor",
    label: "Site Supervisor",
    description: "Supervisor for a site or yard section.",
    surfaces: ["tenant_operations", "tenant_capture", "tenant_analytics"],
    permissions: [
      "company:read",
      "sites:read",
      "devices:read",
      "connections:read",
      "stockpiles:read",
      "materials:read",
      "gps_captures:read",
      "gps_captures:create",
      "gps_captures:update",
      "operations:read",
      "operations:view_scores",
      "operations:view_alerts",
      "analytics:view",
      "analytics:view_employee_performance",
      "analytics:view_site_performance",
    ],
  },
  {
    role: "capture_operator",
    label: "Capture Operator",
    description: "Field user that captures GPS points and evidence.",
    surfaces: ["tenant_capture"],
    permissions: [
      "company:read",
      "sites:read",
      "devices:read",
      "stockpiles:read",
      "materials:read",
      "gps_captures:create",
    ],
  },
  {
    role: "machine_operator",
    label: "Machine Operator",
    description: "Machine or yard operator with limited operational visibility.",
    surfaces: ["tenant_capture", "tenant_operations"],
    permissions: [
      "company:read",
      "sites:read",
      "devices:read",
      "stockpiles:read",
      "materials:read",
      "gps_captures:create",
      "operations:read",
    ],
  },
  {
    role: "analyst",
    label: "Analyst",
    description: "Business analyst with dashboard and export access.",
    surfaces: ["tenant_analytics", "tenant_data_hub"],
    permissions: [
      "company:read",
      "sites:read",
      "devices:read",
      "stockpiles:read",
      "materials:read",
      "gps_captures:read",
      "operations:read",
      "operations:view_scores",
      "operations:view_alerts",
      "analytics:view",
      "analytics:export",
      "analytics:view_employee_performance",
      "analytics:view_site_performance",
      "data_products:read",
      "exports:create",
      "exports:download",
    ],
  },
  {
    role: "data_engineer",
    label: "Data Engineer",
    description: "Data engineer that manages exports, connectors and data products.",
    surfaces: ["tenant_data_hub", "tenant_analytics"],
    permissions: [
      "company:read",
      "sites:read",
      "devices:read",
      "gps_captures:read",
      "operations:read",
      "analytics:view",
      "analytics:export",
      "data_products:read",
      "data_products:manage",
      "exports:create",
      "exports:download",
      "connectors:read",
      "connectors:manage",
      "audit_logs:read",
    ],
  },
  {
    role: "data_scientist",
    label: "Data Scientist",
    description: "Data science user for AI-ready datasets and LLM tools.",
    surfaces: ["tenant_data_hub", "tenant_analytics"],
    permissions: [
      "company:read",
      "sites:read",
      "devices:read",
      "gps_captures:read",
      "operations:read",
      "analytics:view",
      "analytics:export",
      "data_products:read",
      "exports:create",
      "exports:download",
      "llm_tools:read",
      "llm_tools:invoke",
    ],
  },
  {
    role: "viewer",
    label: "Viewer",
    description: "Read-only customer user.",
    surfaces: ["tenant_operations", "tenant_analytics"],
    permissions: [
      "company:read",
      "sites:read",
      "devices:read",
      "stockpiles:read",
      "materials:read",
      "gps_captures:read",
      "operations:read",
      "operations:view_scores",
      "operations:view_alerts",
      "analytics:view",
    ],
  },
];

export const getAplomoRolePolicy = (
  role: AplomoPlatformRole | AplomoTenantRole,
): AplomoRolePolicy | undefined => {
  return [...createAplomoPlatformRolePolicies(), ...createAplomoTenantRolePolicies()].find(
    (policy) => policy.role === role,
  );
};

export const getAplomoTenantMembership = (
  subject: AplomoAccessSubject,
  companyId: string | undefined,
): AplomoTenantMembershipAccess | undefined => {
  if (!companyId) {
    return undefined;
  }

  return subject.tenantMemberships.find(
    (membership) =>
      membership.companyId === companyId && membership.status === "active",
  );
};

export const resolveAplomoEffectivePermissions = (
  subject: AplomoAccessSubject,
  companyId?: string,
): AplomoSaasPermission[] => {
  const permissions: AplomoSaasPermission[] = [];
  const platformPolicy = getAplomoRolePolicy(subject.platformRole);

  if (platformPolicy) {
    permissions.push(...platformPolicy.permissions);
  }

  const membership = getAplomoTenantMembership(subject, companyId);
  const tenantPolicy = membership ? getAplomoRolePolicy(membership.role) : undefined;

  if (tenantPolicy) {
    permissions.push(...tenantPolicy.permissions);
  }

  if (membership?.permissionsOverride) {
    permissions.push(...membership.permissionsOverride);
  }

  return uniquePermissions(permissions);
};

export const canAplomoAccess = (
  input: AplomoAccessCheckInput,
): AplomoAccessDecision => {
  const effectivePermissions = resolveAplomoEffectivePermissions(
    input.subject,
    input.companyId,
  );

  const membership = getAplomoTenantMembership(input.subject, input.companyId);
  const platformPolicy = getAplomoRolePolicy(input.subject.platformRole);
  const tenantPolicy = membership ? getAplomoRolePolicy(membership.role) : undefined;

  const surfaceAllowedByPlatform =
    platformPolicy?.surfaces.includes(input.surface) ?? false;

  const surfaceAllowedByTenant =
    tenantPolicy?.surfaces.includes(input.surface) ?? false;

  const hasPermission = effectivePermissions.includes(input.permission);
  const allowed = hasPermission && (surfaceAllowedByPlatform || surfaceAllowedByTenant);

  const decision: AplomoAccessDecision = {
    allowed,
    reason: allowed
      ? "Access granted by effective role policy."
      : "Access denied by missing permission, inactive membership or blocked surface.",
    evaluatedAt: new Date().toISOString(),
    platformRole: input.subject.platformRole,
    surface: input.surface,
    permission: input.permission,
    effectivePermissions,
  };

  if (input.companyId) {
    decision.companyId = input.companyId;
  }

  if (membership) {
    decision.tenantRole = membership.role;
  }

  return decision;
};

export const canAplomoManageTenantUsers = (
  subject: AplomoAccessSubject,
  companyId: string,
): boolean => {
  return canAplomoAccess({
    subject,
    companyId,
    surface: "tenant_admin",
    permission: "company:manage_users",
  }).allowed;
};

export const canAplomoCreateGpsCapture = (
  subject: AplomoAccessSubject,
  companyId: string,
): boolean => {
  return canAplomoAccess({
    subject,
    companyId,
    surface: "tenant_capture",
    permission: "gps_captures:create",
  }).allowed;
};

export const canAplomoDownloadExports = (
  subject: AplomoAccessSubject,
  companyId: string,
): boolean => {
  return canAplomoAccess({
    subject,
    companyId,
    surface: "tenant_data_hub",
    permission: "exports:download",
  }).allowed;
};

export const canAplomoUsePlatformConsole = (
  subject: AplomoAccessSubject,
): boolean => {
  return canAplomoAccess({
    subject,
    surface: "aplomo_super_admin",
    permission: "platform:cross_tenant_read",
  }).allowed;
};
