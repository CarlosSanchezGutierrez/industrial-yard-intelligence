import { describe, expect, it } from "vitest";
import { createApiRepositorySeed, routeApiRequest } from "./index.js";

const now = "2026-04-28T12:00:00.000Z";

async function get(pathname: string, query?: Readonly<Record<string, string>>) {
  return routeApiRequest({
    method: "GET",
    pathname,
    requestId: `request_${pathname.replace(/[^a-z0-9]/gi, "_")}`,
    now,
    ...(query !== undefined ? { query } : {})
  });
}

describe("@iyi/api routes", () => {
  it("creates repository seed", () => {
    const seed = createApiRepositorySeed(now);

    expect(seed.tenants).toHaveLength(1);
    expect(seed.terminals).toHaveLength(1);
    expect(seed.users.length).toBeGreaterThan(0);
    expect(seed.devices.length).toBeGreaterThan(0);
    expect(seed.stockpiles.length).toBeGreaterThan(0);
  });

  it("serves API manifest", async () => {
    const response = await get("/");
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
    expect(body.data.routes.some((route) => route.path === "/tenants")).toBe(true);
    expect(body.data.routes.some((route) => route.path === "/stockpiles")).toBe(true);
  });

  it("serves health check", async () => {
    const response = await get("/health");
    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        status: string;
        service: string;
        dbSchemaVersion: string;
        repositoryMode: string;
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe("ok");
    expect(body.data.service).toBe("@iyi/api");
    expect(body.data.repositoryMode).toBe("in_memory");
    expect(body.data.dbSchemaVersion).toContain("core_schema");
  });

  it("serves DB schema SQL", async () => {
    const response = await get("/db/schema");
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

  it("serves required DB table names", async () => {
    const response = await get("/db/tables");
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

  it("serves Cooper smoke seed", async () => {
    const response = await get("/seed/cooper-smoke");
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

  it("serves tenants from repository layer", async () => {
    const response = await get("/tenants");
    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        tenants: readonly {
          id: string;
          name: string;
        }[];
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.tenants).toHaveLength(1);
    expect(body.data.tenants[0]?.id).toBe("tenant_cooper_tsmith");
  });

  it("serves stockpiles from repository layer", async () => {
    const response = await get("/stockpiles", {
      tenantId: "tenant_cooper_tsmith"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        stockpiles: readonly {
          tenantId: string;
          name: string;
          material: string;
        }[];
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.stockpiles.length).toBeGreaterThan(0);
    expect(body.data.stockpiles.every((stockpile) => stockpile.tenantId === "tenant_cooper_tsmith")).toBe(true);
  });

  it("serves repository-backed system overview", async () => {
    const response = await get("/system/overview");
    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        tenantCount: number;
        terminalCount: number;
        stockpileCount: number;
        syncEventCount: number;
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.tenantCount).toBe(1);
    expect(body.data.terminalCount).toBe(1);
    expect(body.data.stockpileCount).toBeGreaterThan(0);
    expect(body.data.syncEventCount).toBe(0);
  });

  it("returns 404 for unknown route", async () => {
    const response = await get("/unknown");
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