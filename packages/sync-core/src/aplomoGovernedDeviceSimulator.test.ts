import { describe, expect, it } from "vitest";

import {
  advanceAplomoGovernedIndustrialDemo,
  createAplomoGovernedIndustrialDemoStore,
} from "./aplomoGovernedDeviceSimulator.js";

describe("Aplomo governed device simulator", () => {
  it("creates a governed industrial demo fleet and advances telemetry", () => {
    const demo = createAplomoGovernedIndustrialDemoStore();

    expect(demo.initialState.devices.length).toBeGreaterThanOrEqual(5);
    expect(demo.initialState.governedEvents.length).toBeGreaterThan(0);
    expect(demo.telemetryContract.id).toContain("aplomo.telemetry");

    const result = advanceAplomoGovernedIndustrialDemo(demo.store, 1);

    expect(result.governedEvents.length).toBeGreaterThan(0);
    expect(result.snapshot.latestPositions.length).toBeGreaterThan(0);

    const firstEnvelope = result.governedEvents[0]?.envelope;

    expect(firstEnvelope?.governance.dataContractId).toContain(
      "gps_telemetry_event",
    );
    expect(firstEnvelope?.governance.aiUsagePolicy).toBe(
      "allowed_with_redaction",
    );
  });
});
