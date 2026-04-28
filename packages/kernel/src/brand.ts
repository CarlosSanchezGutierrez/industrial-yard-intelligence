export type Brand<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

export function assertNonEmptyString(value: string, label: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}
