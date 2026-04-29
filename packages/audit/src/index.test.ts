import { describe, expect, it } from "vitest";
import {
  appendAuditEntry,
  canonicalizeJson,
  createAuditEntry,
  verifyAuditChain,
  verifyAuditEntry,
  type AuditEntryInput
} from "./index.js";
import {
  asDeviceId,
  asEntityId,
  asEventId,
  asTenantId,
  asTerminalId,
  asUserId
} from "@iyi/kernel";

function createInput(sequence: number): AuditEntryInput {
  return {
    tenantId: asTenantId("tenant_cooper_tsmith"),
    terminalId: asTerminalId("terminal_altamira"),
    auditEventId: asEventId(`audit_event_${sequence}`),
    actionType: "SYNC_CONFLICT_REVIEWED",
    affectedEntityId: asEntityId(`event_${sequence}`),
    affectedEntityType: "sync_event",
    previousValue: null,
    newValue: {
      status: "reviewed",
      sequence
    },
    result: "success",
    sourceRuntime: "edge",
    userId: asUserId("user_supervisor_demo"),
    deviceId: asDeviceId("device_web_supervisor"),
    syncEventId: asEventId(`sync_event_${sequence}`),
    createdAt: `2026-04-28T12:00:0${sequence}.000Z`
  };
}

describe("@iyi/audit", () => {
  it("canonicalizes object keys deterministically", () => {
    const first = canonicalizeJson({
      b: 2,
      a: 1,
      nested: {
        y: true,
        x: false
      }
    });

    const second = canonicalizeJson({
      nested: {
        x: false,
        y: true
      },
      a: 1,
      b: 2
    });

    expect(first).toBe(second);
  });

  it("creates verifiable audit entries", () => {
    const entry = createAuditEntry(createInput(1), null);

    expect(entry.previousHash).toBe(null);
    expect(entry.hashAlgorithm).toBe("sha256");
    expect(entry.integrityHash).toHaveLength(64);
    expect(verifyAuditEntry(entry)).toBe(true);
  });

  it("builds a valid hash chain", () => {
    const first = createAuditEntry(createInput(1), null);
    const second = createAuditEntry(createInput(2), first.integrityHash);
    const third = createAuditEntry(createInput(3), second.integrityHash);

    const verification = verifyAuditChain([first, second, third]);

    expect(verification.ok).toBe(true);
    expect(verification.checkedEntries).toBe(3);
  });

  it("detects payload tampering", () => {
    const entry = createAuditEntry(createInput(1), null);
    const tampered = {
      ...entry,
      newValue: {
        status: "tampered"
      }
    };

    expect(verifyAuditEntry(tampered)).toBe(false);

    const verification = verifyAuditChain([tampered]);

    expect(verification.ok).toBe(false);
    expect(verification.failedAtIndex).toBe(0);
  });

  it("detects broken previous hash links", () => {
    const first = createAuditEntry(createInput(1), null);
    const second = createAuditEntry(createInput(2), "bad_previous_hash");

    const verification = verifyAuditChain([first, second]);

    expect(verification.ok).toBe(false);
    expect(verification.failedAtIndex).toBe(1);
  });

  it("appends entries using the previous integrity hash", () => {
    const firstChain = appendAuditEntry([], createInput(1));
    const secondChain = appendAuditEntry(firstChain, createInput(2));

    expect(secondChain).toHaveLength(2);
    expect(secondChain[1]?.previousHash).toBe(secondChain[0]?.integrityHash);
    expect(verifyAuditChain(secondChain).ok).toBe(true);
  });
});