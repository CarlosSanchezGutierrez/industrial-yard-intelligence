import { describe, expect, it } from "vitest";
import {
  cloudApiRouteDefinitions,
  isCloudApiRoutePath,
  type CloudApiHealthPayloadContract,
  type CloudApiSystemOverviewPayloadContract
} from "./index.js";

describe("@iyi/api-contracts cloud API", () => {
  it("defines stable cloud API routes", () => {
    expect(cloudApiRouteDefinitions.some((route) => route.path === "/health")).toBe(true);
    expect(cloudApiRouteDefinitions.some((route) => route.path === "/tenants")).toBe(true);
    expect(cloudApiRouteDefinitions.some((route) => route.path === "/stockpiles")).toBe(true);
    expect(cloudApiRouteDefinitions.some((route) => route.path === "/system/overview")).toBe(true);
    expect(cloudApiRouteDefinitions.some((route) => route.path === "/admin/db/snapshot")).toBe(true);
    expect(cloudApiRouteDefinitions.some((route) => route.path === "/admin/db/reset")).toBe(true);
  });

  it("recognizes cloud API route paths", () => {
    expect(isCloudApiRoutePath("/health")).toBe(true);
    expect(isCloudApiRoutePath("/system/overview")).toBe(true);
    expect(isCloudApiRoutePath("/unknown")).toBe(false);
  });

  it("types health payload", () => {
    const payload: CloudApiHealthPayloadContract = {
      status: "ok",
      service: "@iyi/api",
      dbSchemaVersion: "2026_04_28_0001_core_schema",
      repositoryMode: "json_file"
    };

    expect(payload.status).toBe("ok");
    expect(payload.repositoryMode).toBe("json_file");
  });

  it("types system overview payload", () => {
    const payload: CloudApiSystemOverviewPayloadContract = {
      tenantCount: 1,
      terminalCount: 1,
      userCount: 3,
      deviceCount: 3,
      stockpileCount: 2,
      syncEventCount: 0,
      auditEntryCount: 0,
      evidenceItemCount: 0
    };

    expect(payload.tenantCount).toBe(1);
    expect(payload.stockpileCount).toBe(2);
  });
});