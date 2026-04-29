export type StockpileLifecycleStatus =
  | "draft"
  | "operational"
  | "pending_review"
  | "validated"
  | "archived";

export const stockpileLifecycleStatuses = [
  "draft",
  "operational",
  "pending_review",
  "validated",
  "archived"
] as const satisfies readonly StockpileLifecycleStatus[];

export const stockpileLifecycleTransitions: Record<
  StockpileLifecycleStatus,
  readonly StockpileLifecycleStatus[]
> = {
  draft: ["operational", "pending_review", "validated", "archived"],
  operational: ["pending_review", "validated", "archived"],
  pending_review: ["operational", "validated", "archived"],
  validated: ["pending_review", "archived"],
  archived: []
};

export function isStockpileLifecycleStatus(value: unknown): value is StockpileLifecycleStatus {
  return (
    value === "draft" ||
    value === "operational" ||
    value === "pending_review" ||
    value === "validated" ||
    value === "archived"
  );
}

export function getAllowedStockpileStatusTransitions(
  currentStatus: StockpileLifecycleStatus
): readonly StockpileLifecycleStatus[] {
  return stockpileLifecycleTransitions[currentStatus];
}

export function canTransitionStockpileStatus(
  currentStatus: StockpileLifecycleStatus,
  nextStatus: StockpileLifecycleStatus
): boolean {
  if (currentStatus === nextStatus) {
    return true;
  }

  return stockpileLifecycleTransitions[currentStatus].includes(nextStatus);
}

export function describeStockpileStatusTransition(
  currentStatus: StockpileLifecycleStatus,
  nextStatus: StockpileLifecycleStatus
): string {
  if (canTransitionStockpileStatus(currentStatus, nextStatus)) {
    return `Stockpile status transition ${currentStatus} -> ${nextStatus} is allowed.`;
  }

  return `Stockpile status transition ${currentStatus} -> ${nextStatus} is not allowed.`;
}