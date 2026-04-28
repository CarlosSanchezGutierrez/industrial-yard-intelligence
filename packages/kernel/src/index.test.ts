import { describe, expect, it } from "vitest";
import {
  asTenantId,
  confidenceLevels,
  conflictTypes,
  measurementSourceTypes,
  validationStates
} from "./index.js";

describe("@iyi/kernel", () => {
  it("brands non-empty tenant ids", () => {
    expect(asTenantId("tenant_cooper_tsmith")).toBe("tenant_cooper_tsmith");
  });

  it("rejects empty tenant ids", () => {
    expect(() => asTenantId("")).toThrow("TenantId must be a non-empty string.");
  });

  it("exposes required validation states", () => {
    expect(validationStates).toContain("operational");
    expect(validationStates).toContain("professionally_validated");
  });

  it("exposes required measurement sources", () => {
    expect(measurementSourceTypes).toContain("gnss_rtk");
    expect(measurementSourceTypes).toContain("drone_rtk_ppk");
    expect(measurementSourceTypes).toContain("geotiff");
  });

  it("exposes required conflict types", () => {
    expect(conflictTypes).toContain("geometry_conflict");
    expect(conflictTypes).toContain("tenant_mismatch");
  });

  it("exposes required confidence levels", () => {
    expect(confidenceLevels).toContain("simulated");
    expect(confidenceLevels).toContain("professionally_validated");
  });
});
