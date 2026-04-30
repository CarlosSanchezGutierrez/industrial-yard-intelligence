import { getAplomoSupabaseMvpClient } from "./aplomoSupabaseMvpRepository.js";

export type AplomoSchemaMigrationLedgerRow = {
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

export type AplomoSchemaAuditFindingRow = {
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

export type AplomoSchemaCapabilityStatusRow = {
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

export type AplomoSchemaGovernanceContext = {
  loadedAt: string;
  migrationLedger: AplomoSchemaMigrationLedgerRow[];
  auditFindings: AplomoSchemaAuditFindingRow[];
  capabilityStatuses: AplomoSchemaCapabilityStatusRow[];
};

export type AplomoCreateSchemaAuditFindingInput = {
  capabilityId: string;
  findingKind: AplomoSchemaAuditFindingRow["finding_kind"];
  severity: AplomoSchemaAuditFindingRow["severity"];
  objectType: AplomoSchemaAuditFindingRow["object_type"];
  objectName: string;
  expectedState: Record<string, unknown>;
  actualState: Record<string, unknown>;
  recommendation: string;
  metadata: Record<string, unknown>;
};

type BaselineCapabilityStatus = {
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
};

const throwIfError = (
  error: { message: string } | null,
  context: string,
): void => {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
};

const baselineMigrations = [
  {
    migration_key: "20260430000000_manual_consolidated_base",
    name: "Manual consolidated Supabase base",
    status: "applied",
    source: "supabase_sql_editor",
    checksum: null,
    description:
      "Consolidated manual base migration for Aplomo SaaS MVP tables, RLS and compatibility repairs.",
    applied_at: new Date().toISOString(),
    metadata: {
      seeded: true,
      program: "backend_completion",
    },
  },
  {
    migration_key: "20260430001100_schema_migration_ledger",
    name: "Schema Migration Ledger + Schema Audit Findings",
    status: "applied",
    source: "supabase_sql_editor",
    checksum: null,
    description:
      "Creates migration ledger, schema audit findings and capability status tracking.",
    applied_at: new Date().toISOString(),
    metadata: {
      seeded: true,
      program: "backend_completion",
    },
  },
] as const;

const baselineCapabilityStatuses: BaselineCapabilityStatus[] = [
  {
    capability_id: "tenant_management",
    capability_name: "Tenant / Company Management",
    criticality: "core",
    domain_status: "partial",
    contracts_status: "partial",
    database_status: "complete",
    rls_status: "complete",
    repository_status: "complete",
    service_status: "missing",
    audit_status: "partial",
    export_status: "partial",
    analytics_status: "complete",
    data_quality_status: "missing",
    ui_status: "complete",
    ai_governance_status: "complete",
    cloud_readiness_status: "partial",
    readiness_score: 62,
    blockers: ["Missing server-side tenant lifecycle service", "Missing formal tenant data quality rules"],
    next_actions: ["Create Tenant Management Service", "Create tenant data quality rules"],
    metadata: { seeded: true },
  },
  {
    capability_id: "identity_profiles",
    capability_name: "Identity Profiles",
    criticality: "core",
    domain_status: "partial",
    contracts_status: "partial",
    database_status: "complete",
    rls_status: "complete",
    repository_status: "complete",
    service_status: "missing",
    audit_status: "partial",
    export_status: "missing",
    analytics_status: "partial",
    data_quality_status: "missing",
    ui_status: "partial",
    ai_governance_status: "partial",
    cloud_readiness_status: "planned",
    readiness_score: 46,
    blockers: ["Missing User & Role Admin Panel", "Missing identity service"],
    next_actions: ["Create User & Role Admin Panel", "Create Identity/Profile Service"],
    metadata: { seeded: true },
  },
  {
    capability_id: "tenant_memberships_rbac",
    capability_name: "Tenant Memberships and RBAC",
    criticality: "core",
    domain_status: "complete",
    contracts_status: "partial",
    database_status: "complete",
    rls_status: "complete",
    repository_status: "complete",
    service_status: "missing",
    audit_status: "partial",
    export_status: "missing",
    analytics_status: "partial",
    data_quality_status: "missing",
    ui_status: "partial",
    ai_governance_status: "complete",
    cloud_readiness_status: "planned",
    readiness_score: 58,
    blockers: ["Missing RBAC Matrix Panel", "Missing RBAC Service"],
    next_actions: ["Create RBAC Matrix Panel", "Create RBAC Service"],
    metadata: { seeded: true },
  },
  {
    capability_id: "device_fleet",
    capability_name: "Device Fleet",
    criticality: "core",
    domain_status: "complete",
    contracts_status: "partial",
    database_status: "complete",
    rls_status: "complete",
    repository_status: "complete",
    service_status: "missing",
    audit_status: "partial",
    export_status: "partial",
    analytics_status: "complete",
    data_quality_status: "missing",
    ui_status: "complete",
    ai_governance_status: "complete",
    cloud_readiness_status: "partial",
    readiness_score: 69,
    blockers: ["Missing Device Fleet Service", "Missing cloud IoT adapters"],
    next_actions: ["Create Device Fleet Management Panel", "Create IoT adapter interfaces"],
    metadata: { seeded: true },
  },
  {
    capability_id: "data_quality_lineage",
    capability_name: "Data Quality and Lineage Core",
    criticality: "core",
    domain_status: "planned",
    contracts_status: "planned",
    database_status: "missing",
    rls_status: "planned",
    repository_status: "missing",
    service_status: "missing",
    audit_status: "planned",
    export_status: "planned",
    analytics_status: "planned",
    data_quality_status: "planned",
    ui_status: "missing",
    ai_governance_status: "complete",
    cloud_readiness_status: "partial",
    readiness_score: 18,
    blockers: ["Missing data quality tables", "Missing lineage tables", "Missing rule runner"],
    next_actions: ["Create Data Quality + Lineage Core migration", "Create DQ repository and rule runner"],
    metadata: { seeded: true },
  },
  {
    capability_id: "schema_migration_ledger",
    capability_name: "Schema Migration Ledger",
    criticality: "core",
    domain_status: "complete",
    contracts_status: "complete",
    database_status: "complete",
    rls_status: "complete",
    repository_status: "complete",
    service_status: "partial",
    audit_status: "complete",
    export_status: "partial",
    analytics_status: "complete",
    data_quality_status: "partial",
    ui_status: "complete",
    ai_governance_status: "complete",
    cloud_readiness_status: "partial",
    readiness_score: 78,
    blockers: ["Schema introspection is not automated server-side yet"],
    next_actions: ["Create schema introspection service", "Create automatic schema drift scanner"],
    metadata: { seeded: true },
  },
  {
    capability_id: "llm_provider_gateway",
    capability_name: "LLM Provider Gateway",
    criticality: "high",
    domain_status: "planned",
    contracts_status: "planned",
    database_status: "missing",
    rls_status: "planned",
    repository_status: "missing",
    service_status: "missing",
    audit_status: "planned",
    export_status: "planned",
    analytics_status: "planned",
    data_quality_status: "planned",
    ui_status: "missing",
    ai_governance_status: "complete",
    cloud_readiness_status: "planned",
    readiness_score: 17,
    blockers: ["Intentionally paused until backend/data/governance foundation is stronger"],
    next_actions: ["Complete schema ledger", "Complete data quality core", "Create dry-run gateway later"],
    metadata: { seeded: true },
  },
];

export const loadAplomoSchemaGovernanceContext =
  async (): Promise<AplomoSchemaGovernanceContext> => {
    const supabase = getAplomoSupabaseMvpClient();

    const [ledgerResult, findingsResult, capabilityResult] = await Promise.all([
      supabase
        .from("aplomo_schema_migration_ledger")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("aplomo_schema_audit_findings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("aplomo_schema_capability_status")
        .select("*")
        .order("readiness_score", { ascending: true })
        .limit(500),
    ]);

    throwIfError(ledgerResult.error, "read schema migration ledger");
    throwIfError(findingsResult.error, "read schema audit findings");
    throwIfError(capabilityResult.error, "read schema capability status");

    return {
      loadedAt: new Date().toISOString(),
      migrationLedger:
        (ledgerResult.data ?? []) as AplomoSchemaMigrationLedgerRow[],
      auditFindings:
        (findingsResult.data ?? []) as AplomoSchemaAuditFindingRow[],
      capabilityStatuses:
        (capabilityResult.data ?? []) as AplomoSchemaCapabilityStatusRow[],
    };
  };

export const seedAplomoSchemaGovernanceBaseline = async (): Promise<void> => {
  const supabase = getAplomoSupabaseMvpClient();

  const ledgerResult = await supabase
    .from("aplomo_schema_migration_ledger")
    .upsert(baselineMigrations, { onConflict: "migration_key" });

  throwIfError(ledgerResult.error, "seed schema migration ledger");

  const now = new Date().toISOString();

  const capabilityRows = baselineCapabilityStatuses.map((row) => ({
    ...row,
    computed_at: now,
    updated_at: now,
  }));

  const capabilityResult = await supabase
    .from("aplomo_schema_capability_status")
    .upsert(capabilityRows, { onConflict: "capability_id" });

  throwIfError(capabilityResult.error, "seed schema capability status");
};

export const createAplomoSchemaAuditFinding = async (
  input: AplomoCreateSchemaAuditFindingInput,
): Promise<AplomoSchemaAuditFindingRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase
    .from("aplomo_schema_audit_findings")
    .insert({
      capability_id: input.capabilityId,
      finding_kind: input.findingKind,
      severity: input.severity,
      object_type: input.objectType,
      object_name: input.objectName,
      expected_state: input.expectedState,
      actual_state: input.actualState,
      recommendation: input.recommendation,
      status: "open",
      metadata: input.metadata,
    })
    .select("*")
    .single();

  throwIfError(result.error, "create schema audit finding");

  return result.data as AplomoSchemaAuditFindingRow;
};

export const resolveAplomoSchemaAuditFinding = async (input: {
  findingId: string;
  status: "resolved" | "accepted_risk" | "ignored";
}): Promise<AplomoSchemaAuditFindingRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase
    .from("aplomo_schema_audit_findings")
    .update({
      status: input.status,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.findingId)
    .select("*")
    .single();

  throwIfError(result.error, "resolve schema audit finding");

  return result.data as AplomoSchemaAuditFindingRow;
};
