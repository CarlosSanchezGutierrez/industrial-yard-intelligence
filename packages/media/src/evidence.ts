import type {
  DeviceId,
  EntityId,
  EventId,
  EvidenceId,
  MeasurementSessionId,
  TenantId,
  TerminalId,
  UserId
} from "@iyi/kernel";
import type { EvidenceLinkType, EvidenceType } from "./types.js";
import type { IntegrityHash } from "./integrity.js";
import type { StorageReference } from "./storage.js";

export interface EvidenceOwner {
  readonly tenantId: TenantId;
  readonly terminalId?: TerminalId;
  readonly createdByUserId: UserId;
  readonly createdByDeviceId: DeviceId;
}

export interface EvidenceLink {
  readonly linkType: EvidenceLinkType;
  readonly targetId: EntityId | EventId | EvidenceId | MeasurementSessionId | string;
}

export interface EvidenceMetadata {
  readonly evidenceId: EvidenceId;
  readonly evidenceType: EvidenceType;
  readonly owner: EvidenceOwner;
  readonly storage: StorageReference;
  readonly createdAt: string;
  readonly links: readonly EvidenceLink[];
  readonly fileName?: string;
  readonly mimeType?: string;
  readonly byteSize?: number;
  readonly integrityHash?: IntegrityHash;
  readonly description?: string;
}

export function isTenantScopedEvidence(evidence: EvidenceMetadata): boolean {
  return evidence.owner.tenantId.length > 0;
}

export function hasIntegrityHash(evidence: EvidenceMetadata): boolean {
  return evidence.integrityHash !== undefined;
}

export function isLinkedToEvent(evidence: EvidenceMetadata): boolean {
  return evidence.links.some((link) => link.linkType === "event");
}

export function isLinkedToMeasurementSession(evidence: EvidenceMetadata): boolean {
  return evidence.links.some((link) => link.linkType === "measurement_session");
}