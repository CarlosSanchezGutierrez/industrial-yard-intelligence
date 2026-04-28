import { describe, expect, it } from "vitest";
import {
  auditLogTable,
  createMigrationDescriptor,
  createMigrationId,
  createTableConvention,
  evidenceItemsTable,
  getDrizzleTableIdentifiers,
  getOperationalRequiredColumns,
  initialTableConventions,
  qualifyTableName,
  stockpilesTable,
  syncEventsTable,
  tenantsTable,
  validateSqlIdentifier,
  validateTableConvention
} from "./index.js";

describe("@iyi/db", () => {
  it("qualifies table names", () => {
    expect(qualifyTableName("sync", "sync_events")).toBe("sync.sync_events");
  });

  it("validates SQL identifiers", () => {
    expect(validateSqlIdentifier("tenant_id").ok).toBe(true);

    const result = validateSqlIdentifier("TenantId");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_identifier");
    }
  });

  it("requires tenant_id for tenant-aware table conventions", () => {
    const convention = createTableConvention({
      schema: "operations",
      table: "stockpiles",
      tenantAware: true,
      requiredColumns: ["id"]
    });

    const result = validateTableConvention(convention);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("tenant_aware_table_requires_tenant_id");
    }
  });

  it("rejects updated_at on append-only tables", () => {
    const convention = createTableConvention({
      schema: "audit",
      table: "audit_log",
      tenantAware: true,
      appendOnly: true,
      requiredColumns: ["id", "tenant_id", "updated_at"]
    });

    const result = validateTableConvention(convention);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("append_only_table_must_not_require_updated_at");
    }
  });

  it("requires geometry column for spatial tables", () => {
    const convention = createTableConvention({
      schema: "spatial",
      table: "yards",
      tenantAware: true,
      spatial: true,
      requiredColumns: ["id", "tenant_id"]
    });

    const result = validateTableConvention(convention);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("spatial_table_requires_geometry_column");
    }
  });

  it("creates migration ids", () => {
    const result = createMigrationId(1, "tenants_terminals");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("0001_tenants_terminals");
    }
  });

  it("creates migration descriptors", () => {
    const result = createMigrationDescriptor({
      sequence: 1,
      phase: "tenants_terminals",
      description: "Create tenants and terminals."
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("0001_tenants_terminals");
    }
  });

  it("defines operational required columns", () => {
    expect(getOperationalRequiredColumns()).toContain("tenant_id");
    expect(getOperationalRequiredColumns()).toContain("validation_state");
    expect(getOperationalRequiredColumns()).toContain("confidence_level");
  });

  it("keeps initial table conventions valid", () => {
    const results = initialTableConventions.map(validateTableConvention);

    expect(results.every((result) => result.ok)).toBe(true);
  });

  it("exports Drizzle table objects", () => {
    expect(tenantsTable).toBeTruthy();
    expect(stockpilesTable).toBeTruthy();
    expect(syncEventsTable).toBeTruthy();
    expect(evidenceItemsTable).toBeTruthy();
    expect(auditLogTable).toBeTruthy();
  });

  it("registers expected Drizzle table identifiers", () => {
    const identifiers = getDrizzleTableIdentifiers();

    expect(identifiers).toContain("core.tenants");
    expect(identifiers).toContain("spatial.yards");
    expect(identifiers).toContain("operations.stockpiles");
    expect(identifiers).toContain("sync.sync_events");
    expect(identifiers).toContain("media.evidence_items");
    expect(identifiers).toContain("audit.audit_log");
    expect(identifiers).toContain("analytics.kpi_snapshots");
  });
});