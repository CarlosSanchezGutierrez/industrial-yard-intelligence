import { err, ok, type Result } from "@iyi/kernel";
import type { StorageProviderType } from "./types.js";

export interface StorageReference {
  readonly provider: StorageProviderType;
  readonly bucket?: string;
  readonly key: string;
  readonly uri?: string;
}

export type StorageReferenceError = "missing_storage_key" | "missing_external_uri";

export function validateStorageReference(
  reference: StorageReference
): Result<true, StorageReferenceError> {
  if (reference.key.trim().length === 0) {
    return err("missing_storage_key", "Storage reference key must not be empty.");
  }

  if (
    reference.provider === "external_reference" &&
    (!reference.uri || reference.uri.trim().length === 0)
  ) {
    return err(
      "missing_external_uri",
      "External storage references must include a non-empty URI."
    );
  }

  return ok(true);
}