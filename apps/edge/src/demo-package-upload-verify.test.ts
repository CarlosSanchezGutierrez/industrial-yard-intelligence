import { beforeEach, describe, expect, it } from "vitest";
import {
  resetAuditStore,
  resetConflictResolutionStore,
  resetEdgeMemoryStore,
  resetEvidenceStore,
  routeEdgeRequest
} from "./index.js";

describe("@iyi/edge uploaded demo package verification", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
    resetAuditStore();
    resetEvidenceStore();
  });

  it("verifies an exported demo package posted back to edge", () => {
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

    const verifyResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/admin/demo-package/verify",
      requestId: "request_verify_uploaded",
      now: "2026-04-28T12:00:02.000Z",
      body: {
        package: packageBody.data.package
      }
    });

    const verifyBody = JSON.parse(verifyResponse.body) as {
      ok: boolean;
      data: {
        verification: {
          ok: boolean;
          packageId: string;
          hashValue: string;
          expectedHashValue: string;
          message: string;
        };
      };
    };

    expect(verifyResponse.statusCode).toBe(200);
    expect(verifyBody.ok).toBe(true);
    expect(verifyBody.data.verification.ok).toBe(true);
    expect(verifyBody.data.verification.packageId).toContain("demo_package_");
    expect(verifyBody.data.verification.hashValue).toHaveLength(64);
    expect(verifyBody.data.verification.expectedHashValue).toBe(verifyBody.data.verification.hashValue);
    expect(verifyBody.data.verification.message).toBe("Provided demo package integrity is valid.");
  });

  it("detects tampered uploaded demo package", () => {
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
          report: {
            customer: string;
          };
        };
      };
    };

    const tamperedPackage = {
      ...packageBody.data.package,
      report: {
        ...packageBody.data.package.report,
        customer: "Tampered Customer"
      }
    };

    const verifyResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/admin/demo-package/verify",
      requestId: "request_verify_tampered",
      now: "2026-04-28T12:00:02.000Z",
      body: {
        package: tamperedPackage
      }
    });

    const verifyBody = JSON.parse(verifyResponse.body) as {
      ok: boolean;
      data: {
        verification: {
          ok: boolean;
          hashValue: string;
          expectedHashValue: string;
          message: string;
        };
      };
    };

    expect(verifyResponse.statusCode).toBe(200);
    expect(verifyBody.ok).toBe(true);
    expect(verifyBody.data.verification.ok).toBe(false);
    expect(verifyBody.data.verification.hashValue).not.toBe(verifyBody.data.verification.expectedHashValue);
    expect(verifyBody.data.verification.message).toBe(
      "Provided demo package integrity hash does not match its payload."
    );
  });

  it("rejects structurally invalid uploaded demo package", () => {
    const verifyResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/admin/demo-package/verify",
      requestId: "request_verify_invalid",
      now: "2026-04-28T12:00:02.000Z",
      body: {
        package: {
          version: 1
        }
      }
    });

    const verifyBody = JSON.parse(verifyResponse.body) as {
      ok: boolean;
      data: {
        verification: {
          ok: boolean;
          packageId: null;
          hashValue: null;
          message: string;
        };
      };
    };

    expect(verifyResponse.statusCode).toBe(200);
    expect(verifyBody.ok).toBe(true);
    expect(verifyBody.data.verification.ok).toBe(false);
    expect(verifyBody.data.verification.packageId).toBe(null);
    expect(verifyBody.data.verification.hashValue).toBe(null);
    expect(verifyBody.data.verification.message).toBe(
      "Provided demo package is invalid or missing integrity metadata."
    );
  });
});