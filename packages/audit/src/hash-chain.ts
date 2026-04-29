import { createHash } from "node:crypto";
import type {
  DeviceId,
  EntityId,
  EventId,
  SourceRuntime,
  TenantId,
  TerminalId,
  UserId
} from "@iyi/kernel";
import { canonicalizeJson, type CanonicalJsonValue } from "./canonical-json.js";

export const auditHashAlgorithm = "sha256" as const;

export type AuditHashAlgorithm = typeof auditHashAlgorithm;

export type AuditActionResult = "success" | "failure" | "conflict";

export interface AuditHashInput {
  readonly previousHash: string | null;
  readonly payload: CanonicalJsonValue;
}

export interface AuditEntryInput {
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
  readonly auditEventId: EventId;
  readonly actionType: string;
  readonly affectedEntityId: EntityId;
  readonly affectedEntityType: string;
  readonly previousValue: CanonicalJsonValue | null;
  readonly newValue: CanonicalJsonValue;
  readonly result: AuditActionResult;
  readonly sourceRuntime: SourceRuntime;
  readonly userId: UserId;
  readonly deviceId: DeviceId;
  readonly syncEventId?: EventId;
  readonly createdAt: string;
}

export interface AuditEntry extends AuditEntryInput {
  readonly hashAlgorithm: AuditHashAlgorithm;
  readonly previousHash: string | null;
  readonly integrityHash: string;
}

export interface AuditChainVerificationResult {
  readonly ok: boolean;
  readonly checkedEntries: number;
  readonly failedAtIndex?: number;
  readonly message: string;
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function createAuditPayload(input: AuditEntryInput): CanonicalJsonValue {
  return {
    tenantId: String(input.tenantId),
    terminalId: input.terminalId !== undefined ? String(input.terminalId) : null,
    auditEventId: String(input.auditEventId),
    actionType: input.actionType,
    affectedEntityId: String(input.affectedEntityId),
    affectedEntityType: input.affectedEntityType,
    previousValue: input.previousValue,
    newValue: input.newValue,
    result: input.result,
    sourceRuntime: input.sourceRuntime,
    userId: String(input.userId),
    deviceId: String(input.deviceId),
    syncEventId: input.syncEventId !== undefined ? String(input.syncEventId) : null,
    createdAt: input.createdAt
  };
}

export function computeAuditHash(input: AuditHashInput): string {
  return sha256Hex(
    canonicalizeJson({
      algorithm: auditHashAlgorithm,
      previousHash: input.previousHash,
      payload: input.payload
    })
  );
}

export function createAuditEntry(
  input: AuditEntryInput,
  previousHash: string | null
): AuditEntry {
  const payload = createAuditPayload(input);
  const integrityHash = computeAuditHash({
    previousHash,
    payload
  });

  return {
    ...input,
    hashAlgorithm: auditHashAlgorithm,
    previousHash,
    integrityHash
  };
}

export function verifyAuditEntry(entry: AuditEntry): boolean {
  const expectedHash = computeAuditHash({
    previousHash: entry.previousHash,
    payload: createAuditPayload(entry)
  });

  return entry.hashAlgorithm === auditHashAlgorithm && entry.integrityHash === expectedHash;
}

export function verifyAuditChain(
  entries: readonly AuditEntry[]
): AuditChainVerificationResult {
  let previousHash: string | null = null;

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];

    if (entry === undefined) {
      return {
        ok: false,
        checkedEntries: index,
        failedAtIndex: index,
        message: "Audit entry is undefined."
      };
    }

    if (entry.previousHash !== previousHash) {
      return {
        ok: false,
        checkedEntries: index,
        failedAtIndex: index,
        message: "Audit chain previousHash does not match expected previous entry hash."
      };
    }

    if (!verifyAuditEntry(entry)) {
      return {
        ok: false,
        checkedEntries: index + 1,
        failedAtIndex: index,
        message: "Audit entry integrity hash does not match payload."
      };
    }

    previousHash = entry.integrityHash;
  }

  return {
    ok: true,
    checkedEntries: entries.length,
    message: "Audit chain is valid."
  };
}

export function appendAuditEntry(
  entries: readonly AuditEntry[],
  input: AuditEntryInput
): readonly AuditEntry[] {
  const previousHash = entries.length > 0 ? entries[entries.length - 1]?.integrityHash ?? null : null;

  return [...entries, createAuditEntry(input, previousHash)];
}