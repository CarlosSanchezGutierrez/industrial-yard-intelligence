import { describe, expect, it } from "vitest";
import {
  countDbProjectionRows,
  dbProjectionTableNames,
  getEmptyDbProjectionTableCounts,
  isDbProjectionTableName,
  type DbProjectionSnapshotContract,
  type DbProjectionSummaryContract
} from "./index.js";

describe("@iyi/api-contracts DB projection", () => {
  it("defines stable DB projection table names", () => {
    expect(dbProjectionTableNames).toContain("app_tenants");
    expect(dbProjectionTableNames).toContain("stockpiles");
    expect(dbProjectionTableNames).toContain("sync_events");
    expect(dbProjectionTableNames).toContain("audit_entries");
    expect(dbProjectionTableNames).toContain("evidence_items");
  });

  it("recognizes DB projection table names", () => {
    expect(isDbProjectionTableName("sync_events")).toBe(true);
    expect(isDbProjectionTableName("unknown_table")).toBe(false);
  });

  it("creates empty table counts", () => {
    const counts = getEmptyDbProjectionTableCounts();

    expect(counts.app_tenants).toBe(0);
    expect(counts.sync_events).toBe(0);
    expect(counts.evidence_items).toBe(0);
    expect(Object.keys(counts)).toHaveLength(dbProjectionTableNames.length);
  });

  it("counts DB projection rows", () => {
    const counts = getEmptyDbProjectionTableCounts();

    counts.app_tenants = 1;
    counts.sync_events = 2;
    counts.audit_entries = 1;
    counts.evidence_items = 1;

    expect(countDbProjectionRows(counts)).toBe(5);
  });

  it("types a DB projection snapshot", () => {
    const snapshot: DbProjectionSnapshotContract = {
      version: 1,
      exportedAt: "2026-04-28T12:00:00.000Z",
      tables: {
        app_tenants: [{ id: "tenant_cooper_tsmith" }],
        terminals: [],
        app_users: [],
        devices: [],
        stockpiles: [],
        yard_zones: [],
        measurements: [],
        sync_events: [],
        conflict_resolutions: [],
        audit_entries: [],
        evidence_items: []
      }
    };

    expect(snapshot.version).toBe(1);
    expect(snapshot.tables.app_tenants).toHaveLength(1);
  });

  it("types a DB projection summary", () => {
    const tableCounts = getEmptyDbProjectionTableCounts();

    tableCounts.app_tenants = 1;
    tableCounts.stockpiles = 2;

    const summary: DbProjectionSummaryContract = {
      version: 1,
      exportedAt: "2026-04-28T12:00:00.000Z",
      storeFile: ".edge-data/edge-db-snapshot.json",
      tableCounts,
      totalRows: countDbProjectionRows(tableCounts)
    };

    expect(summary.totalRows).toBe(3);
    expect(summary.tableCounts.stockpiles).toBe(2);
  });
});