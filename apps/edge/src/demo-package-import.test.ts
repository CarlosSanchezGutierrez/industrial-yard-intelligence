import { beforeEach, describe, expect, it } from "vitest";
import {
  resetAuditStore,
  resetConflictResolutionStore,
  resetEdgeMemoryStore,
  resetEvidenceStore,
  routeEdgeRequest
} from "./index.js";

describe("@iyi/edge demo package import", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
    resetAuditStore();
    resetEvidenceStore();
  });

  it("imports a verified exported demo package into empty edge state", () => {
    routeEdgeRequest({
      method: "POST",
      pathname: "/admin/run-guided-demo",
      requestId: "request_guided_demo",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        resetBeforeRun: true
      }
    });

    const packageResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/admin/demo-package",
      requestId: "request_demo_package",
      now: "2026-04-28T12:00:01.000Z"
    });

    const packageBody = JSON.parse(packageResponse.body) as {
      data: {
        package: unknown;
      };
    };

    routeEdgeRequest({
      method: "POST",
      pathname: "/admin/reset-demo-state",
      requestId: "request_reset",
      now: "2026-04-28T12:00:02.000Z"
    });

    const importResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/admin/demo-package/import",
      requestId: "request_import_package",
      now: "2026-04-28T12:00:03.000Z",
      body: {
        replaceExistingStore: true,
        package: packageBody.data.package
      }
    });

    const importBody = JSON.parse(importResponse.body) as {
      ok: boolean;
      data: {
        imported: boolean;
        verification: {
          ok: boolean;
          hashValue: string;
        };
        importResult: {
          importedEvents: number;
        };
        conflictImportResult: {
          importedResolutions: number;
        };
        auditImportResult: {
          importedAuditEntries: number;
        };
        evidenceImportResult: {
          importedEvidenceItems: number;
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
      };
    };

    expect(importResponse.statusCode).toBe(200);
    expect(importBody.ok).toBe(true);
    expect(importBody.data.imported).toBe(true);
    expect(importBody.data.verification.ok).toBe(true);
    expect(importBody.data.verification.hashValue).toHaveLength(64);
    expect(importBody.data.importResult.importedEvents).toBe(2);
    expect(importBody.data.conflictImportResult.importedResolutions).toBe(0);
    expect(importBody.data.auditImportResult.importedAuditEntries).toBe(1);
    expect(importBody.data.evidenceImportResult.importedEvidenceItems).toBe(1);
    expect(importBody.data.summary.totalEvents).toBe(2);
    expect(importBody.data.summary.accepted).toBe(1);
    expect(importBody.data.summary.conflicts).toBe(1);
    expect(importBody.data.auditSummary.totalEntries).toBe(1);
    expect(importBody.data.auditSummary.chainValid).toBe(true);
    expect(importBody.data.evidenceSummary.totalEvidenceItems).toBe(1);
    expect(importBody.data.evidenceSummary.verifiedItems).toBe(1);
  });

  it("rejects tampered package import", () => {
    routeEdgeRequest({
      method: "POST",
      pathname: "/admin/run-guided-demo",
      requestId: "request_guided_demo",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        resetBeforeRun: true
      }
    });

    const packageResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/admin/demo-package",
      requestId: "request_demo_package",
      now: "2026-04-28T12:00:01.000Z"
    });

    const packageBody = JSON.parse(packageResponse.body) as {
      data: {
        package: {
          product: string;
        };
      };
    };

    const tamperedPackage = {
      ...packageBody.data.package,
      product: "Tampered Product"
    };

    const importResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/admin/demo-package/import",
      requestId: "request_import_tampered",
      now: "2026-04-28T12:00:03.000Z",
      body: {
        package: tamperedPackage
      }
    });

    const importBody = JSON.parse(importResponse.body) as {
      ok: boolean;
      error: {
        code: string;
      };
    };

    expect(importResponse.statusCode).toBe(400);
    expect(importBody.ok).toBe(false);
    expect(importBody.error.code).toBe("bad_request");
  });

  it("advertises demo package import endpoint in manifest", () => {
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
        (route) => route.method === "POST" && route.path === "/admin/demo-package/import"
      )
    ).toBe(true);
  });
});