export type CanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | readonly CanonicalJsonValue[]
  | { readonly [key: string]: CanonicalJsonValue };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function normalizeJsonValue(value: unknown): CanonicalJsonValue {
  if (value === null) {
    return null;
  }

  if (typeof value === "boolean" || typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Canonical JSON does not support NaN or Infinity.");
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonValue(item));
  }

  if (isPlainObject(value)) {
    const normalized: Record<string, CanonicalJsonValue> = {};

    for (const key of Object.keys(value).sort()) {
      const item = value[key];

      if (item === undefined || typeof item === "function" || typeof item === "symbol") {
        continue;
      }

      normalized[key] = normalizeJsonValue(item);
    }

    return normalized;
  }

  throw new Error(`Unsupported canonical JSON value type: ${typeof value}`);
}

export function canonicalizeJson(value: unknown): string {
  return JSON.stringify(normalizeJsonValue(value));
}