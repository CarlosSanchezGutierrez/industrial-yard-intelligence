import { beforeEach, describe, expect, it } from "vitest";
import {
  resetAuditStore,
  resetConflictResolutionStore,
  resetEdgeMemoryStore,
  resetEvidenceStore,
  routeEdgeRequest
} from "./index.js";

describe("@iyi/edge demo reset", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
    resetAuditStore();
    resetEvidenceStore();
  });

  it("resets local demo state", () => {
    routeEdgeRequest({
      method: "POST",
      pathname: "/evidence/register",
      requestId: "request_evidence",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        content: "demo evidence before reset",
        evidenceKind: "document",
        storageKey: "evidence/documents/before-reset.txt"
      }
    });

    const beforeResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/evidence/summary",
      requestId: "request_before",
      now: "2026-04-28T12:00:01.000Z"
    });

    const beforeBody = JSON.parse(beforeResponse.body) as {
      data: {
        summary: {
          totalEvidenceItems: number;
        };
      };
    };

    expect(beforeBody.data.summary.totalEvidenceItems).toBe(1);

    const resetResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/admin/reset-demo-state",
      requestId: "request_reset",
      now: "2026-04-28T12:00:02.000Z"
    });

    const resetBody = JSON.parse(resetResponse.body) as {
      ok: boolean;
      data: {
        reset: boolean;
        summary: {
          totalEvents: number;
        };
        auditSummary: {
          totalEntries: number;
        };
        evidenceSummary: {
          totalEvidenceItems: number;
        };
        resolutions: readonly unknown[];
      };
    };

    expect(resetResponse.statusCode).toBe(200);
    expect(resetBody.ok).toBe(true);
    expect(resetBody.data.reset).toBe(true);
    expect(resetBody.data.summary.totalEvents).toBe(0);
    expect(resetBody.data.auditSummary.totalEntries).toBe(0);
    expect(resetBody.data.evidenceSummary.totalEvidenceItems).toBe(0);
    expect(resetBody.data.resolutions).toHaveLength(0);
  });

  it("advertises reset endpoint in manifest", () => {
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
        (route) => route.method === "POST" && route.path === "/admin/reset-demo-state"
      )
    ).toBe(true);
  });
});