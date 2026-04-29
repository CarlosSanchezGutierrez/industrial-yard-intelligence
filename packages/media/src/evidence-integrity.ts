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

export const evidenceHashAlgorithm = "sha256" as const;

export type EvidenceHashAlgorithm = typeof evidenceHashAlgorithm;

export type EvidenceKind =
  | "photo"
  | "document"
  | "geojson"
  | "geotiff"
  | "point_cloud"
  | "cad_file"
  | "rtk_observation"
  | "sensor_export"
  | "other";

export type EvidenceStorageProvider =
  | "edge_filesystem"
  | "edge_object_store"
  | "cloud_object_store"
  | "external_reference";

export interface EvidenceIntegrityInput {
  readonly bytes: Uint8Array | string;
}

export interface EvidenceIntegrityRecord {
  readonly algorithm: EvidenceHashAlgorithm;
  readonly hashValue: string;
  readonly byteSize: number;
}

export interface EvidenceMetadataInput {
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
  readonly evidenceId: EntityId;
  readonly evidenceKind: EvidenceKind;
  readonly storageProvider: EvidenceStorageProvider;
  readonly storageKey: string;
  readonly fileName?: string;
  readonly mimeType?: string;
  readonly relatedEntityId?: EntityId;
  readonly relatedEventId?: EventId;
  readonly ownerUserId: UserId;
  readonly ownerDeviceId: DeviceId;
  readonly sourceRuntime: SourceRuntime;
  readonly createdAt: string;
}

export interface EvidenceMetadata extends EvidenceMetadataInput {
  readonly integrity: EvidenceIntegrityRecord;
  readonly immutable: true;
}

function toBuffer(value: Uint8Array | string): Buffer {
  if (typeof value === "string") {
    return Buffer.from(value, "utf8");
  }

  return Buffer.from(value);
}

export function computeEvidenceIntegrity(
  input: EvidenceIntegrityInput
): EvidenceIntegrityRecord {
  const buffer = toBuffer(input.bytes);
  const hashValue = createHash(evidenceHashAlgorithm).update(buffer).digest("hex");

  return {
    algorithm: evidenceHashAlgorithm,
    hashValue,
    byteSize: buffer.byteLength
  };
}

export function createEvidenceMetadata(
  input: EvidenceMetadataInput,
  integrity: EvidenceIntegrityRecord
): EvidenceMetadata {
  return {
    ...input,
    integrity,
    immutable: true
  };
}

export function verifyEvidenceIntegrity(
  bytes: Uint8Array | string,
  expected: EvidenceIntegrityRecord
): boolean {
  const actual = computeEvidenceIntegrity({ bytes });

  return (
    expected.algorithm === evidenceHashAlgorithm &&
    actual.hashValue === expected.hashValue &&
    actual.byteSize === expected.byteSize
  );
}

export function createTextEvidenceMetadata(input: {
  readonly content: string;
  readonly metadata: EvidenceMetadataInput;
}): EvidenceMetadata {
  const integrity = computeEvidenceIntegrity({
    bytes: input.content
  });

  return createEvidenceMetadata(input.metadata, integrity);
}

export function assertEvidenceStorageKey(storageKey: string): string {
  const normalized = storageKey.trim();

  if (normalized.length === 0) {
    throw new Error("Evidence storage key must not be empty.");
  }

  if (normalized.includes("..")) {
    throw new Error("Evidence storage key must not contain path traversal.");
  }

  return normalized;
}