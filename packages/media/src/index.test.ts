import { describe, expect, it } from "vitest";
import {
  createIntegrityHash,
  hasIntegrityHash,
  isLinkedToEvent,
  validateEvidenceMetadata,
  validateStorageReference,
  type EvidenceMetadata
} from "./index.js";
import {
  asDeviceId,
  asEntityId,
  asEventId,
  asEvidenceId,
  asTenantId,
  asTerminalId,
  asUserId
} from "@iyi/kernel";

describe("@iyi/media", () => {
  const baseEvidence: EvidenceMetadata = {
    evidenceId: asEvidenceId("evidence_001"),
    evidenceType: "photo",
    owner: {
      tenantId: asTenantId("tenant_cooper_tsmith"),
      terminalId: asTerminalId("terminal_altamira"),
      createdByUserId: asUserId("user_operator_001"),
      createdByDeviceId: asDeviceId("device_android_001")
    },
    storage: {
      provider: "local_filesystem",
      key: "evidence/photos/evidence_001.jpg"
    },
    createdAt: "2026-04-28T12:00:00.000Z",
    links: [
      {
        linkType: "event",
        targetId: asEventId("event_001")
      },
      {
        linkType: "entity",
        targetId: asEntityId("stockpile_001")
      }
    ],
    fileName: "stockpile-photo.jpg",
    mimeType: "image/jpeg",
    byteSize: 2048
  };

  it("validates local filesystem storage references", () => {
    const result = validateStorageReference({
      provider: "local_filesystem",
      key: "evidence/photos/example.jpg"
    });

    expect(result.ok).toBe(true);
  });

  it("rejects external references without URI", () => {
    const result = validateStorageReference({
      provider: "external_reference",
      key: "external/example"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("missing_external_uri");
    }
  });

  it("creates normalized integrity hashes", () => {
    const result = createIntegrityHash("sha256", "ABC123");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("abc123");
    }
  });

  it("rejects non-hex integrity hashes", () => {
    const result = createIntegrityHash("sha256", "not-a-hex-hash");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_hash_value");
    }
  });

  it("validates evidence metadata", () => {
    const result = validateEvidenceMetadata(baseEvidence);

    expect(result.ok).toBe(true);
  });

  it("requires evidence to be linked to at least one target", () => {
    const evidenceWithoutLinks: EvidenceMetadata = {
      ...baseEvidence,
      links: []
    };

    const result = validateEvidenceMetadata(evidenceWithoutLinks);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("evidence_requires_link");
    }
  });

  it("detects event-linked evidence", () => {
    expect(isLinkedToEvent(baseEvidence)).toBe(true);
  });

  it("detects evidence integrity hashes", () => {
    const integrityHashResult = createIntegrityHash("sha256", "abc123");

    expect(integrityHashResult.ok).toBe(true);

    if (integrityHashResult.ok) {
      const evidenceWithHash: EvidenceMetadata = {
        ...baseEvidence,
        integrityHash: integrityHashResult.value
      };

      expect(hasIntegrityHash(evidenceWithHash)).toBe(true);
    }
  });
});