import { beforeEach, describe, expect, it } from "vitest";
import {
  resetAuditStore,
  resetConflictResolutionStore,
  resetEdgeMemoryStore,
  resetEvidenceStore,
  routeEdgeRequest
} from "./index.js";

describe("@iyi/edge demo package verification", () => {
  beforeEach(() => {
    resetEdgeMemoryStore();
    resetConflictResolutionStore();
    resetAuditStore();
    resetEvidenceStore();
  });

  it("verifies current demo package integrity after guided demo", () => {
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
      pathname: "/admin/demo-package/verify",
      requestId: "request_package_verify",
      now: "2026-04-28T12:00:01.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        verification: {
          ok: boolean;
          packageId: string;
          algorithm: string;
          hashValue: string;
          expectedHashValue: string;
          signedPayloadFields: readonly string[];
          message: string;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.verification.ok).toBe(true);
    expect(body.data.verification.packageId).toContain("demo_package_");
    expect(body.data.verification.algorithm).toBe("sha256");
    expect(body.data.verification.hashValue).toHaveLength(64);
    expect(body.data.verification.expectedHashValue).toBe(body.data.verification.hashValue);
    expect(body.data.verification.signedPayloadFields).toContain("report");
    expect(body.data.verification.signedPayloadFields).toContain("backup");
    expect(body.data.verification.message).toBe("Demo package integrity is valid.");
  });

  it("advertises package verification endpoint in manifest", () => {
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
        (route) => route.method === "GET" && route.path === "/admin/demo-package/verify"
      )
    ).toBe(true);
  });
});