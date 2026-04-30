import type {
  AplomoDataLineageEdge,
  AplomoDataQualityLineageMetrics,
  AplomoDataQualityLineageSnapshot,
  AplomoDataQualityRun
} from "@iyi/domain";

export interface AplomoDataQualityLineageListResponse {
  snapshot: AplomoDataQualityLineageSnapshot;
  metrics: AplomoDataQualityLineageMetrics;
}

export interface AplomoCreateDataQualityRunResponse {
  run: AplomoDataQualityRun;
}

export interface AplomoDataQualityLineageExportResponse {
  fileName: string;
  mimeType: string;
  content: string;
}

export interface AplomoDataLineageGraphResponse {
  edges: AplomoDataLineageEdge[];
}