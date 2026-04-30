export type AplomoDataAssetType =
  | "source_table"
  | "derived_table"
  | "view"
  | "report"
  | "dashboard"
  | "export"
  | "api"
  | "pipeline"
  | "ai_context"
  | "manual";

export type AplomoDataSensitivity = "public" | "internal" | "confidential" | "restricted";
export type AplomoDataQualityTier = "bronze" | "silver" | "gold" | "platinum";

export type AplomoDataQualityRuleType =
  | "not_null"
  | "unique"
  | "valid_enum"
  | "range"
  | "non_negative"
  | "freshness"
  | "referential_integrity"
  | "custom";

export type AplomoDataQualityDimension =
  | "completeness"
  | "validity"
  | "uniqueness"
  | "consistency"
  | "timeliness"
  | "accuracy"
  | "governance";

export type AplomoDataQualitySeverity = "info" | "low" | "medium" | "high" | "critical";
export type AplomoDataQualityRunStatus = "queued" | "running" | "passed" | "warning" | "failed" | "error" | "skipped";

export type AplomoDataLineageType =
  | "derived_from"
  | "feeds"
  | "exports_to"
  | "governs"
  | "observes"
  | "enriches"
  | "audits";

export type AplomoDataLineageTransformationKind =
  | "logical"
  | "sql"
  | "repository"
  | "ui"
  | "export"
  | "analytics"
  | "ai_context"
  | "manual";

export type AplomoJsonRecord = Record<string, unknown>;

export interface AplomoDataAsset {
  id: string;
  assetKey: string;
  assetName: string;
  assetType: AplomoDataAssetType;
  sourceSystem: string;
  tableName: string;
  domainArea: string;
  ownerRole: string;
  sensitivity: AplomoDataSensitivity;
  qualityTier: AplomoDataQualityTier;
  isAiReady: boolean;
  isBiReady: boolean;
  isActive: boolean;
  description: string;
  metadata: AplomoJsonRecord;
  createdAt: string;
  updatedAt: string;
}

export interface AplomoDataQualityRule {
  id: string;
  ruleKey: string;
  assetKey: string;
  ruleName: string;
  ruleType: AplomoDataQualityRuleType;
  dimension: AplomoDataQualityDimension;
  severity: AplomoDataQualitySeverity;
  expectation: string;
  sqlCheck: string;
  threshold: number;
  isActive: boolean;
  metadata: AplomoJsonRecord;
  createdAt: string;
  updatedAt: string;
}

export interface AplomoDataQualityRun {
  id: string;
  runKey: string;
  ruleKey: string;
  assetKey: string;
  status: AplomoDataQualityRunStatus;
  score: number;
  checkedCount: number;
  passedCount: number;
  failedCount: number;
  startedAt: string;
  completedAt: string | null;
  executedBy: string | null;
  message: string;
  evidence: AplomoJsonRecord;
  metadata: AplomoJsonRecord;
  createdAt: string;
  updatedAt: string;
}

export interface AplomoDataLineageEdge {
  id: string;
  edgeKey: string;
  sourceAssetKey: string;
  targetAssetKey: string;
  lineageType: AplomoDataLineageType;
  transformationKind: AplomoDataLineageTransformationKind;
  confidence: number;
  isActive: boolean;
  description: string;
  metadata: AplomoJsonRecord;
  createdAt: string;
  updatedAt: string;
}

export interface AplomoDataQualityLineageSnapshot {
  assets: AplomoDataAsset[];
  rules: AplomoDataQualityRule[];
  qualityRuns: AplomoDataQualityRun[];
  lineageEdges: AplomoDataLineageEdge[];
}

export interface AplomoDataQualityLineageMetrics {
  assetCount: number;
  activeRuleCount: number;
  failedRunCount: number;
  averageQualityScore: number;
  lineageEdgeCount: number;
  aiReadyAssetCount: number;
  biReadyAssetCount: number;
}

export const emptyAplomoDataQualityLineageSnapshot: AplomoDataQualityLineageSnapshot = {
  assets: [],
  rules: [],
  qualityRuns: [],
  lineageEdges: []
};

export function calculateAplomoDataQualityLineageMetrics(
  snapshot: AplomoDataQualityLineageSnapshot
): AplomoDataQualityLineageMetrics {
  const scores = snapshot.qualityRuns
    .map((run) => run.score)
    .filter((score) => Number.isFinite(score));

  const averageQualityScore =
    scores.length === 0
      ? 0
      : Math.round((scores.reduce((total, score) => total + score, 0) / scores.length) * 100) / 100;

  return {
    assetCount: snapshot.assets.length,
    activeRuleCount: snapshot.rules.filter((rule) => rule.isActive).length,
    failedRunCount: snapshot.qualityRuns.filter((run) => run.status === "failed" || run.status === "error").length,
    averageQualityScore,
    lineageEdgeCount: snapshot.lineageEdges.filter((edge) => edge.isActive).length,
    aiReadyAssetCount: snapshot.assets.filter((asset) => asset.isAiReady).length,
    biReadyAssetCount: snapshot.assets.filter((asset) => asset.isBiReady).length
  };
}

function csvEscape(value: unknown): string {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function aplomoDataQualitySnapshotToCsv(snapshot: AplomoDataQualityLineageSnapshot): string {
  const rows: string[] = [
    ["section", "key", "name", "status", "detail"].map(csvEscape).join(",")
  ];

  for (const asset of snapshot.assets) {
    rows.push(["asset", asset.assetKey, asset.assetName, asset.isActive ? "active" : "inactive", asset.domainArea].map(csvEscape).join(","));
  }

  for (const rule of snapshot.rules) {
    rows.push(["rule", rule.ruleKey, rule.ruleName, rule.isActive ? "active" : "inactive", rule.severity].map(csvEscape).join(","));
  }

  for (const run of snapshot.qualityRuns) {
    rows.push(["quality_run", run.runKey, run.ruleKey, run.status, run.score].map(csvEscape).join(","));
  }

  for (const edge of snapshot.lineageEdges) {
    rows.push(["lineage_edge", edge.edgeKey, `${edge.sourceAssetKey} -> ${edge.targetAssetKey}`, edge.isActive ? "active" : "inactive", edge.lineageType].map(csvEscape).join(","));
  }

  return rows.join("\n");
}