import type {
  AplomoDataDomain,
  AplomoDataProductTier,
  AplomoDataSensitivity,
  AplomoAiUsagePolicy,
} from "./aplomoDataGovernance.js";

export const aplomoDataConsumerTypes = [
  "spreadsheet",
  "bi_dashboard",
  "data_warehouse",
  "lakehouse",
  "data_lake",
  "ml_platform",
  "llm_provider",
  "notebook",
  "reverse_etl",
  "api_consumer",
  "webhook",
] as const;

export type AplomoDataConsumerType = (typeof aplomoDataConsumerTypes)[number];

export const aplomoDataExportFormats = [
  "csv",
  "xlsx",
  "json",
  "ndjson",
  "parquet",
  "geojson",
  "delta",
  "iceberg",
  "sql",
  "webhook_json",
] as const;

export type AplomoDataExportFormat = (typeof aplomoDataExportFormats)[number];

export const aplomoDataDeliveryModes = [
  "manual_download",
  "scheduled_export",
  "api_pull",
  "webhook_push",
  "streaming",
  "warehouse_sync",
  "lakehouse_sync",
  "notebook_query",
  "llm_tool_call",
] as const;

export type AplomoDataDeliveryMode = (typeof aplomoDataDeliveryModes)[number];

export const aplomoDataAuthPatterns = [
  "none",
  "api_key",
  "oauth",
  "service_account",
  "signed_url",
  "warehouse_credentials",
  "managed_secret",
] as const;

export type AplomoDataAuthPattern = (typeof aplomoDataAuthPatterns)[number];

export const aplomoDataIntegrationTargets = [
  "excel",
  "power_bi",
  "tableau",
  "looker",
  "snowflake",
  "databricks",
  "bigquery",
  "postgres",
  "s3",
  "azure_blob",
  "gcs",
  "jupyter",
  "python",
  "openai",
  "gemini",
  "claude",
  "custom_llm",
  "custom_api",
  "webhook",
] as const;

export type AplomoDataIntegrationTarget =
  (typeof aplomoDataIntegrationTargets)[number];

export type AplomoDataInteroperabilityProfile = {
  id: string;
  target: AplomoDataIntegrationTarget;
  consumerType: AplomoDataConsumerType;
  label: string;
  description: string;
  supportedDomains: AplomoDataDomain[];
  supportedFormats: AplomoDataExportFormat[];
  deliveryModes: AplomoDataDeliveryMode[];
  authPatterns: AplomoDataAuthPattern[];
  recommendedTier: AplomoDataProductTier;
  minimumSensitivityAllowed: AplomoDataSensitivity;
  aiUsagePolicy: AplomoAiUsagePolicy;
  requiresDataContract: boolean;
  requiresLineage: boolean;
  requiresQualityScore: boolean;
  requiresRedaction: boolean;
  enterpriseReady: boolean;
};

const makeProfile = (
  target: AplomoDataIntegrationTarget,
  consumerType: AplomoDataConsumerType,
  label: string,
  description: string,
  options: {
    supportedDomains: AplomoDataDomain[];
    supportedFormats: AplomoDataExportFormat[];
    deliveryModes: AplomoDataDeliveryMode[];
    authPatterns: AplomoDataAuthPattern[];
    recommendedTier: AplomoDataProductTier;
    minimumSensitivityAllowed?: AplomoDataSensitivity;
    aiUsagePolicy?: AplomoAiUsagePolicy;
    requiresDataContract?: boolean;
    requiresLineage?: boolean;
    requiresQualityScore?: boolean;
    requiresRedaction?: boolean;
    enterpriseReady?: boolean;
  },
): AplomoDataInteroperabilityProfile => {
  return {
    id: `aplomo.data_interop.${target}.v1`,
    target,
    consumerType,
    label,
    description,
    supportedDomains: options.supportedDomains,
    supportedFormats: options.supportedFormats,
    deliveryModes: options.deliveryModes,
    authPatterns: options.authPatterns,
    recommendedTier: options.recommendedTier,
    minimumSensitivityAllowed: options.minimumSensitivityAllowed ?? "internal",
    aiUsagePolicy: options.aiUsagePolicy ?? "allowed_with_redaction",
    requiresDataContract: options.requiresDataContract ?? true,
    requiresLineage: options.requiresLineage ?? true,
    requiresQualityScore: options.requiresQualityScore ?? true,
    requiresRedaction: options.requiresRedaction ?? true,
    enterpriseReady: options.enterpriseReady ?? false,
  };
};

export const createAplomoDefaultDataInteroperabilityProfiles = () => {
  const operationalDomains: AplomoDataDomain[] = [
    "device",
    "connection",
    "telemetry",
    "gps_capture",
    "evidence",
    "map",
    "route",
    "material",
    "audit",
    "analytics",
  ];

  return [
    makeProfile(
      "excel",
      "spreadsheet",
      "Excel",
      "Exports simples para analistas, validación operativa y revisión manual.",
      {
        supportedDomains: operationalDomains,
        supportedFormats: ["csv", "xlsx"],
        deliveryModes: ["manual_download", "scheduled_export"],
        authPatterns: ["signed_url"],
        recommendedTier: "silver",
        enterpriseReady: true,
      },
    ),
    makeProfile(
      "power_bi",
      "bi_dashboard",
      "Power BI",
      "Dataset curado para dashboards ejecutivos y operación industrial.",
      {
        supportedDomains: operationalDomains,
        supportedFormats: ["csv", "json", "sql"],
        deliveryModes: ["api_pull", "scheduled_export", "warehouse_sync"],
        authPatterns: ["oauth", "service_account", "api_key"],
        recommendedTier: "gold",
        enterpriseReady: true,
      },
    ),
    makeProfile(
      "snowflake",
      "data_warehouse",
      "Snowflake",
      "Integración de data warehouse para clientes enterprise y analítica avanzada.",
      {
        supportedDomains: operationalDomains,
        supportedFormats: ["parquet", "sql", "ndjson"],
        deliveryModes: ["warehouse_sync", "scheduled_export"],
        authPatterns: ["warehouse_credentials", "managed_secret"],
        recommendedTier: "gold",
        enterpriseReady: true,
      },
    ),
    makeProfile(
      "databricks",
      "lakehouse",
      "Databricks",
      "Lakehouse para ingeniería de datos, machine learning y pipelines de features.",
      {
        supportedDomains: operationalDomains,
        supportedFormats: ["parquet", "delta", "ndjson"],
        deliveryModes: ["lakehouse_sync", "scheduled_export", "notebook_query"],
        authPatterns: ["service_account", "managed_secret"],
        recommendedTier: "feature",
        enterpriseReady: true,
      },
    ),
    makeProfile(
      "jupyter",
      "notebook",
      "Jupyter / Python",
      "Acceso para científicos de datos, notebooks, exploración y modelado.",
      {
        supportedDomains: operationalDomains,
        supportedFormats: ["csv", "json", "ndjson", "parquet", "geojson"],
        deliveryModes: ["api_pull", "manual_download", "notebook_query"],
        authPatterns: ["api_key", "signed_url"],
        recommendedTier: "silver",
        enterpriseReady: true,
      },
    ),
    makeProfile(
      "openai",
      "llm_provider",
      "OpenAI-compatible LLM",
      "Capa futura para copilotos, agentes, análisis operativo y automatización.",
      {
        supportedDomains: ["telemetry", "gps_capture", "evidence", "map", "route", "audit", "analytics", "ai"],
        supportedFormats: ["json", "ndjson"],
        deliveryModes: ["llm_tool_call", "api_pull"],
        authPatterns: ["api_key", "managed_secret"],
        recommendedTier: "feature",
        aiUsagePolicy: "allowed_with_redaction",
        requiresRedaction: true,
        enterpriseReady: true,
      },
    ),
    makeProfile(
      "gemini",
      "llm_provider",
      "Gemini-compatible LLM",
      "Capa futura para análisis multimodal, agentes y asistencia operacional.",
      {
        supportedDomains: ["telemetry", "gps_capture", "evidence", "map", "route", "audit", "analytics", "ai"],
        supportedFormats: ["json", "ndjson"],
        deliveryModes: ["llm_tool_call", "api_pull"],
        authPatterns: ["api_key", "managed_secret"],
        recommendedTier: "feature",
        aiUsagePolicy: "allowed_with_redaction",
        requiresRedaction: true,
        enterpriseReady: true,
      },
    ),
    makeProfile(
      "claude",
      "llm_provider",
      "Claude-compatible LLM",
      "Capa futura para razonamiento, agentes, documentación y análisis de operación.",
      {
        supportedDomains: ["telemetry", "gps_capture", "evidence", "map", "route", "audit", "analytics", "ai"],
        supportedFormats: ["json", "ndjson"],
        deliveryModes: ["llm_tool_call", "api_pull"],
        authPatterns: ["api_key", "managed_secret"],
        recommendedTier: "feature",
        aiUsagePolicy: "allowed_with_redaction",
        requiresRedaction: true,
        enterpriseReady: true,
      },
    ),
    makeProfile(
      "custom_api",
      "api_consumer",
      "API externa",
      "Integración genérica para ERPs, sistemas internos, clientes enterprise o partners.",
      {
        supportedDomains: operationalDomains,
        supportedFormats: ["json", "webhook_json"],
        deliveryModes: ["api_pull", "webhook_push"],
        authPatterns: ["api_key", "oauth", "managed_secret"],
        recommendedTier: "silver",
        enterpriseReady: true,
      },
    ),
  ];
};

export const getAplomoDataInteropProfilesByConsumerType = (
  consumerType: AplomoDataConsumerType,
): AplomoDataInteroperabilityProfile[] => {
  return createAplomoDefaultDataInteroperabilityProfiles().filter(
    (profile) => profile.consumerType === consumerType,
  );
};

export const isAplomoEnterpriseDataTarget = (
  profile: AplomoDataInteroperabilityProfile,
): boolean => {
  return profile.enterpriseReady && profile.requiresDataContract && profile.requiresLineage;
};
