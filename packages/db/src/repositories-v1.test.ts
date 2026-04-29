import { describe, expect, it } from "vitest";
import {
  InMemoryDbRepository,
  assertIsoDateString,
  assertNonEmptyRecordId,
  createInMemoryDbUnitOfWork,
  hasTenantId,
  type DbStockpileRecord,
  type DbTenantRecord
} from "./index.js";

const now = "2026-04-28T12:00:00.000Z";

function createTenant(id: string): DbTenantRecord {
  return {
    id,
    name: `Tenant ${id}`,
    status: "active",
    createdAt: now,
    updatedAt: now
  };
}

function createStockpile(id: string, tenantId: string): DbStockpileRecord {
  return {
    id,
    tenantId,
    terminalId: "terminal_altamira",
    name: `Stockpile ${id}`,
    material: "Pet coke",
    category: "bulk",
    estimatedTons: 1000,
    validationState: "operational",
    confidenceLevel: "simulated",
    status: "operational",
    createdAt: now,
    updatedAt: now
  };
}

describe("@iyi/db repositories v1", () => {
  it("stores and retrieves records by id", async () => {
    const repository = new InMemoryDbRepository<DbTenantRecord>("app_tenants");
    const tenant = createTenant("tenant_cooper_tsmith");

    await repository.upsert(tenant);

    const loaded = await repository.getById("tenant_cooper_tsmith");

    expect(loaded).toEqual(tenant);
    expect(await repository.count()).toBe(1);
  });

  it("returns cloned records instead of mutable references", async () => {
    const repository = new InMemoryDbRepository<DbTenantRecord>("app_tenants");
    const tenant = createTenant("tenant_001");

    await repository.upsert(tenant);

    const loaded = await repository.getById("tenant_001");

    expect(loaded).not.toBe(tenant);
    expect(loaded).toEqual(tenant);
  });

  it("filters records by tenant id", async () => {
    const repository = new InMemoryDbRepository<DbStockpileRecord>("stockpiles");

    await repository.upsert(createStockpile("stockpile_001", "tenant_a"));
    await repository.upsert(createStockpile("stockpile_002", "tenant_b"));
    await repository.upsert(createStockpile("stockpile_003", "tenant_a"));

    const tenantARecords = await repository.list({
      tenantId: "tenant_a"
    });

    expect(tenantARecords).toHaveLength(2);
    expect(tenantARecords.every((record) => record.tenantId === "tenant_a")).toBe(true);
  });

  it("supports pagination", async () => {
    const repository = new InMemoryDbRepository<DbTenantRecord>("app_tenants");

    await repository.upsert(createTenant("tenant_001"));
    await repository.upsert(createTenant("tenant_002"));
    await repository.upsert(createTenant("tenant_003"));

    const page = await repository.list({
      limit: 1,
      offset: 1
    });

    expect(page).toHaveLength(1);
    expect(page[0]?.id).toBe("tenant_002");
  });

  it("deletes records by id", async () => {
    const repository = new InMemoryDbRepository<DbTenantRecord>("app_tenants");

    await repository.upsert(createTenant("tenant_001"));

    expect(await repository.deleteById("tenant_001")).toBe(true);
    expect(await repository.getById("tenant_001")).toBe(null);
    expect(await repository.deleteById("tenant_001")).toBe(false);
  });

  it("snapshots and restores repository state", async () => {
    const repository = new InMemoryDbRepository<DbTenantRecord>("app_tenants");

    await repository.upsert(createTenant("tenant_001"));

    const snapshot = repository.snapshot();

    repository.clear();

    expect(await repository.count()).toBe(0);

    repository.restore(snapshot);

    expect(await repository.count()).toBe(1);
    expect((await repository.getById("tenant_001"))?.name).toBe("Tenant tenant_001");
  });

  it("provides a unit of work with all core repositories", async () => {
    const unitOfWork = createInMemoryDbUnitOfWork({
      tenants: [createTenant("tenant_cooper_tsmith")]
    });

    const result = await unitOfWork.transaction(async ({ repositories }) => {
      const tenant = await repositories.tenants.getById("tenant_cooper_tsmith");

      await repositories.stockpiles.upsert(createStockpile("stockpile_001", "tenant_cooper_tsmith"));

      const stockpileCount = await repositories.stockpiles.count({
        tenantId: "tenant_cooper_tsmith"
      });

      return {
        tenant,
        stockpileCount
      };
    });

    expect(result.tenant?.id).toBe("tenant_cooper_tsmith");
    expect(result.stockpileCount).toBe(1);
  });

  it("validates record ids and date strings", () => {
    expect(assertNonEmptyRecordId(" tenant_001 ")).toBe("tenant_001");
    expect(() => assertNonEmptyRecordId("   ")).toThrow("DB record id must not be empty");

    expect(assertIsoDateString(now, "createdAt")).toBe(now);
    expect(() => assertIsoDateString("not-a-date", "createdAt")).toThrow(
      "createdAt must be an ISO-compatible date string"
    );
  });

  it("detects tenant-scoped records", () => {
    expect(hasTenantId(createTenant("tenant_001"))).toBe(false);
    expect(hasTenantId(createStockpile("stockpile_001", "tenant_001"))).toBe(true);
  });
});