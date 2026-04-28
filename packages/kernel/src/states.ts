export const validationStates = [
  "draft",
  "operational",
  "pending_review",
  "validated",
  "corrected",
  "rejected",
  "superseded",
  "archived"
] as const;

export type ValidationState = (typeof validationStates)[number];

export const confidenceLevels = [
  "simulated",
  "approximate",
  "operational",
  "georeferenced",
  "centimeter_ready",
  "professionally_validated"
] as const;

export type ConfidenceLevel = (typeof confidenceLevels)[number];

export const sourceRuntimes = [
  "mobile",
  "edge",
  "cloud",
  "external_ingestion"
] as const;

export type SourceRuntime = (typeof sourceRuntimes)[number];

export const syncResultStatuses = [
  "accepted",
  "rejected",
  "conflict",
  "superseded",
  "duplicate",
  "invalid",
  "pending_review"
] as const;

export type SyncResultStatus = (typeof syncResultStatuses)[number];
