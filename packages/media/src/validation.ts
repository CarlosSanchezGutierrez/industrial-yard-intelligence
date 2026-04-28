import { err, ok, type Result } from "@iyi/kernel";
import type { EvidenceMetadata } from "./evidence.js";
import { validateStorageReference } from "./storage.js";

export type EvidenceValidationError =
  | "evidence_requires_link"
  | "invalid_storage_reference"
  | "invalid_byte_size"
  | "missing_created_at";

export function validateEvidenceMetadata(
  evidence: EvidenceMetadata
): Result<true, EvidenceValidationError> {
  if (evidence.createdAt.trim().length === 0) {
    return err("missing_created_at", "Evidence must include a creation timestamp.");
  }

  if (evidence.links.length === 0) {
    return err("evidence_requires_link", "Evidence must be linked to at least one target.");
  }

  if (evidence.byteSize !== undefined && evidence.byteSize < 0) {
    return err("invalid_byte_size", "Evidence byte size cannot be negative.");
  }

  const storageResult = validateStorageReference(evidence.storage);

  if (!storageResult.ok) {
    return err(
      "invalid_storage_reference",
      `Invalid storage reference: ${storageResult.message}`
    );
  }

  return ok(true);
}