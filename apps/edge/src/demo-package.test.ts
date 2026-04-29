import { beforeEach, describe, expect, it } from "vitest";
import {
  resetAuditStore,
  resetConflictResolutionStore,
  resetEdgeMemoryStore,
  resetEvidenceStore,
  routeEdgeRequest
} from "./index.js";

describe("@iyi/edge demo package", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
    resetAuditStore();
    resetEvidenceStore();
  });

  it("exports package with report and full backup after guided demo", () => {
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
      pathname: "/admin/demo-package",
      requestId: "request_demo_package",
      now: "2026-04-28T12:00:01.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        package: {
          version: number;
          packageId: string;
          customer: string;
          product: string;
          integrity: {
            algorithm: string;
            hashValue: string;
            signedPayloadFields: readonly string[];
          };
          contents: {
            executiveReport: boolean;
            offlineBackup: boolean;
            syncStore: boolean;
            conflictResolutions: boolean;
            auditStore: boolean;
            evidenceStore: boolean;
          };
          report: {
            status: string;
            metrics: readonly {
              label: string;
              value: number;
            }[];
          };
          backup: {
            syncStore: {
              events: readonly unknown[];
            };
            conflictResolutions: {
              resolutions: readonly unknown[];
            };
            auditStore: {
              entries: readonly unknown[];
            };
            evidenceStore: {
              items: readonly unknown[];
            };
          };
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.package.version).toBe(1);
    expect(body.data.package.packageId).toContain("demo_package_");
    expect(body.data.package.customer).toBe("Cooper/T. Smith");
    expect(body.data.package.product).toBe("Industrial Yard Intelligence");
    expect(body.data.package.integrity.algorithm).toBe("sha256");
    expect(body.data.package.integrity.hashValue).toHaveLength(64);
    expect(body.data.package.integrity.signedPayloadFields).toContain("report");
    expect(body.data.package.integrity.signedPayloadFields).toContain("backup");
    expect(body.data.package.contents.executiveReport).toBe(true);
    expect(body.data.package.contents.offlineBackup).toBe(true);
    expect(body.data.package.contents.syncStore).toBe(true);
    expect(body.data.package.contents.conflictResolutions).toBe(true);
    expect(body.data.package.contents.auditStore).toBe(true);
    expect(body.data.package.contents.evidenceStore).toBe(true);
    expect(body.data.package.report.status).not.toBe("empty_demo_state");
    expect(body.data.package.report.metrics.some((metric) => metric.label === "Sync events" && metric.value === 2)).toBe(true);
    expect(body.data.package.backup.syncStore.events).toHaveLength(2);
    expect(body.data.package.backup.auditStore.entries).toHaveLength(1);
    expect(body.data.package.backup.evidenceStore.items).toHaveLength(1);
  });

  it("exports empty package before demo data exists", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/admin/demo-package",
      requestId: "request_demo_package_empty",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        package: {
          report: {
            status: string;
          };
          backup: {
            syncStore: {
              events: readonly unknown[];
            };
            auditStore: {
              entries: readonly unknown[];
            };
            evidenceStore: {
              items: readonly unknown[];
            };
          };
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.package.report.status).toBe("empty_demo_state");
    expect(body.data.package.backup.syncStore.events).toHaveLength(0);
    expect(body.data.package.backup.auditStore.entries).toHaveLength(0);
    expect(body.data.package.backup.evidenceStore.items).toHaveLength(0);
  });

  it("advertises demo package endpoint in manifest", () => {
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
        (route) => route.method === "GET" && route.path === "/admin/demo-package"
      )
    ).toBe(true);
  });
});