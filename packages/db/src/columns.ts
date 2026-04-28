export const baseTenantColumns = [
  "id",
  "tenant_id",
  "created_at",
  "updated_at"
] as const;

export type BaseTenantColumn = (typeof baseTenantColumns)[number];

export const provenanceColumns = [
  "created_by_user_id",
  "created_by_device_id",
  "source_runtime"
] as const;

export type ProvenanceColumn = (typeof provenanceColumns)[number];

export const validationColumns = [
  "validation_state",
  "confidence_level"
] as const;

export type ValidationColumn = (typeof validationColumns)[number];

export const syncColumns = [
  "event_id",
  "idempotency_key",
  "local_sequence",
  "received_at_edge",
  "sync_status",
  "conflict_type"
] as const;

export type SyncColumn = (typeof syncColumns)[number];

export const evidenceColumns = [
  "evidence_id",
  "evidence_type",
  "storage_provider",
  "storage_key",
  "integrity_hash_algorithm",
  "integrity_hash_value"
] as const;

export type EvidenceColumn = (typeof evidenceColumns)[number];

export function getTenantAwareRequiredColumns(): readonly string[] {
  return [
    ...baseTenantColumns,
    ...provenanceColumns
  ];
}

export function getOperationalRequiredColumns(): readonly string[] {
  return [
    ...getTenantAwareRequiredColumns(),
    ...validationColumns
  ];
}