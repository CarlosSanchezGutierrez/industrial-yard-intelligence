import { describe, expect, it } from "vitest";
import { cooperSmokeSeed } from "./index.js";

describe("@iyi/seed-data", () => {
  it("marks Cooper smoke seed as simulated data", () => {
    expect(cooperSmokeSeed.classification).toBe("SIMULATED_DATA");
  });

  it("contains stockpiles outside the web app", () => {
    expect(cooperSmokeSeed.stockpiles.length).toBeGreaterThan(0);
  });

  it("contains named Cooper equipment", () => {
    const names = cooperSmokeSeed.equipment.map((equipment) => equipment.name);

    expect(names).toContain("Arthur");
    expect(names).toContain("Sharon");
    expect(names).toContain("MR2");
  });

  it("contains explicit simulation warnings", () => {
    expect(cooperSmokeSeed.alerts.some((alert) => alert.includes("representativos"))).toBe(true);
  });
});