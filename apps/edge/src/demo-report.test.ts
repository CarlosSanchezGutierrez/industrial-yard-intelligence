import { beforeEach, describe, expect, it } from "vitest";
import {
  resetAuditStore,
  resetConflictResolutionStore,
  resetEdgeMemoryStore,
  resetEvidenceStore,
  routeEdgeRequest
} from "./index.js";

describe("@iyi/edge demo executive report", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
    resetAuditStore();
    resetEvidenceStore();
  });

  it("returns empty executive report before demo data exists", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/admin/demo-report",
      requestId: "request_demo_report_empty",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        report: {
          status: string;
          customer: string;
          metrics: readonly unknown[];
          readiness: {
            status: string;
            hasOperationalData: boolean;
          };
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.report.customer).toBe("Cooper/T. Smith");
    expect(body.data.report.status).toBe("empty_demo_state");
    expect(body.data.report.readiness.status).toBe("empty");
    expect(body.data.report.readiness.hasOperationalData).toBe(false);
    expect(body.data.report.metrics.length).toBeGreaterThan(0);
  });

  it("returns executive report after guided demo", () => {
    routeEdgeRequest({
      method: "POST",
      pathname: "/admin/run-guided-demo",
      requestId: "request_guided_demo",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        resetBeforeRun: true
      }
    });

    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/admin/demo-report",
      requestId: "request_demo_report",
      now: "2026-04-28T12:00:01.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        report: {
          reportId: string;
          title: string;
          customer: string;
          status: string;
          summary: readonly string[];
          metrics: readonly {
            label: string;
            value: number;
            detail: string;
          }[];
          proofPoints: readonly unknown[];
          demoScript: readonly string[];
          recommendedNextSteps: readonly string[];
          readiness: {
            hasOperationalData: boolean;
          };
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.report.reportId).toContain("demo_report_");
    expect(body.data.report.title).toContain("Industrial Yard Intelligence");
    expect(body.data.report.customer).toBe("Cooper/T. Smith");
    expect(body.data.report.status).not.toBe("empty_demo_state");
    expect(body.data.report.summary.length).toBeGreaterThan(0);
    expect(body.data.report.metrics.some((metric) => metric.label === "Sync events" && metric.value === 2)).toBe(true);
    expect(body.data.report.metrics.some((metric) => metric.label === "Evidence items" && metric.value === 1)).toBe(true);
    expect(body.data.report.proofPoints.length).toBeGreaterThan(0);
    expect(body.data.report.demoScript.length).toBeGreaterThan(0);
    expect(body.data.report.recommendedNextSteps.length).toBeGreaterThan(0);
    expect(body.data.report.readiness.hasOperationalData).toBe(true);
  });

  it("advertises executive report endpoint in manifest", () => {
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
        (route) => route.method === "GET" && route.path === "/admin/demo-report"
      )
    ).toBe(true);
  });
});