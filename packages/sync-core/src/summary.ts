import type { SyncBatchResult } from "@iyi/sync-protocol";

export interface SyncSummary {
  readonly accepted: number;
  readonly rejected: number;
  readonly conflicts: number;
  readonly duplicates: number;
  readonly invalid: number;
  readonly pendingReview: number;
  readonly superseded: number;
  readonly total: number;
}

export function summarizeSyncBatchResult(batch: SyncBatchResult): SyncSummary {
  const summary: SyncSummary = {
    accepted: 0,
    rejected: 0,
    conflicts: 0,
    duplicates: 0,
    invalid: 0,
    pendingReview: 0,
    superseded: 0,
    total: batch.results.length
  };

  return batch.results.reduce<SyncSummary>((current, result) => {
    if (result.status === "accepted") {
      return { ...current, accepted: current.accepted + 1 };
    }

    if (result.status === "rejected") {
      return { ...current, rejected: current.rejected + 1 };
    }

    if (result.status === "conflict") {
      return { ...current, conflicts: current.conflicts + 1 };
    }

    if (result.status === "duplicate") {
      return { ...current, duplicates: current.duplicates + 1 };
    }

    if (result.status === "invalid") {
      return { ...current, invalid: current.invalid + 1 };
    }

    if (result.status === "pending_review") {
      return { ...current, pendingReview: current.pendingReview + 1 };
    }

    if (result.status === "superseded") {
      return { ...current, superseded: current.superseded + 1 };
    }

    return current;
  }, summary);
}

export function hasBlockingSyncIssues(summary: SyncSummary): boolean {
  return summary.conflicts > 0 || summary.invalid > 0 || summary.rejected > 0;
}