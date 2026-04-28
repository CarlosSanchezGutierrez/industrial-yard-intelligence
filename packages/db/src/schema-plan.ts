import { getOperationalRequiredColumns, getTenantAwareRequiredColumns } from "./columns.js";
import { createTableConvention, type TableConvention } from "./conventions.js";

export const initialTableConventions: readonly TableConvention[] = [
  createTableConvention({
    schema: "core",
    table: "tenants",
    tenantAware: false,
    requiredColumns: ["id", "name", "created_at"]
  }),
  createTableConvention({
    schema: "core",
    table: "terminals",
    tenantAware: true,
    requiredColumns: [...getTenantAwareRequiredColumns(), "name"]
  }),
  createTableConvention({
    schema: "spatial",
    table: "yards",
    tenantAware: true,
    spatial: true,
    requiredColumns: [...getOperationalRequiredColumns(), "name", "geometry"]
  }),
  createTableConvention({
    schema: "spatial",
    table: "zones",
    tenantAware: true,
    spatial: true,
    requiredColumns: [...getOperationalRequiredColumns(), "yard_id", "name", "geometry"]
  }),
  createTableConvention({
    schema: "operations",
    table: "stockpiles",
    tenantAware: true,
    spatial: true,
    requiredColumns: [...getOperationalRequiredColumns(), "material_id", "geometry"]
  }),
  createTableConvention({
    schema: "operations",
    table: "operational_events",
    tenantAware: true,
    appendOnly: true,
    requiredColumns: [
      "id",
      "tenant_id",
      "created_at",
      "created_by_user_id",
      "created_by_device_id",
      "source_runtime",
      "event_type",
      "payload"
    ]
  }),
  createTableConvention({
    schema: "sync",
    table: "sync_events",
    tenantAware: true,
    appendOnly: true,
    requiredColumns: [
      "id",
      "tenant_id",
      "created_at",
      "created_by_user_id",
      "created_by_device_id",
      "source_runtime",
      "event_id",
      "idempotency_key",
      "local_sequence",
      "received_at_edge",
      "sync_status"
    ]
  }),
  createTableConvention({
    schema: "media",
    table: "evidence_items",
    tenantAware: true,
    requiredColumns: [
      "id",
      "tenant_id",
      "created_at",
      "created_by_user_id",
      "created_by_device_id",
      "source_runtime",
      "evidence_id",
      "evidence_type",
      "storage_provider",
      "storage_key"
    ]
  }),
  createTableConvention({
    schema: "audit",
    table: "audit_log",
    tenantAware: true,
    appendOnly: true,
    requiredColumns: [
      "id",
      "tenant_id",
      "created_at",
      "created_by_user_id",
      "created_by_device_id",
      "source_runtime",
      "action_type",
      "affected_entity_id",
      "affected_entity_type",
      "result"
    ]
  })
];