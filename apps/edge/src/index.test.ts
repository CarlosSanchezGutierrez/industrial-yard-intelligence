import { describe, expect, it } from "vitest";
import { routeEdgeRequest } from "./index.js";

describe("@iyi/edge", () => {
  it("returns health responses", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/health",
      requestId: "request_001",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        service: string;
        status: string;
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.service).toBe("edge");
    expect(body.data.status).toBe("ok");
  });

  it("returns Cooper smoke seed data", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/seed/cooper-smoke",
      requestId: "request_001",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        seed: {
          tenantName: string;
          classification: string;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.seed.tenantName).toBe("Cooper/T. Smith");
    expect(body.data.seed.classification).toBe("SIMULATED_DATA");
  });

  it("returns not found for unknown routes", () => {
    const response = routeEdgeRequest({
      method: "GET",
      pathname: "/unknown",
      requestId: "request_001",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      error: {
        code: string;
      };
    };

    expect(response.statusCode).toBe(404);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("not_found");
  });

  it("rejects unsupported methods", () => {
    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/health",
      requestId: "request_001",
      now: "2026-04-28T12:00:00.000Z"
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      error: {
        code: string;
      };
    };

    expect(response.statusCode).toBe(405);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("bad_request");
  });
});