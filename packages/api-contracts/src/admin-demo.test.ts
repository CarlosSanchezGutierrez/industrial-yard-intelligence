import { describe, expect, it } from "vitest";
import {
  getDemoReadinessRank,
  getDemoReportStatusFromReadiness,
  isDemoExecutiveReportStatus,
  isDemoReadinessStatus,
  type DemoExecutiveReportContract,
  type DemoPackageContract,
  type DemoReadinessReportContract
} from "./index.js";

function createReadiness(status: DemoReadinessReportContract["status"]): DemoReadinessReportContract {
  return {
    status,
    generatedAt: "2026-04-28T12:00:00.000Z",
    hasOperationalData: status !== "empty",
    pendingConflictCount: status === "attention" ? 1 : 0,
    syncSummary: {
      totalEvents: status === "empty" ? 0 : 2
    },
    auditSummary: {
      totalEntries: status === "empty" ? 0 : 1
    },
    evidenceSummary: {
      totalEvidenceItems: status === "empty" ? 0 : 1
    },
    checks: [
      {
        id: "edge_online",
        label: "Edge local online",
        ok: true,
        detail: "Edge server responded locally."
      }
    ]
  };
}

describe("@iyi/api-contracts admin demo", () => {
  it("recognizes demo readiness statuses", () => {
    expect(isDemoReadinessStatus("ready")).toBe(true);
    expect(isDemoReadinessStatus("attention")).toBe(true);
    expect(isDemoReadinessStatus("empty")).toBe(true);
    expect(isDemoReadinessStatus("unknown")).toBe(false);
  });

  it("recognizes executive report statuses", () => {
    expect(isDemoExecutiveReportStatus("ready_for_demo")).toBe(true);
    expect(isDemoExecutiveReportStatus("needs_attention")).toBe(true);
    expect(isDemoExecutiveReportStatus("empty_demo_state")).toBe(true);
    expect(isDemoExecutiveReportStatus("ready")).toBe(false);
  });

  it("maps readiness statuses to executive report statuses", () => {
    expect(getDemoReportStatusFromReadiness("ready")).toBe("ready_for_demo");
    expect(getDemoReportStatusFromReadiness("attention")).toBe("needs_attention");
    expect(getDemoReportStatusFromReadiness("empty")).toBe("empty_demo_state");
  });

  it("ranks readiness statuses", () => {
    expect(getDemoReadinessRank("ready")).toBeGreaterThan(getDemoReadinessRank("attention"));
    expect(getDemoReadinessRank("attention")).toBeGreaterThan(getDemoReadinessRank("empty"));
  });

  it("types an executive report contract", () => {
    const readiness = createReadiness("ready");

    const report: DemoExecutiveReportContract = {
      reportId: "demo_report_001",
      title: "Industrial Yard Intelligence - Cooper/T. Smith Demo Report",
      customer: "Cooper/T. Smith",
      generatedAt: "2026-04-28T12:00:00.000Z",
      status: getDemoReportStatusFromReadiness(readiness.status),
      summary: ["Local-first edge demo."],
      metrics: [
        {
          label: "Sync events",
          value: 2,
          detail: "1 accepted, 1 conflict."
        }
      ],
      proofPoints: [
        {
          label: "Evidence integrity",
          detail: "Evidence receives SHA-256 metadata."
        }
      ],
      demoScript: ["Reset demo state.", "Run guided demo scenario."],
      recommendedNextSteps: ["Connect real mobile capture flow."],
      readiness
    };

    expect(report.status).toBe("ready_for_demo");
    expect(report.metrics[0]?.value).toBe(2);
  });

  it("types a demo package contract", () => {
    const readiness = createReadiness("attention");

    const report: DemoExecutiveReportContract = {
      reportId: "demo_report_002",
      title: "Industrial Yard Intelligence - Cooper/T. Smith Demo Report",
      customer: "Cooper/T. Smith",
      generatedAt: "2026-04-28T12:00:00.000Z",
      status: getDemoReportStatusFromReadiness(readiness.status),
      summary: ["Demo has pending conflicts."],
      metrics: [],
      proofPoints: [],
      demoScript: [],
      recommendedNextSteps: [],
      readiness
    };

    const demoPackage: DemoPackageContract = {
      version: 1,
      packageId: "demo_package_002",
      customer: "Cooper/T. Smith",
      product: "Industrial Yard Intelligence",
      exportedAt: "2026-04-28T12:00:00.000Z",
      contents: {
        executiveReport: true,
        offlineBackup: true,
        syncStore: true,
        conflictResolutions: true,
        auditStore: true,
        evidenceStore: true
      },
      integrity: {
        algorithm: "sha256",
        hashValue: "a".repeat(64),
        signedPayloadFields: ["version", "packageId", "customer", "product", "exportedAt", "contents", "report", "backup"]
      },
      report,
      backup: {
        syncStore: {
          events: []
        }
      }
    };

    expect(demoPackage.report.status).toBe("needs_attention");
    expect(demoPackage.contents.evidenceStore).toBe(true);
    expect(demoPackage.integrity.algorithm).toBe("sha256");
    expect(demoPackage.integrity.hashValue).toHaveLength(64);
  });
});