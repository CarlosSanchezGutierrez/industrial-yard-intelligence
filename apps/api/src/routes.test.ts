import { describe, expect, it } from "vitest";
import { routeApiRequest } from "./index.js";

const now = "2026-04-28T12:00:00.000Z";

function get(pathname: string) {
  return routeApiRequest({
    method: "GET",
    pathname,
    requestId: `request_${pathname.replace(/[^a-z0-9]/gi, "_")}`,
    now
  });
}

describe("@iyi/api routes", () => {
  it("serves API manifest", () => {
    const response = get("/");
    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        service: string;
        routes: readonly {
          method: string;
          path: string;
        }[];
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.service).toBe("@iyi/api");
    expect(body.data.routes.some((route) => route.path === "/health")).toBe(true);
    expect(body.data.routes.some((route) => route.path === "/db/schema")).toBe(true);
  });

  it("serves health check", () => {
    const response = get("/health");
    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        status: string;
        service: string;
        dbSchemaVersion: string;
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe("ok");
    expect(body.data.service).toBe("@iyi/api");
    expect(body.data.dbSchemaVersion).toContain("core_schema");
  });

  it("serves DB schema SQL", () => {
    const response = get("/db/schema");
    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        migrationId: string;
        sql: string;
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.migrationId).toContain("core_schema");
    expect(body.data.sql).toContain("CREATE TABLE IF NOT EXISTS app_tenants");
    expect(body.data.sql).toContain("CREATE TABLE IF NOT EXISTS evidence_items");
  });

  it("serves required DB table names", () => {
    const response = get("/db/tables");
    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        tables: readonly string[];
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.tables).toContain("app_tenants");
    expect(body.data.tables).toContain("sync_events");
    expect(body.data.tables).toContain("audit_entries");
    expect(body.data.tables).toContain("evidence_items");
  });

  it("serves Cooper smoke seed", () => {
    const response = get("/seed/cooper-smoke");
    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        seed: {
          tenantName: string;
          stockpiles: readonly unknown[];
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.seed.tenantName).toBe("Cooper/T. Smith");
    expect(body.data.seed.stockpiles.length).toBeGreaterThan(0);
  });

  it("returns 404 for unknown route", () => {
    const response = get("/unknown");
    const body = JSON.parse(response.body) as {
      ok: boolean;
      error: {
        code: string;
      };
    };

    expect(response.statusCode).toBe(404);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("not_found");
  });
});