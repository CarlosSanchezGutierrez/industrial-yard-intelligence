export const aplomoSchemaMigrationStatuses = [
  "expected",
  "applied",
  "failed",
  "deprecated",
  "superseded",
] as const;

export type AplomoSchemaMigrationStatus =
  (typeof aplomoSchemaMigrationStatuses)[number];

export const aplomoSchemaFindingKinds = [
  "missing_table",
  "missing_column",
  "missing_policy",
  "missing_index",
  "legacy_column",
  "not_null_without_default",
  "rls_disabled",
  "contract_gap",
  "repository_gap",
  "ui_gap",
  "data_quality_gap",
  "cloud_readiness_gap",
  "manual_note",
] as const;

export type AplomoSchemaFindingKind =
  (typeof aplomoSchemaFindingKinds)[number];

export const aplomoSchemaFindingSeverities = [
  "info",
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type AplomoSchemaFindingSeverity =
  (typeof aplomoSchemaFindingSeverities)[number];

export const aplomoSchemaObjectTypes = [
  "table",
  "column",
  "policy",
  "index",
  "function",
  "contract",
  "repository",
  "ui",
  "service",
  "data_quality",
  "cloud",
  "unknown",
] as const;

export type AplomoSchemaObjectType =
  (typeof aplomoSchemaObjectTypes)[number];

export const aplomoSchemaFindingStatuses = [
  "open",
  "in_progress",
  "resolved",
  "accepted_risk",
  "ignored",
] as const;

export type AplomoSchemaFindingStatus =
  (typeof aplomoSchemaFindingStatuses)[number];

export type AplomoSchemaMigrationLedgerEntry = {
  migrationKey: string;
  name: string;
  status: AplomoSchemaMigrationStatus;
  source: "manual_sql" | "supabase_sql_editor" | "local_file" | "ci_cd" | "system_seed" | "unknown";
  checksum: string | null;
  description: string;
  appliedAt: string | null;
  metadata: Record<string, unknown>;
};

export type AplomoSchemaAuditFinding = {
  capabilityId: string;
  findingKind: AplomoSchemaFindingKind;
  severity: AplomoSchemaFindingSeverity;
  objectType: AplomoSchemaObjectType;
  objectName: string;
  expectedState: Record<string, unknown>;
  actualState: Record<string, unknown>;
  recommendation: string;
  status: AplomoSchemaFindingStatus;
  metadata: Record<string, unknown>;
};

export type AplomoSchemaCapabilityLayerStatuses = {
  domain: string;
  contracts: string;
  database: string;
  rls: string;
  repository: string;
  service: string;
  audit: string;
  export: string;
  analytics: string;
  dataQuality: string;
  ui: string;
  aiGovernance: string;
  cloudReadiness: string;
};

export type AplomoSchemaCapabilityStatus = {
  capabilityId: string;
  capabilityName: string;
  criticality: "core" | "high" | "medium" | "low";
  layerStatuses: AplomoSchemaCapabilityLayerStatuses;
  readinessScore: number;
  blockers: string[];
  nextActions: string[];
  metadata: Record<string, unknown>;
  computedAt: string;
};

export const calculateAplomoSchemaCapabilityReadinessScore = (
  statuses: AplomoSchemaCapabilityLayerStatuses,
): number => {
  const values = Object.values(statuses);
  const score = values.reduce((sum, status) => {
    if (status === "complete") {
      return sum + 1;
    }

    if (status === "partial") {
      return sum + 0.5;
    }

    if (status === "planned") {
      return sum + 0.15;
    }

    return sum;
  }, 0);

  return Math.round((score / values.length) * 100);
};

export const aplomoSchemaGovernanceTables = [
  "aplomo_schema_migration_ledger",
  "aplomo_schema_audit_findings",
  "aplomo_schema_capability_status",
] as const;
