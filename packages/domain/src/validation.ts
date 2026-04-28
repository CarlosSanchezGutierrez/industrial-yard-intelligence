import { err, ok, type Result, type ValidationState } from "@iyi/kernel";

const allowedTransitions: Readonly<Record<ValidationState, readonly ValidationState[]>> = {
  draft: ["operational", "pending_review", "rejected", "archived"],
  operational: ["pending_review", "validated", "corrected", "rejected", "archived"],
  pending_review: ["validated", "corrected", "rejected", "operational"],
  validated: ["corrected", "superseded", "archived"],
  corrected: ["pending_review", "validated", "superseded", "archived"],
  rejected: ["draft", "archived"],
  superseded: ["archived"],
  archived: []
};

export type ValidationTransitionError = "invalid_validation_transition";

export function canTransitionValidationState(from: ValidationState, to: ValidationState): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionValidationState(
  from: ValidationState,
  to: ValidationState
): Result<ValidationState, ValidationTransitionError> {
  if (canTransitionValidationState(from, to)) {
    return ok(to);
  }

  return err(
    "invalid_validation_transition",
    `Cannot transition validation state from ${from} to ${to}.`
  );
}