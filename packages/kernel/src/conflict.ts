export const conflictTypes = [
  "geometry_conflict",
  "status_conflict",
  "quantity_conflict",
  "duplicate_asset",
  "stale_measurement",
  "validation_conflict",
  "tenant_mismatch",
  "device_identity_conflict",
  "evidence_conflict"
] as const;

export type ConflictType = (typeof conflictTypes)[number];
