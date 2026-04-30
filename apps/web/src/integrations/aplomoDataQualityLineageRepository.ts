import {
  aplomoDataQualitySnapshotToCsv,
  calculateAplomoDataQualityLineageMetrics,
  emptyAplomoDataQualityLineageSnapshot,
  type AplomoDataQualityLineageSnapshot
} from "@iyi/domain";
import type {
  AplomoCreateDataQualityRunResponse,
  AplomoDataQualityLineageExportResponse,
  AplomoDataQualityLineageListResponse
} from "@iyi/api-contracts";

export async function listAplomoDataQualityLineage(): Promise<AplomoDataQualityLineageListResponse> {
  const snapshot = emptyAplomoDataQualityLineageSnapshot;

  return {
    snapshot,
    metrics: calculateAplomoDataQualityLineageMetrics(snapshot)
  };
}

export async function createDemoAplomoDataQualityRun(): Promise<AplomoCreateDataQualityRunResponse> {
  throw new Error("Demo quality run creation is temporarily disabled while stabilizing the demo entry gate.");
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
    content: aplomoDataQualitySnapshotToCsv(snapshot),
  };
}