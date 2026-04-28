import { err, ok, type ConfidenceLevel, type Result } from "@iyi/kernel";

const confidenceRank: Readonly<Record<ConfidenceLevel, number>> = {
  simulated: 0,
  approximate: 1,
  operational: 2,
  georeferenced: 3,
  centimeter_ready: 4,
  professionally_validated: 5
};

export type ConfidencePromotionError = "confidence_demotion" | "missing_validation_reason";

export function compareConfidenceLevels(current: ConfidenceLevel, next: ConfidenceLevel): number {
  return confidenceRank[next] - confidenceRank[current];
}

export function canPromoteConfidenceLevel(current: ConfidenceLevel, next: ConfidenceLevel): boolean {
  return confidenceRank[next] >= confidenceRank[current];
}

export function changeConfidenceLevel(
  current: ConfidenceLevel,
  next: ConfidenceLevel,
  reason?: string
): Result<ConfidenceLevel, ConfidencePromotionError> {
  if (!canPromoteConfidenceLevel(current, next)) {
    return err(
      "confidence_demotion",
      `Cannot demote confidence level from ${current} to ${next} without explicit correction workflow.`
    );
  }

  if (next === "professionally_validated" && (!reason || reason.trim().length === 0)) {
    return err(
      "missing_validation_reason",
      "Promoting to professionally_validated requires an explicit validation reason."
    );
  }

  return ok(next);
}