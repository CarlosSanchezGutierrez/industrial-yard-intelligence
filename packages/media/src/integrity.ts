import { err, ok, type Result } from "@iyi/kernel";
import type { IntegrityHashAlgorithm } from "./types.js";

export interface IntegrityHash {
  readonly algorithm: IntegrityHashAlgorithm;
  readonly value: string;
}

export type IntegrityHashError = "missing_hash_value" | "invalid_hash_value";

export function createIntegrityHash(
  algorithm: IntegrityHashAlgorithm,
  value: string
): Result<IntegrityHash, IntegrityHashError> {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue.length === 0) {
    return err("missing_hash_value", "Integrity hash value must not be empty.");
  }

  if (!/^[a-f0-9]+$/u.test(normalizedValue)) {
    return err("invalid_hash_value", "Integrity hash value must be hexadecimal.");
  }

  return ok({
    algorithm,
    value: normalizedValue
  });
}