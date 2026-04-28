import { describe, expect, it } from "vitest";
import {
  canTransitionValidationState,
  changeConfidenceLevel,
  getDefaultConfidenceForMeasurementSource,
  requiresProfessionalValidation,
  transitionValidationState
} from "./index.js";

describe("@iyi/domain", () => {
  it("allows operational data to move into pending review", () => {
    expect(canTransitionValidationState("operational", "pending_review")).toBe(true);
  });

  it("rejects invalid validation transitions", () => {
    const result = transitionValidationState("archived", "operational");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_validation_transition");
    }
  });

  it("allows confidence promotion with valid direction", () => {
    const result = changeConfidenceLevel("approximate", "operational");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("operational");
    }
  });

  it("rejects confidence demotion without correction workflow", () => {
    const result = changeConfidenceLevel("georeferenced", "approximate");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("confidence_demotion");
    }
  });

  it("requires reason for professionally validated confidence", () => {
    const result = changeConfidenceLevel("centimeter_ready", "professionally_validated");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("missing_validation_reason");
    }
  });

  it("maps GNSS RTK to centimeter-ready confidence by default", () => {
    expect(getDefaultConfidenceForMeasurementSource("gnss_rtk")).toBe("centimeter_ready");
  });

  it("marks RTK drone measurements as requiring professional validation workflow", () => {
    expect(requiresProfessionalValidation("drone_rtk_ppk")).toBe(true);
  });
});