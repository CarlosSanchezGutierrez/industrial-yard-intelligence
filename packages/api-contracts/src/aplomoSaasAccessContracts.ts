import type {
  AplomoAccessDecision,
  AplomoAccessSubject,
  AplomoPlatformRole,
  AplomoSaasPermission,
  AplomoSaasSurface,
  AplomoTenantRole,
} from "@iyi/domain";

import type {
  AplomoApiResult,
  AplomoPageRequest,
  AplomoPagedResult,
} from "./aplomoCommon.js";

export type AplomoCurrentAccessContext = {
  subject: AplomoAccessSubject;
  activeCompanyId?: string;
  visibleSurfaces: AplomoSaasSurface[];
  effectivePermissions: AplomoSaasPermission[];
};

export type AplomoGetCurrentAccessContextRequest = {
  activeCompanyId?: string;
};

export type AplomoGetCurrentAccessContextResponse = AplomoApiResult<{
  context: AplomoCurrentAccessContext;
}>;

export type AplomoCheckAccessRequest = {
  companyId?: string;
  surface: AplomoSaasSurface;
  permission: AplomoSaasPermission;
};

export type AplomoCheckAccessResponse = AplomoApiResult<{
  decision: AplomoAccessDecision;
}>;

export type AplomoTenantUserSummary = {
  profileId: string;
  email?: string;
  displayName?: string;
  companyId: string;
  tenantRole: AplomoTenantRole;
  status: "active" | "inactive" | "invited" | "suspended";
  permissionsOverride: AplomoSaasPermission[];
  createdAt: string;
  updatedAt: string;
};

export type AplomoListTenantUsersRequest = AplomoPageRequest & {
  companyId: string;
  role?: AplomoTenantRole;
  status?: "active" | "inactive" | "invited" | "suspended";
  search?: string;
};

export type AplomoListTenantUsersResponse = AplomoApiResult<
  AplomoPagedResult<AplomoTenantUserSummary>
>;

export type AplomoInviteTenantUserRequest = {
  companyId: string;
  email: string;
  displayName?: string;
  tenantRole: AplomoTenantRole;
  permissionsOverride?: AplomoSaasPermission[];
  siteIds?: string[];
};

export type AplomoInviteTenantUserResponse = AplomoApiResult<{
  invitedUser: AplomoTenantUserSummary;
}>;

export type AplomoUpdateTenantUserRoleRequest = {
  companyId: string;
  profileId: string;
  tenantRole: AplomoTenantRole;
  permissionsOverride?: AplomoSaasPermission[];
};

export type AplomoUpdateTenantUserRoleResponse = AplomoApiResult<{
  user: AplomoTenantUserSummary;
}>;

export type AplomoPlatformCompanySummary = {
  companyId: string;
  name: string;
  slug: string;
  status: string;
  subscriptionStatus?: string;
  adminCount: number;
  activeUserCount: number;
  deviceCount: number;
  siteCount: number;
  lastActivityAt?: string;
};

export type AplomoListPlatformCompaniesRequest = AplomoPageRequest & {
  platformRole: AplomoPlatformRole;
  status?: string;
  search?: string;
};

export type AplomoListPlatformCompaniesResponse = AplomoApiResult<
  AplomoPagedResult<AplomoPlatformCompanySummary>
>;

export const aplomoAccessApiRoutes = {
  getCurrentAccessContext: "GET /access/current",
  checkAccess: "POST /access/check",
  listTenantUsers: "GET /companies/:companyId/users",
  inviteTenantUser: "POST /companies/:companyId/users/invite",
  updateTenantUserRole: "PATCH /companies/:companyId/users/:profileId/role",
  listPlatformCompanies: "GET /platform/companies",
} as const;

export type AplomoAccessApiRoute =
  (typeof aplomoAccessApiRoutes)[keyof typeof aplomoAccessApiRoutes];
