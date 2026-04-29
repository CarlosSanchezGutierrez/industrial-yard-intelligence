import { beforeEach, describe, expect, it } from "vitest";
import {
  resetAuditStore,
  resetConflictResolutionStore,
  resetEdgeMemoryStore,
  resetEvidenceStore,
  routeEdgeRequest
} from "./index.js";

describe("@iyi/edge guided demo", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
    resetAuditStore();
    resetEvidenceStore();
  });

  it("runs a deterministic guided demo scenario", () => {
    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/admin/run-guided-demo",
      requestId: "request_guided_demo",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        resetBeforeRun: true
      }
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        guidedDemo: {
          resetBeforeRun: boolean;
          firstSyncStatus: string;
          secondSyncStatus: string;
          evidenceHash: string;
          auditHash: string;
        };
        summary: {
          totalEvents: number;
          accepted: number;
          conflicts: number;
        };
        auditSummary: {
          totalEntries: number;
          chainValid: boolean;
        };
        evidenceSummary: {
          totalEvidenceItems: number;
          verifiedItems: number;
        };
        readiness: {
          status: string;
          hasOperationalData: boolean;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.guidedDemo.resetBeforeRun).toBe(true);
    expect(body.data.guidedDemo.firstSyncStatus).toBe("accepted");
    expect(body.data.guidedDemo.secondSyncStatus).toBe("conflict");
    expect(body.data.guidedDemo.evidenceHash).toHaveLength(64);
    expect(body.data.guidedDemo.auditHash).toHaveLength(64);
    expect(body.data.summary.totalEvents).toBe(2);
    expect(body.data.summary.accepted).toBe(1);
    expect(body.data.summary.conflicts).toBe(1);
    expect(body.data.auditSummary.totalEntries).toBe(1);
    expect(body.data.auditSummary.chainValid).toBe(true);
    expect(body.data.evidenceSummary.totalEvidenceItems).toBe(1);
    expect(body.data.evidenceSummary.verifiedItems).toBe(1);
    expect(body.data.readiness.hasOperationalData).toBe(true);
  });

  it("advertises guided demo endpoint in manifest", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/",
      requestId: "request_manifest",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        routes: readonly {
          method: string;
          path: string;
        }[];
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(
      body.data.routes.some(
        (route) => route.method === "POST" && route.path === "/admin/run-guided-demo"
      )
    ).toBe(true);
  });
});