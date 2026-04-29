import { describe, expect, it } from "vitest";
import {
  assertKnownDbTableName,
  coreSchemaMigration,
  dbSchemaVersion,
  dbTableNames,
  getCoreSchemaSql,
  getRequiredCoreTableNames,
  isKnownDbTableName
} from "./index.js";

describe("@iyi/db schema v1", () => {
  it("defines a stable migration id", () => {
    expect(dbSchemaVersion).toBe("2026_04_28_0001_core_schema");
    expect(coreSchemaMigration.id).toBe(dbSchemaVersion);
  });

  it("defines required core tables", () => {
    expect(getRequiredCoreTableNames()).toEqual(dbTableNames);
    expect(dbTableNames).toContain("app_tenants");
    expect(dbTableNames).toContain("terminals");
    expect(dbTableNames).toContain("stockpiles");
    expect(dbTableNames).toContain("sync_events");
    expect(dbTableNames).toContain("conflict_resolutions");
    expect(dbTableNames).toContain("audit_entries");
    expect(dbTableNames).toContain("evidence_items");
  });

  it("generates SQL for every core table", () => {
    const sql = getCoreSchemaSql();

    for (const tableName of dbTableNames) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${tableName}`);
    }
  });

  it("includes expected relationships and constraints", () => {
    const sql = getCoreSchemaSql();

    expect(sql).toContain("REFERENCES app_tenants(id)");
    expect(sql).toContain("REFERENCES terminals(id)");
    expect(sql).toContain("REFERENCES sync_events(id)");
    expect(sql).toContain("UNIQUE (tenant_id, idempotency_key)");
    expect(sql).toContain("UNIQUE (tenant_id, hash_value)");
    expect(sql).toContain("hash_algorithm text NOT NULL DEFAULT 'sha256'");
  });

  it("includes query indexes for operational paths", () => {
    const sql = getCoreSchemaSql();

    expect(sql).toContain("idx_sync_events_tenant_status");
    expect(sql).toContain("idx_sync_events_aggregate");
    expect(sql).toContain("idx_audit_entries_tenant_created_at");
    expect(sql).toContain("idx_evidence_items_tenant_registered_at");
  });

  it("recognizes known DB table names", () => {
    expect(isKnownDbTableName("sync_events")).toBe(true);
    expect(assertKnownDbTableName("evidence_items")).toBe("evidence_items");
    expect(isKnownDbTableName("unknown_table")).toBe(false);
    expect(() => assertKnownDbTableName("unknown_table")).toThrow("Unknown DB table name");
  });

  it("keeps migration statements non-empty", () => {
    expect(coreSchemaMigration.statements.length).toBeGreaterThan(dbTableNames.length);
    expect(getCoreSchemaSql().length).toBeGreaterThan(1000);
  });
});