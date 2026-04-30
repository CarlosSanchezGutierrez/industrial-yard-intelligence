export const aplomoUserRoles = [
  "owner",
  "admin",
  "supervisor",
  "operator",
  "technician",
  "viewer",
  "guest",
] as const;

export type AplomoUserRole = (typeof aplomoUserRoles)[number];

export const aplomoPermissions = [
  "company.manage",
  "site.manage",
  "yard.manage",
  "user.manage",
  "device.register",
  "device.manage",
  "device.view",
  "telemetry.emit",
  "telemetry.view_live",
  "telemetry.view_history",
  "gps_capture.create",
  "gps_capture.review",
  "gps_capture.delete",
  "evidence.upload",
  "evidence.view",
  "evidence.delete",
  "map_object.manage",
  "route.manage",
  "audit.view",
] as const;

export type AplomoPermission = (typeof aplomoPermissions)[number];

export const aplomoRolePermissions: Record<AplomoUserRole, AplomoPermission[]> = {
  owner: [...aplomoPermissions],
  admin: [
    "company.manage",
    "site.manage",
    "yard.manage",
    "user.manage",
    "device.register",
    "device.manage",
    "device.view",
    "telemetry.view_live",
    "telemetry.view_history",
    "gps_capture.create",
    "gps_capture.review",
    "gps_capture.delete",
    "evidence.upload",
    "evidence.view",
    "evidence.delete",
    "map_object.manage",
    "route.manage",
    "audit.view",
  ],
  supervisor: [
    "device.view",
    "telemetry.view_live",
    "telemetry.view_history",
    "gps_capture.create",
    "gps_capture.review",
    "evidence.upload",
    "evidence.view",
    "map_object.manage",
    "route.manage",
    "audit.view",
  ],
  operator: [
    "device.view",
    "telemetry.emit",
    "telemetry.view_live",
    "gps_capture.create",
    "evidence.upload",
    "evidence.view",
  ],
  technician: [
    "device.register",
    "device.manage",
    "device.view",
    "telemetry.emit",
    "telemetry.view_live",
    "telemetry.view_history",
    "gps_capture.create",
    "evidence.upload",
    "evidence.view",
  ],
  viewer: [
    "device.view",
    "telemetry.view_live",
    "telemetry.view_history",
    "evidence.view",
    "audit.view",
  ],
  guest: ["device.view", "telemetry.view_live", "evidence.view"],
};

export const roleHasPermission = (
  role: AplomoUserRole,
  permission: AplomoPermission,
): boolean => {
  return aplomoRolePermissions[role].includes(permission);
};
