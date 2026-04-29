import { beforeEach, describe, expect, it } from "vitest";
import {
  resetAuditStore,
  resetConflictResolutionStore,
  resetEdgeMemoryStore,
  resetEvidenceStore,
  routeEdgeRequest
} from "./index.js";

describe("@iyi/edge demo readiness", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
    resetAuditStore();
    resetEvidenceStore();
  });

  it("returns empty readiness report after reset", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/admin/demo-readiness",
      requestId: "request_readiness_empty",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        readiness: {
          status: string;
          hasOperationalData: boolean;
          pendingConflictCount: number;
          checks: readonly {
            id: string;
            ok: boolean;
          }[];
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.readiness.status).toBe("empty");
    expect(body.data.readiness.hasOperationalData).toBe(false);
    expect(body.data.readiness.pendingConflictCount).toBe(0);
    expect(body.data.readiness.checks.some((check) => check.id === "edge_online" && check.ok)).toBe(true);
  });

  it("returns readiness report with evidence and audit state", () => {
    routeEdgeRequest({
      method: "POST",
      pathname: "/evidence/register",
      requestId: "request_evidence",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        content: "demo readiness evidence",
        evidenceKind: "document",
        storageKey: "evidence/documents/readiness.txt"
      }
    });

    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/admin/demo-readiness",
      requestId: "request_readiness",
      now: "2026-04-28T12:00:01.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        readiness: {
          status: string;
          hasOperationalData: boolean;
          evidenceSummary: {
            totalEvidenceItems: number;
            verifiedItems: number;
          };
          auditSummary: {
            totalEntries: number;
            chainValid: boolean;
          };
          checks: readonly {
            id: string;
            ok: boolean;
          }[];
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.readiness.hasOperationalData).toBe(true);
    expect(body.data.readiness.evidenceSummary.totalEvidenceItems).toBe(1);
    expect(body.data.readiness.evidenceSummary.verifiedItems).toBe(1);
    expect(body.data.readiness.auditSummary.totalEntries).toBe(1);
    expect(body.data.readiness.auditSummary.chainValid).toBe(true);
    expect(body.data.readiness.checks.some((check) => check.id === "evidence_integrity" && check.ok)).toBe(true);
    expect(body.data.readiness.checks.some((check) => check.id === "audit_chain" && check.ok)).toBe(true);
  });

  it("advertises demo readiness endpoint in manifest", () => {
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
        (route) => route.method === "GET" && route.path === "/admin/demo-readiness"
      )
    ).toBe(true);
  });
});