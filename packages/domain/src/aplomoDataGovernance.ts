export const aplomoDataSensitivityLevels = [
  "public",
  "internal",
  "confidential",
  "restricted",
] as const;

export type AplomoDataSensitivity =
  (typeof aplomoDataSensitivityLevels)[number];

export const aplomoDataDomains = [
  "identity",
  "company",
  "site",
  "yard",
  "device",
  "connection",
  "telemetry",
  "gps_capture",
  "evidence",
  "map",
  "route",
  "material",
  "audit",
  "ai",
  "analytics",
] as const;

export type AplomoDataDomain = (typeof aplomoDataDomains)[number];

export const aplomoDataQualityDimensions = [
  "completeness",
  "validity",
  "accuracy",
  "consistency",
  "timeliness",
  "uniqueness",
  "lineage",
] as const;

export type AplomoDataQualityDimension =
  (typeof aplomoDataQualityDimensions)[number];

export const aplomoDataQualityStatuses = [
  "pass",
  "warning",
  "fail",
  "unknown",
] as const;

export type AplomoDataQualityStatus =
  (typeof aplomoDataQualityStatuses)[number];

export const aplomoAiUsagePolicies = [
  "allowed",
  "allowed_with_redaction",
  "human_review_required",
  "blocked",
] as const;

export type AplomoAiUsagePolicy = (typeof aplomoAiUsagePolicies)[number];

export const aplomoDataProductTiers = [
  "raw",
  "bronze",
  "silver",
  "gold",
  "feature",
  "model_output",
] as const;

export type AplomoDataProductTier = (typeof aplomoDataProductTiers)[number];

export type AplomoDataOwner = {
  team: string;
  ownerName?: string;
  ownerEmail?: string;
};

export type AplomoDataRetentionPolicy = {
  retentionDays: number;
  archiveAfterDays?: number;
  deleteAfterDays?: number;
  legalHoldAllowed: boolean;
};

export type AplomoDataQualityMetric = {
  dimension: AplomoDataQualityDimension;
  status: AplomoDataQualityStatus;
  score: number;
  message?: string;
  measuredAt: string;
};

export type AplomoDataLineageReference = {
  sourceSystem: string;
  sourceEntity?: string;
  sourceEventId?: string;
  sourceRecordId?: string;
  transformName?: string;
  transformVersion?: string;
};

export type AplomoDataContractField = {
  name: string;
  type: string;
  required: boolean;
  sensitivity: AplomoDataSensitivity;
  description?: string;
  example?: string;
};

export type AplomoDataContract = {
  id: string;
  name: string;
  domain: AplomoDataDomain;
  entityName: string;
  version: string;
  tier: AplomoDataProductTier;
  owner: AplomoDataOwner;
  sensitivity: AplomoDataSensitivity;
  aiUsagePolicy: AplomoAiUsagePolicy;
  retention: AplomoDataRetentionPolicy;
  fields: AplomoDataContractField[];
  qualityRules: string[];
  createdAt: string;
  updatedAt: string;
};

export type AplomoGovernanceEnvelope<TPayload> = {
  eventId: string;
  eventName: string;
  eventVersion: string;
  domain: AplomoDataDomain;
  producer: string;
  occurredAt: string;
  ingestedAt?: string;
  companyId?: string;
  siteId?: string;
  subjectId?: string;
  payload: TPayload;
  governance: {
    dataContractId: string;
    sensitivity: AplomoDataSensitivity;
    tier: AplomoDataProductTier;
    aiUsagePolicy: AplomoAiUsagePolicy;
    quality: AplomoDataQualityMetric[];
    lineage: AplomoDataLineageReference[];
    retentionDays: number;
    tags: string[];
  };
};

export const createAplomoDataContractId = (
  domain: AplomoDataDomain,
  entityName: string,
  version: string,
): string => {
  const cleanEntity = entityName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const cleanVersion = version
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "_");

  return `aplomo.${domain}.${cleanEntity}.v${cleanVersion}`;
};

export const isSensitiveAplomoData = (
  sensitivity: AplomoDataSensitivity,
): boolean => {
  return sensitivity === "confidential" || sensitivity === "restricted";
};

export const canUseAplomoDataForAi = (
  policy: AplomoAiUsagePolicy,
): boolean => {
  return policy === "allowed" || policy === "allowed_with_redaction";
};

export const calculateAplomoQualityScore = (
  metrics: AplomoDataQualityMetric[],
): number => {
  if (metrics.length === 0) {
    return 0;
  }

  const total = metrics.reduce((sum, metric) => sum + metric.score, 0);

  return Math.round((total / metrics.length) * 100) / 100;
};

export const hasBlockingAplomoQualityFailure = (
  metrics: AplomoDataQualityMetric[],
): boolean => {
  return metrics.some((metric) => metric.status === "fail");
};
