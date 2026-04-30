import { describe, expect, it } from "vitest";

import { createAplomoInMemoryPersistenceAdapter } from "./aplomoPersistencePorts.js";

describe("Aplomo persistence ports", () => {
  it("creates an in-memory adapter with health and default data products", async () => {
    const adapter = createAplomoInMemoryPersistenceAdapter();

    const health = await adapter.health();
    expect(health.driver).toBe("memory");
    expect(health.status).toBe("ok");

    const dataProducts = await adapter.dataPlatform.listDataProducts({
      limit: 10,
    });

    expect(dataProducts.items.length).toBeGreaterThan(0);
  });

  it("stores and lists export jobs through the data platform repository", async () => {
    const adapter = createAplomoInMemoryPersistenceAdapter();
    const createdAt = new Date().toISOString();

    await adapter.dataPlatform.createExportJob({
      id: "export_test_1",
      companyId: "company_1",
      dataProductId: "data_product_1",
      target: "excel",
      format: "csv",
      deliveryMode: "manual_download",
      status: "queued",
      includeLineage: true,
      includeQualityMetrics: true,
      includeAiPolicy: true,
      redactSensitiveFields: true,
      createdAt,
      updatedAt: createdAt,
    });

    const jobs = await adapter.dataPlatform.listExportJobs({
      companyId: "company_1",
    });

    expect(jobs.items).toHaveLength(1);
    expect(jobs.items[0]?.id).toBe("export_test_1");
  });
});
