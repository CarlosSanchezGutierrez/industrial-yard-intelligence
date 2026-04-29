import { beforeEach, describe, expect, it } from "vitest";
import {
  getEdgeDbSnapshot,
  getEdgeDbSummary,
  resetAuditStore,
  resetConflictResolutionStore,
  resetEdgeMemoryStore,
  resetEvidenceStore,
  routeEdgeRequest
} from "./index.js";

describe("@iyi/edge DB projection", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
    resetAuditStore();
    resetEvidenceStore();
  });

  it("creates a DB projection snapshot from seed state", () => {
    const snapshot = getEdgeDbSnapshot("2026-04-28T12:00:00.000Z");

    expect(snapshot.version).toBe(1);
    expect(snapshot.tables.app_tenants).toHaveLength(1);
    expect(snapshot.tables.terminals).toHaveLength(1);
    expect(snapshot.tables.app_users.length).toBeGreaterThan(0);
    expect(snapshot.tables.devices.length).toBeGreaterThan(0);
    expect(snapshot.tables.stockpiles.length).toBeGreaterThan(0);
    expect(snapshot.tables.sync_events).toHaveLength(0);
    expect(snapshot.tables.audit_entries).toHaveLength(0);
    expect(snapshot.tables.evidence_items).toHaveLength(0);
  });

  it("projects guided demo state into DB tables", () => {
    routeEdgeRequest({
      method: "POST",
      pathname: "/admin/run-guided-demo",
      requestId: "request_guided_demo",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        resetBeforeRun: true
      }
    });

    const snapshot = getEdgeDbSnapshot("2026-04-28T12:00:01.000Z");
    const summary = getEdgeDbSummary("2026-04-28T12:00:01.000Z");

    expect(snapshot.tables.sync_events).toHaveLength(2);
    expect(snapshot.tables.sync_events.some((event) => event.status === "accepted")).toBe(true);
    expect(snapshot.tables.sync_events.some((event) => event.status === "conflict")).toBe(true);
    expect(snapshot.tables.audit_entries).toHaveLength(1);
    expect(snapshot.tables.evidence_items).toHaveLength(1);
    expect(summary.tableCounts.sync_events).toBe(2);
    expect(summary.tableCounts.audit_entries).toBe(1);
    expect(summary.tableCounts.evidence_items).toBe(1);
  });

  it("serves DB summary endpoint", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/db/summary",
      requestId: "request_db_summary",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        summary: {
          version: number;
          tableCounts: Record<string, number>;
          totalRows: number;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.summary.version).toBe(1);
    expect(body.data.summary.tableCounts.app_tenants).toBe(1);
    expect(body.data.summary.totalRows).toBeGreaterThan(0);
  });

  it("serves DB snapshot endpoint", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/db/snapshot",
      requestId: "request_db_snapshot",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        snapshot: {
          version: number;
          tables: {
            app_tenants: readonly unknown[];
            stockpiles: readonly unknown[];
          };
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.snapshot.version).toBe(1);
    expect(body.data.snapshot.tables.app_tenants).toHaveLength(1);
    expect(body.data.snapshot.tables.stockpiles.length).toBeGreaterThan(0);
  });

  it("saves DB snapshot endpoint", () => {
    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/db/snapshot/save",
      requestId: "request_db_snapshot_save",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        saved: boolean;
        storeFile: string;
        snapshot: {
          version: number;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.saved).toBe(true);
    expect(body.data.storeFile).toContain("edge-db-snapshot.json");
    expect(body.data.snapshot.version).toBe(1);
  });

  it("advertises DB projection endpoints in manifest", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/",
      requestId: "request_manifest",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        routes: readonly {
          method: string;
          path: string;
        }[];
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.routes.some((route) => route.method === "GET" && route.path === "/db/summary")).toBe(true);
    expect(body.data.routes.some((route) => route.method === "GET" && route.path === "/db/snapshot")).toBe(true);
    expect(
      body.data.routes.some((route) => route.method === "POST" && route.path === "/db/snapshot/save")
    ).toBe(true);
  });
});