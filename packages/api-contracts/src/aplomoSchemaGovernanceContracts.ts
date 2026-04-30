export const aplomoSchemaLedgerTables = [
  "aplomo_schema_migration_ledger",
  "aplomo_schema_audit_findings",
  "aplomo_schema_capability_status",
] as const;

export type AplomoSchemaLedgerTable =
  (typeof aplomoSchemaLedgerTables)[number];

export type AplomoSchemaMigrationLedgerRowContract = {
  id: string;
  migration_key: string;
  name: string;
  status: "expected" | "applied" | "failed" | "deprecated" | "superseded";
  source: "manual_sql" | "supabase_sql_editor" | "local_file" | "ci_cd" | "system_seed" | "unknown";
  checksum: string | null;
  description: string;
  applied_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoSchemaAuditFindingRowContract = {
  id: string;
  capability_id: string;
  finding_kind:
    | "missing_table"
    | "missing_column"
    | "missing_policy"
    | "missing_index"
    | "legacy_column"
    | "not_null_without_default"
    | "rls_disabled"
    | "contract_gap"
    | "repository_gap"
    | "ui_gap"
    | "data_quality_gap"
    | "cloud_readiness_gap"
    | "manual_note";
  severity: "info" | "low" | "medium" | "high" | "critical";
  object_type:
    | "table"
    | "column"
    | "policy"
    | "index"
    | "function"
    | "contract"
    | "repository"
    | "ui"
    | "service"
    | "data_quality"
    | "cloud"
    | "unknown";
  object_name: string;
  expected_state: Record<string, unknown>;
  actual_state: Record<string, unknown>;
  recommendation: string;
  status: "open" | "in_progress" | "resolved" | "accepted_risk" | "ignored";
  detected_at: string;
  resolved_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoSchemaCapabilityStatusRowContract = {
  id: string;
  capability_id: string;
  capability_name: string;
  criticality: "core" | "high" | "medium" | "low";
  domain_status: string;
  contracts_status: string;
  database_status: string;
  rls_status: string;
  repository_status: string;
  service_status: string;
  audit_status: string;
  export_status: string;
  analytics_status: string;
  data_quality_status: string;
  ui_status: string;
  ai_governance_status: string;
  cloud_readiness_status: string;
  readiness_score: number;
  blockers: string[];
  next_actions: string[];
  metadata: Record<string, unknown>;
  computed_at: string;
  created_at: string;
  updated_at: string;
};

export type AplomoSchemaGovernanceSnapshotContract = {
  loadedAt: string;
  migrationLedger: AplomoSchemaMigrationLedgerRowContract[];
  auditFindings: AplomoSchemaAuditFindingRowContract[];
  capabilityStatuses: AplomoSchemaCapabilityStatusRowContract[];
  metrics: {
    migrationCount: number;
    appliedMigrationCount: number;
    openFindingCount: number;
    criticalFindingCount: number;
    capabilityCount: number;
    averageReadinessScore: number;
  };
};

export type AplomoCreateSchemaAuditFindingRequestContract = {
  capabilityId: string;
  findingKind: AplomoSchemaAuditFindingRowContract["finding_kind"];
  severity: AplomoSchemaAuditFindingRowContract["severity"];
  objectType: AplomoSchemaAuditFindingRowContract["object_type"];
  objectName: string;
  expectedState: Record<string, unknown>;
  actualState: Record<string, unknown>;
  recommendation: string;
  metadata: Record<string, unknown>;
};

export type AplomoResolveSchemaAuditFindingRequestContract = {
  findingId: string;
  resolutionStatus: "resolved" | "accepted_risk" | "ignored";
};
