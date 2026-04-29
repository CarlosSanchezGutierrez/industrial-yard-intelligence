import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApiRepositorySeed, routeApiRequest } from "./index.js";

const now = "2026-04-28T12:00:00.000Z";

let tempDirectory: string | null = null;

beforeEach(() => {
  tempDirectory = mkdtempSync(join(tmpdir(), "iyi-api-routes-"));
  process.env["IYI_API_DATA_DIR"] = tempDirectory;
});

afterEach(() => {
  delete process.env["IYI_API_DATA_DIR"];

  if (tempDirectory !== null) {
    rmSync(tempDirectory, {
      recursive: true,
      force: true
    });
  }

  tempDirectory = null;
});

async function get(pathname: string, query?: Readonly<Record<string, string>>) {
  return routeApiRequest({
    method: "GET",
    pathname,
    requestId: `request_${pathname.replace(/[^a-z0-9]/gi, "_")}`,
    now,
    ...(query !== undefined ? { query } : {})
  });
}

async function post(pathname: string, body?: unknown) {
  return routeApiRequest({
    method: "POST",
    pathname,
    requestId: `request_${pathname.replace(/[^a-z0-9]/gi, "_")}`,
    now,
    ...(body !== undefined ? { body } : {})
  });
}
async function patch(pathname: string, body?: unknown) {
  return routeApiRequest({
    method: "PATCH",
    pathname,
    requestId: `request_${pathname.replace(/[^a-z0-9]/gi, "_")}`,
    now,
    ...(body !== undefined ? { body } : {})
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
    expect(body.data.routes.some((route) => route.method === "POST" && route.path === "/stockpiles")).toBe(true);
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
    expect(body.data.repositoryMode).toBe("json_file");
    expect(body.data.dbSchemaVersion).toContain("core_schema");
  });

  it("adds CORS headers to JSON responses", async () => {
    const response = await get("/health");

    expect(response.headers["access-control-allow-origin"]).toBe("*");
    expect(response.headers["access-control-allow-methods"]).toContain("OPTIONS");
    expect(response.headers["access-control-allow-headers"]).toContain("content-type");
    expect(response.headers["content-type"]).toBe("application/json; charset=utf-8");
  });

  it("serves CORS preflight requests", async () => {
    const response = await routeApiRequest({
      method: "OPTIONS",
      pathname: "/health",
      requestId: "request_options_health",
      now
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(response.headers["access-control-allow-origin"]).toBe("*");
    expect(response.headers["access-control-allow-methods"]).toContain("GET");
    expect(response.headers["access-control-allow-methods"]).toContain("OPTIONS");
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

  it("creates and persists stockpiles", async () => {
    const createResponse = await post("/stockpiles", {
      id: "stockpile_created_from_test",
      tenantId: "tenant_cooper_tsmith",
      terminalId: "terminal_altamira",
      name: "Nuevo patio API",
      material: "pet coke",
      category: "bulk",
      estimatedTons: 777,
      status: "draft"
    });

    const createBody = JSON.parse(createResponse.body) as {
      ok: boolean;
      data: {
        stockpile: {
          id: string;
          name: string;
          estimatedTons: number;
          status: string;
        };
      };
    };

    expect(createResponse.statusCode).toBe(201);
    expect(createBody.ok).toBe(true);
    expect(createBody.data.stockpile.id).toBe("stockpile_created_from_test");
    expect(createBody.data.stockpile.estimatedTons).toBe(777);
    expect(createBody.data.stockpile.status).toBe("draft");

    const listResponse = await get("/stockpiles", {
      tenantId: "tenant_cooper_tsmith"
    });

    const listBody = JSON.parse(listResponse.body) as {
      ok: boolean;
      data: {
        stockpiles: readonly {
          id: string;
        }[];
      };
    };

    expect(listBody.ok).toBe(true);
    expect(listBody.data.stockpiles.some((stockpile) => stockpile.id === "stockpile_created_from_test")).toBe(true);
  });

  it("rejects invalid stockpile create requests", async () => {
    const response = await post("/stockpiles", {
      tenantId: "tenant_cooper_tsmith"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      error: {
        code: string;
        message: string;
      };
    };

    expect(response.statusCode).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("bad_request");
    expect(body.error.message).toContain("terminalId");
  });

  it("updates stockpile status", async () => {
    const createResponse = await post("/stockpiles", {
      id: "stockpile_status_route",
      tenantId: "tenant_cooper_tsmith",
      terminalId: "terminal_altamira",
      name: "Route status target",
      material: "pet coke",
      status: "draft"
    });

    expect(createResponse.statusCode).toBe(201);

    const updateResponse = await patch("/stockpiles/stockpile_status_route/status", {
      status: "validated",
      validationState: "supervisor_validated",
      confidenceLevel: "reviewed"
    });

    const body = JSON.parse(updateResponse.body) as {
      ok: boolean;
      data: {
        stockpile: {
          id: string;
          status: string;
          validationState: string;
          confidenceLevel: string;
        };
      };
    };

    expect(updateResponse.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.stockpile.id).toBe("stockpile_status_route");
    expect(body.data.stockpile.status).toBe("validated");
    expect(body.data.stockpile.validationState).toBe("supervisor_validated");
    expect(body.data.stockpile.confidenceLevel).toBe("reviewed");
  });

  it("returns 404 when updating missing stockpile status", async () => {
    const response = await patch("/stockpiles/missing_stockpile/status", {
      status: "validated"
    });

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

  it("serves API JSON DB snapshot", async () => {
    const response = await get("/admin/db/snapshot");
    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        storeFile: string;
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
    expect(body.data.storeFile).toContain("api-db.json");
    expect(body.data.snapshot.version).toBe(1);
    expect(body.data.snapshot.tables.app_tenants).toHaveLength(1);
    expect(body.data.snapshot.tables.stockpiles.length).toBeGreaterThan(0);
  });

  it("resets API JSON DB to seed state", async () => {
    const response = await post("/admin/db/reset");

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        reset: boolean;
        storeFile: string;
        overview: {
          tenantCount: number;
          stockpileCount: number;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.reset).toBe(true);
    expect(body.data.storeFile).toContain("api-db.json");
    expect(body.data.overview.tenantCount).toBe(1);
    expect(body.data.overview.stockpileCount).toBeGreaterThan(0);
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