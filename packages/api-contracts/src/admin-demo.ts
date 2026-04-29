export type DemoReadinessStatus = "ready" | "attention" | "empty";

export type DemoExecutiveReportStatus =
  | "ready_for_demo"
  | "needs_attention"
  | "empty_demo_state";

export interface DemoReadinessCheckContract {
  readonly id: string;
  readonly label: string;
  readonly ok: boolean;
  readonly detail: string;
}

export interface DemoReadinessReportContract {
  readonly status: DemoReadinessStatus;
  readonly generatedAt: string;
  readonly hasOperationalData: boolean;
  readonly pendingConflictCount: number;
  readonly syncSummary: unknown;
  readonly auditSummary: unknown;
  readonly evidenceSummary: unknown;
  readonly checks: readonly DemoReadinessCheckContract[];
}

export interface DemoReportMetricContract {
  readonly label: string;
  readonly value: number;
  readonly detail: string;
}

export interface DemoReportProofPointContract {
  readonly label: string;
  readonly detail: string;
}

export interface DemoExecutiveReportContract {
  readonly reportId: string;
  readonly title: string;
  readonly customer: string;
  readonly generatedAt: string;
  readonly status: DemoExecutiveReportStatus;
  readonly summary: readonly string[];
  readonly metrics: readonly DemoReportMetricContract[];
  readonly proofPoints: readonly DemoReportProofPointContract[];
  readonly demoScript: readonly string[];
  readonly recommendedNextSteps: readonly string[];
  readonly readiness: DemoReadinessReportContract;
}

export interface DemoPackageContentsContract {
  readonly executiveReport: boolean;
  readonly offlineBackup: boolean;
  readonly syncStore: boolean;
  readonly conflictResolutions: boolean;
  readonly auditStore: boolean;
  readonly evidenceStore: boolean;
}

export interface DemoPackageContract {
  readonly version: 1;
  readonly packageId: string;
  readonly customer: string;
  readonly product: string;
  readonly exportedAt: string;
  readonly contents: DemoPackageContentsContract;
  readonly report: DemoExecutiveReportContract;
  readonly backup: unknown;
}

export interface GuidedDemoResultContract {
  readonly resetBeforeRun: boolean;
  readonly firstSyncStatus: string;
  readonly secondSyncStatus: string;
  readonly evidenceId: string;
  readonly evidenceHash: string;
  readonly auditHash: string;
}

export interface ResetDemoStateContract {
  readonly reset: true;
  readonly message: string;
  readonly summary: unknown;
  readonly resolutions: readonly unknown[];
  readonly auditSummary: unknown;
  readonly evidenceSummary: unknown;
}

export function isDemoReadinessStatus(value: string): value is DemoReadinessStatus {
  return value === "ready" || value === "attention" || value === "empty";
}

export function isDemoExecutiveReportStatus(value: string): value is DemoExecutiveReportStatus {
  return value === "ready_for_demo" || value === "needs_attention" || value === "empty_demo_state";
}

export function getDemoReadinessRank(status: DemoReadinessStatus): number {
  if (status === "ready") {
    return 3;
  }

  if (status === "attention") {
    return 2;
  }

  return 1;
}

export function getDemoReportStatusFromReadiness(
  readinessStatus: DemoReadinessStatus
): DemoExecutiveReportStatus {
  if (readinessStatus === "ready") {
    return "ready_for_demo";
  }

  if (readinessStatus === "attention") {
    return "needs_attention";
  }

  return "empty_demo_state";
}