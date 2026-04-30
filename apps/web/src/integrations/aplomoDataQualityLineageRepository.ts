import {
  aplomoDataQualitySnapshotToCsv,
  calculateAplomoDataQualityLineageMetrics,
  type AplomoDataAsset,
  type AplomoDataLineageEdge,
  type AplomoDataQualityLineageSnapshot,
  type AplomoDataQualityRule,
  type AplomoDataQualityRun
} from "@iyi/domain";
import type {
  AplomoCreateDataQualityRunResponse,
  AplomoDataQualityLineageExportResponse,
  AplomoDataQualityLineageListResponse
} from "@iyi/api-contracts";
import { supabase } from "./supabaseClient";

type DbRow = Record<string, unknown>;

const supabaseAny = supabase as any;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asJsonRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asRows(value: unknown): DbRow[] {
  return Array.isArray(value) ? value.map((item) => asJsonRecord(item)) : [];
}

async function unwrapRows(query: Promise<{ data: unknown; error: { message?: string } | null }>): Promise<DbRow[]> {
  const result = await query;
  if (result.error) {
    throw new Error(result.error.message ?? "Supabase request failed");
  }

  return asRows(result.data);
}

function mapAsset(row: DbRow): AplomoDataAsset {
  return {
    id: asString(row.id),
    assetKey: asString(row.asset_key),
    assetName: asString(row.asset_name),
    assetType: asString(row.asset_type, "source_table") as AplomoDataAsset["assetType"],
    sourceSystem: asString(row.source_system, "supabase"),
    tableName: asString(row.table_name),
    domainArea: asString(row.domain_area),
    ownerRole: asString(row.owner_role),
    sensitivity: asString(row.sensitivity, "internal") as AplomoDataAsset["sensitivity"],
    qualityTier: asString(row.quality_tier, "bronze") as AplomoDataAsset["qualityTier"],
    isAiReady: asBoolean(row.is_ai_ready),
    isBiReady: asBoolean(row.is_bi_ready),
    isActive: asBoolean(row.is_active, true),
    description: asString(row.description),
    metadata: asJsonRecord(row.metadata),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at)
  };
}

function mapRule(row: DbRow): AplomoDataQualityRule {
  return {
    id: asString(row.id),
    ruleKey: asString(row.rule_key),
    assetKey: asString(row.asset_key),
    ruleName: asString(row.rule_name),
    ruleType: asString(row.rule_type, "custom") as AplomoDataQualityRule["ruleType"],
    dimension: asString(row.dimension, "validity") as AplomoDataQualityRule["dimension"],
    severity: asString(row.severity, "medium") as AplomoDataQualityRule["severity"],
    expectation: asString(row.expectation),
    sqlCheck: asString(row.sql_check),
    threshold: asNumber(row.threshold, 1),
    isActive: asBoolean(row.is_active, true),
    metadata: asJsonRecord(row.metadata),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at)
  };
}

function mapRun(row: DbRow): AplomoDataQualityRun {
  return {
    id: asString(row.id),
    runKey: asString(row.run_key),
    ruleKey: asString(row.rule_key),
    assetKey: asString(row.asset_key),
    status: asString(row.status, "queued") as AplomoDataQualityRun["status"],
    score: asNumber(row.score),
    checkedCount: asNumber(row.checked_count),
    passedCount: asNumber(row.passed_count),
    failedCount: asNumber(row.failed_count),
    startedAt: asString(row.started_at),
    completedAt: row.completed_at === null ? null : asString(row.completed_at),
    executedBy: row.executed_by === null ? null : asString(row.executed_by),
    message: asString(row.message),
    evidence: asJsonRecord(row.evidence),
    metadata: asJsonRecord(row.metadata),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at)
  };
}

function mapEdge(row: DbRow): AplomoDataLineageEdge {
  return {
    id: asString(row.id),
    edgeKey: asString(row.edge_key),
    sourceAssetKey: asString(row.source_asset_key),
    targetAssetKey: asString(row.target_asset_key),
    lineageType: asString(row.lineage_type, "derived_from") as AplomoDataLineageEdge["lineageType"],
    transformationKind: asString(row.transformation_kind, "logical") as AplomoDataLineageEdge["transformationKind"],
    confidence: asNumber(row.confidence, 100),
    isActive: asBoolean(row.is_active, true),
    description: asString(row.description),
    metadata: asJsonRecord(row.metadata),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at)
  };
}

export async function listAplomoDataQualityLineage(): Promise<AplomoDataQualityLineageListResponse> {
  const [assetRows, ruleRows, runRows, edgeRows] = await Promise.all([
    unwrapRows(supabaseAny.from("aplomo_data_assets").select("*").order("asset_key", { ascending: true })),
    unwrapRows(supabaseAny.from("aplomo_data_quality_rules").select("*").order("rule_key", { ascending: true })),
    unwrapRows(supabaseAny.from("aplomo_data_quality_runs").select("*").order("started_at", { ascending: false })),
    unwrapRows(supabaseAny.from("aplomo_data_lineage_edges").select("*").order("edge_key", { ascending: true }))
  ]);

  const snapshot: AplomoDataQualityLineageSnapshot = {
    assets: assetRows.map(mapAsset),
    rules: ruleRows.map(mapRule),
    qualityRuns: runRows.map(mapRun),
    lineageEdges: edgeRows.map(mapEdge)
  };

  return {
    snapshot,
    metrics: calculateAplomoDataQualityLineageMetrics(snapshot)
  };
}

export async function createDemoAplomoDataQualityRun(): Promise<AplomoCreateDataQualityRunResponse> {
  const current = await listAplomoDataQualityLineage();
  const rule = current.snapshot.rules[0];

  if (!rule) {
    throw new Error("No hay reglas de calidad. Primero confirma que el seed SQL ya fue aplicado en Supabase.");
  }

  const now = new Date().toISOString();
  const runKey = `demo_${rule.ruleKey}_${now.replace(/[^0-9]/g, "").slice(0, 14)}`;

  const result = await supabaseAny
    .from("aplomo_data_quality_runs")
    .insert({
      run_key: runKey,
      rule_key: rule.ruleKey,
      asset_key: rule.assetKey,
      status: "passed",
      score: 100,
      checked_count: 1,
      passed_count: 1,
      failed_count: 0,
      started_at: now,
      completed_at: now,
      message: "Demo quality run created from Aplomo Data Quality + Lineage Core.",
      evidence: {
        source: "manual_demo",
        expectation: rule.expectation
      },
      metadata: {
        generatedBy: "AplomoDataQualityLineagePanel"
      }
    })
    .select("*")
    .single();

  if (result.error) {
    throw new Error(result.error.message ?? "Could not create demo quality run.");
  }

  return {
    run: mapRun(asJsonRecord(result.data))
  };
}

export function exportAplomoDataQualityLineageJson(
  snapshot: AplomoDataQualityLineageSnapshot
): AplomoDataQualityLineageExportResponse {
  return {
    fileName: "aplomo-data-quality-lineage.json",
    mimeType: "application/json;charset=utf-8",
    content: JSON.stringify(snapshot, null, 2)
  };
}

export function exportAplomoDataQualityLineageCsv(
  snapshot: AplomoDataQualityLineageSnapshot
): AplomoDataQualityLineageExportResponse {
  return {
    fileName: "aplomo-data-quality-lineage.csv",
    mimeType: "text/csv;charset=utf-8",
    content: aplomoDataQualitySnapshotToCsv(snapshot)
  };
}