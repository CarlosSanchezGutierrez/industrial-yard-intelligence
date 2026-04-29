import { beforeEach, describe, expect, it } from "vitest";
import { resetAuditStore, resetEvidenceStore, routeEdgeRequest } from "./index.js";

describe("@iyi/edge evidence integration", () => {
  beforeEach(() => {
    resetEvidenceStore();
    resetAuditStore();
  });

  it("registers text evidence with sha256 integrity", () => {
    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/evidence/register",
      requestId: "request_evidence_001",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        content: JSON.stringify({
          type: "FeatureCollection",
          features: []
        }),
        evidenceKind: "geojson",
        storageKey: "evidence/geojson/empty-yard.geojson",
        fileName: "empty-yard.geojson",
        mimeType: "application/geo+json",
        relatedEntityId: "zone_001",
        relatedEventId: "event_001"
      }
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        evidence: {
          metadata: {
            evidenceKind: string;
            storageKey: string;
            integrity: {
              algorithm: string;
              hashValue: string;
              byteSize: number;
            };
            immutable: boolean;
          };
        };
        summary: {
          totalEvidenceItems: number;
          verifiedItems: number;
          failedItems: number;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.evidence.metadata.evidenceKind).toBe("geojson");
    expect(body.data.evidence.metadata.storageKey).toBe("evidence/geojson/empty-yard.geojson");
    expect(body.data.evidence.metadata.integrity.algorithm).toBe("sha256");
    expect(body.data.evidence.metadata.integrity.hashValue).toHaveLength(64);
    expect(body.data.evidence.metadata.integrity.byteSize).toBeGreaterThan(0);
    expect(body.data.evidence.metadata.immutable).toBe(true);
    expect(body.data.summary.totalEvidenceItems).toBe(1);
    expect(body.data.summary.verifiedItems).toBe(1);
    expect(body.data.summary.failedItems).toBe(0);
  });

  it("audits evidence registration with hash-chain entry", () => {
    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/evidence/register",
      requestId: "request_evidence_audit",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        content: "simulated photo bytes for audit",
        evidenceKind: "photo",
        storageKey: "evidence/photos/photo-audit-001.txt",
        fileName: "photo-audit-001.txt",
        mimeType: "text/plain"
      }
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      data: {
        auditEntry: {
          actionType: string;
          affectedEntityType: string;
          affectedEntityId: string;
          integrityHash: string;
        };
        auditSummary: {
          totalEntries: number;
          chainValid: boolean;
        };
      };
    };

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.auditEntry.actionType).toBe("EVIDENCE_REGISTERED");
    expect(body.data.auditEntry.affectedEntityType).toBe("evidence");
    expect(body.data.auditEntry.affectedEntityId).toContain("evidence_");
    expect(body.data.auditEntry.integrityHash).toHaveLength(64);
    expect(body.data.auditSummary.totalEntries).toBe(1);
    expect(body.data.auditSummary.chainValid).toBe(true);

    const auditResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/audit/summary",
      requestId: "request_audit_summary",
      now: "2026-04-28T12:00:01.000Z"
    });

    const auditBody = JSON.parse(auditResponse.body) as {
      ok: boolean;
      data: {
        summary: {
          totalEntries: number;
          chainValid: boolean;
        };
      };
    };

    expect(auditResponse.statusCode).toBe(200);
    expect(auditBody.ok).toBe(true);
    expect(auditBody.data.summary.totalEntries).toBe(1);
    expect(auditBody.data.summary.chainValid).toBe(true);
  });
  it("rejects evidence registration without content", () => {
    const response = routeEdgeRequest({
      method: "POST",
      pathname: "/evidence/register",
      requestId: "request_evidence_invalid",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        evidenceKind: "photo"
      }
    });

    const body = JSON.parse(response.body) as {
      ok: boolean;
      error: {
        code: string;
      };
    };

    expect(response.statusCode).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("bad_request");
  });

  it("serves evidence summary and verification", () => {
    routeEdgeRequest({
      method: "POST",
      pathname: "/evidence/register",
      requestId: "request_evidence_001",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        content: "simulated photo bytes",
        evidenceKind: "photo",
        storageKey: "evidence/photos/photo-001.txt"
      }
    });

    const summaryResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/evidence/summary",
      requestId: "request_evidence_summary",
      now: "2026-04-28T12:00:01.000Z"
    });

    const verifyResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/evidence/verify",
      requestId: "request_evidence_verify",
      now: "2026-04-28T12:00:02.000Z"
    });

    const summaryBody = JSON.parse(summaryResponse.body) as {
      ok: boolean;
      data: {
        summary: {
          totalEvidenceItems: number;
          verifiedItems: number;
          failedItems: number;
        };
      };
    };

    const verifyBody = JSON.parse(verifyResponse.body) as {
      ok: boolean;
      data: {
        verification: {
          ok: boolean;
          checkedItems: number;
          failedEvidenceIds: readonly string[];
        };
      };
    };

    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryBody.ok).toBe(true);
    expect(summaryBody.data.summary.totalEvidenceItems).toBe(1);
    expect(summaryBody.data.summary.verifiedItems).toBe(1);
    expect(summaryBody.data.summary.failedItems).toBe(0);

    expect(verifyResponse.statusCode).toBe(200);
    expect(verifyBody.ok).toBe(true);
    expect(verifyBody.data.verification.ok).toBe(true);
    expect(verifyBody.data.verification.checkedItems).toBe(1);
    expect(verifyBody.data.verification.failedEvidenceIds).toHaveLength(0);
  });

  it("includes evidence store in offline backup export and import", () => {
    routeEdgeRequest({
      method: "POST",
      pathname: "/evidence/register",
      requestId: "request_evidence_001",
      now: "2026-04-28T12:00:00.000Z",
      body: {
        content: "simulated RTK observation",
        evidenceKind: "rtk_observation",
        storageKey: "evidence/rtk/observation-001.txt"
      }
    });

    const exportResponse = routeEdgeRequest({
      method: "GET",
      pathname: "/sync/export",
      requestId: "request_export",
      now: "2026-04-28T12:00:03.000Z"
    });

    const exportBody = JSON.parse(exportResponse.body) as {
      ok: boolean;
      data: {
        backup: {
          evidenceStore: {
            items: readonly unknown[];
          };
        };
      };
    };

    expect(exportResponse.statusCode).toBe(200);
    expect(exportBody.ok).toBe(true);
    expect(exportBody.data.backup.evidenceStore.items).toHaveLength(1);

    resetEvidenceStore();

    const importResponse = routeEdgeRequest({
      method: "POST",
      pathname: "/sync/import",
      requestId: "request_import",
      now: "2026-04-28T12:00:04.000Z",
      body: {
        replaceExistingStore: true,
        store: exportBody.data.backup
      }
    });

    const importBody = JSON.parse(importResponse.body) as {
      ok: boolean;
      data: {
        evidenceImportResult: {
          importedEvidenceItems: number;
        };
        evidenceSummary: {
          totalEvidenceItems: number;
          verifiedItems: number;
        };
      };
    };

    expect(importResponse.statusCode).toBe(200);
    expect(importBody.ok).toBe(true);
    expect(importBody.data.evidenceImportResult.importedEvidenceItems).toBe(1);
    expect(importBody.data.evidenceSummary.totalEvidenceItems).toBe(1);
    expect(importBody.data.evidenceSummary.verifiedItems).toBe(1);
  });
});