export const aplomoCapabilityCompletionStatuses = [
  "complete",
  "partial",
  "missing",
  "planned",
] as const;

export type AplomoCapabilityCompletionStatus =
  (typeof aplomoCapabilityCompletionStatuses)[number];

export const aplomoCapabilityCompletionLayers = [
  "domain",
  "contracts",
  "database",
  "rls",
  "repository",
  "service",
  "audit",
  "export",
  "analytics",
  "data_quality",
  "ui",
  "ai_governance",
  "cloud_readiness",
] as const;

export type AplomoCapabilityCompletionLayer =
  (typeof aplomoCapabilityCompletionLayers)[number];

export type AplomoCapabilityCompletionRequest = {
  capabilityId: string;
  requestedByProfileId: string;
  requestedAt: string;
  targetLayers: AplomoCapabilityCompletionLayer[];
  notes: string;
};

export type AplomoCapabilityCompletionLayerContract = {
  layer: AplomoCapabilityCompletionLayer;
  status: AplomoCapabilityCompletionStatus;
  evidence: string;
  nextAction: string;
};

export type AplomoCapabilityCompletionResponse = {
  capabilityId: string;
  capabilityName: string;
  primaryTables: string[];
  requiredPolicies: string[];
  requiredExports: string[];
  requiredAnalytics: string[];
  requiredDataQualityRules: string[];
  cloudTargets: string[];
  layers: AplomoCapabilityCompletionLayerContract[];
  computedAt: string;
};

export type AplomoCapabilityCompletionMatrixRow = {
  capabilityId: string;
  capabilityName: string;
  layer: AplomoCapabilityCompletionLayer;
  status: AplomoCapabilityCompletionStatus;
  evidence: string;
  nextAction: string;
};

export type AplomoCapabilityCompletionSummary = {
  capabilityCount: number;
  layerCount: number;
  completeLayerCount: number;
  partialLayerCount: number;
  missingLayerCount: number;
  plannedLayerCount: number;
  coreCapabilityCount: number;
  cloudTargetCount: number;
};

export type AplomoBackendCompletionStage = {
  id: string;
  title: string;
  outcome: string;
  exitCriteria: string[];
};

export type AplomoBackendCompletionProgramContract = {
  programName: "Aplomo Backend Completion Program";
  version: "v1";
  principles: string[];
  stages: AplomoBackendCompletionStage[];
  summary: AplomoCapabilityCompletionSummary;
  generatedAt: string;
};

export const createEmptyAplomoCapabilityCompletionSummary =
  (): AplomoCapabilityCompletionSummary => ({
    capabilityCount: 0,
    layerCount: 0,
    completeLayerCount: 0,
    partialLayerCount: 0,
    missingLayerCount: 0,
    plannedLayerCount: 0,
    coreCapabilityCount: 0,
    cloudTargetCount: 0,
  });

export const aplomoBackendCompletionProgramPrinciples = [
  "No capability is complete unless domain, contracts, database, RLS, repository, service, audit, export, analytics, data quality, UI, AI governance and cloud readiness are explicit.",
  "Frontend must not hide backend value. Every deep backend capability needs an administrative surface or audit surface.",
  "Sensitive operations must move toward server-side services instead of browser-only execution.",
  "Every future AI workflow must require approved prompts, approved context packets, sensitivity checks and audit events.",
  "Cloud integrations must be provider-neutral across AWS, Azure, Google Cloud, Supabase, Vercel and future data platforms.",
] as const;

export const aplomoBackendCompletionProgramStages = [
  {
    id: "capability_registry",
    title: "Backend Capability Registry",
    outcome:
      "Every product/backend capability is represented as code with ownership, tables, policies, exports, analytics, data quality and UI readiness.",
    exitCriteria: [
      "Capability registry compiles in domain package.",
      "Contracts compile in api-contracts package.",
      "Audit matrix is visible in admin UI.",
      "Gaps are explicit and versioned.",
    ],
  },
  {
    id: "schema_migration_ledger",
    title: "Schema Migration Ledger",
    outcome:
      "Database schema, expected tables, applied migrations, RLS policies and schema drift findings become auditable data.",
    exitCriteria: [
      "Migration ledger tables exist.",
      "Schema audit findings can be stored.",
      "Capability status can be computed from database reality.",
      "Supabase manual drift is visible.",
    ],
  },
  {
    id: "data_quality_lineage",
    title: "Data Quality and Lineage Core",
    outcome:
      "Aplomo can prove data quality, lineage and readiness for BI, warehouse, AI and enterprise due diligence.",
    exitCriteria: [
      "Data assets are registered.",
      "Quality rules exist.",
      "Quality runs are persisted.",
      "Lineage edges connect sources, tables, exports and AI packets.",
    ],
  },
  {
    id: "crud_completion",
    title: "Canonical CRUD Completion",
    outcome:
      "Core entities support create, read, update, archive, filter, search, export, analytics and audit consistently.",
    exitCriteria: [
      "CRUD contracts exist.",
      "Repositories are standardized.",
      "Audit writes are consistent.",
      "Role checks are explicit.",
      "UI consumes the same contracts.",
    ],
  },
  {
    id: "export_analytics_center",
    title: "Export and Analytics Center",
    outcome:
      "CSV, JSON, Excel-ready, BI-ready and warehouse-ready exports are handled through a unified governed layer.",
    exitCriteria: [
      "Export records are centralized.",
      "Export formats are standardized.",
      "Analytics metrics are documented.",
      "Export actions are auditable.",
    ],
  },
  {
    id: "cloud_integration_readiness",
    title: "Cloud Integration Readiness",
    outcome:
      "Aplomo has provider-neutral integration boundaries for AWS, Azure, Google Cloud, Supabase, Vercel and future data platforms.",
    exitCriteria: [
      "Cloud connector contracts exist.",
      "Integration run records exist.",
      "Provider adapters are modular.",
      "No cloud provider lock-in is introduced.",
    ],
  },
  {
    id: "ui_productization",
    title: "UI Productization",
    outcome:
      "The depth of backend, data, governance and operations becomes visible to administrators, operators, analysts and investors.",
    exitCriteria: [
      "Admin panels cover backend capabilities.",
      "Gaps are visible.",
      "Exports and analytics are discoverable.",
      "Audit and data quality are not hidden.",
    ],
  },
  {
    id: "llm_provider_gateway",
    title: "LLM Provider Gateway",
    outcome:
      "External LLM calls are allowed only after prompts, context, sensitivity, audit and data quality are governed.",
    exitCriteria: [
      "Dry-run gateway exists.",
      "Approved prompt and packet are required.",
      "Provider calls are audited.",
      "Sensitive data policies are enforced.",
    ],
  },
] as const satisfies readonly AplomoBackendCompletionStage[];
