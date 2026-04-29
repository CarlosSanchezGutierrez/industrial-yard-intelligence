import { describe, expect, it } from "vitest";
import {
  assertEvidenceStorageKey,
  computeEvidenceIntegrity,
  createEvidenceMetadata,
  createTextEvidenceMetadata,
  verifyEvidenceIntegrity
} from "./index.js";
import {
  asDeviceId,
  asEntityId,
  asEventId,
  asTenantId,
  asTerminalId,
  asUserId
} from "@iyi/kernel";

describe("@iyi/media evidence integrity", () => {
  it("computes deterministic sha256 integrity for text evidence", () => {
    const first = computeEvidenceIntegrity({
      bytes: "sample evidence payload"
    });

    const second = computeEvidenceIntegrity({
      bytes: "sample evidence payload"
    });

    expect(first.algorithm).toBe("sha256");
    expect(first.hashValue).toBe(second.hashValue);
    expect(first.hashValue).toHaveLength(64);
    expect(first.byteSize).toBe(Buffer.from("sample evidence payload", "utf8").byteLength);
  });

  it("detects tampered evidence bytes", () => {
    const integrity = computeEvidenceIntegrity({
      bytes: "original evidence"
    });

    expect(verifyEvidenceIntegrity("original evidence", integrity)).toBe(true);
    expect(verifyEvidenceIntegrity("tampered evidence", integrity)).toBe(false);
  });

  it("creates immutable evidence metadata", () => {
    const integrity = computeEvidenceIntegrity({
      bytes: "geojson evidence"
    });

    const metadata = createEvidenceMetadata(
      {
        tenantId: asTenantId("tenant_cooper_tsmith"),
        terminalId: asTerminalId("terminal_altamira"),
        evidenceId: asEntityId("evidence_geojson_001"),
        evidenceKind: "geojson",
        storageProvider: "edge_filesystem",
        storageKey: "evidence/geojson/yard-zone-001.geojson",
        fileName: "yard-zone-001.geojson",
        mimeType: "application/geo+json",
        relatedEntityId: asEntityId("zone_001"),
        relatedEventId: asEventId("event_001"),
        ownerUserId: asUserId("user_operator_001"),
        ownerDeviceId: asDeviceId("device_android_001"),
        sourceRuntime: "mobile",
        createdAt: "2026-04-28T12:00:00.000Z"
      },
      integrity
    );

    expect(metadata.immutable).toBe(true);
    expect(metadata.integrity.hashValue).toBe(integrity.hashValue);
    expect(metadata.evidenceKind).toBe("geojson");
    expect(metadata.storageProvider).toBe("edge_filesystem");
  });

  it("creates text evidence metadata in one step", () => {
    const metadata = createTextEvidenceMetadata({
      content: JSON.stringify({
        type: "FeatureCollection",
        features: []
      }),
      metadata: {
        tenantId: asTenantId("tenant_cooper_tsmith"),
        terminalId: asTerminalId("terminal_altamira"),
        evidenceId: asEntityId("evidence_geojson_002"),
        evidenceKind: "geojson",
        storageProvider: "edge_filesystem",
        storageKey: "evidence/geojson/empty.geojson",
        ownerUserId: asUserId("user_operator_001"),
        ownerDeviceId: asDeviceId("device_android_001"),
        sourceRuntime: "mobile",
        createdAt: "2026-04-28T12:00:00.000Z"
      }
    });

    expect(metadata.integrity.algorithm).toBe("sha256");
    expect(metadata.integrity.hashValue).toHaveLength(64);
    expect(metadata.immutable).toBe(true);
  });

  it("accepts safe storage keys", () => {
    expect(assertEvidenceStorageKey("evidence/photos/photo-001.jpg")).toBe(
      "evidence/photos/photo-001.jpg"
    );
  });

  it("rejects empty storage keys", () => {
    expect(() => assertEvidenceStorageKey("   ")).toThrow("Evidence storage key must not be empty.");
  });

  it("rejects path traversal storage keys", () => {
    expect(() => assertEvidenceStorageKey("../secrets.txt")).toThrow(
      "Evidence storage key must not contain path traversal."
    );
  });
});