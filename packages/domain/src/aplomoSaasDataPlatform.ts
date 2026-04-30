import type {
  AplomoAiUsagePolicy,
  AplomoDataDomain,
  AplomoDataProductTier,
  AplomoDataSensitivity,
} from "./aplomoDataGovernance.js";

import type {
  AplomoDataDeliveryMode,
  AplomoDataExportFormat,
  AplomoDataIntegrationTarget,
} from "./aplomoDataInteroperability.js";

export const aplomoSaasResourceStatuses = [
  "draft",
  "active",
  "paused",
  "disabled",
  "archived",
  "failed",
] as const;

export type AplomoSaasResourceStatus =
  (typeof aplomoSaasResourceStatuses)[number];

export const aplomoExportJobStatuses = [
  "queued",
  "running",
  "ready",
  "failed",
  "expired",
  "cancelled",
] as const;

export type AplomoExportJobStatus = (typeof aplomoExportJobStatuses)[number];

export const aplomoConnectorKinds = [
  "spreadsheet_export",
  "bi_connector",
  "warehouse_sync",
  "lakehouse_sync",
  "object_storage_sync",
  "notebook_access",
  "llm_tooling",
  "webhook",
  "custom_api",
] as const;

export type AplomoConnectorKind = (typeof aplomoConnectorKinds)[number];

export const aplomoLlmProviderFamilies = [
  "openai",
  "gemini",
  "claude",
  "custom_llm",
] as const;

export type AplomoLlmProviderFamily =
  (typeof aplomoLlmProviderFamilies)[number];

export const aplomoLlmToolRiskLevels = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type AplomoLlmToolRiskLevel =
  (typeof aplomoLlmToolRiskLevels)[number];

export type AplomoDataProductDefinition = {
  id: string;
  companyId?: string;
  name: string;
  description: string;
  domains: AplomoDataDomain[];
  tier: AplomoDataProductTier;
  status: AplomoSaasResourceStatus;
  sensitivity: AplomoDataSensitivity;
  aiUsagePolicy: AplomoAiUsagePolicy;
  supportedFormats: AplomoDataExportFormat[];
  supportedDeliveryModes: AplomoDataDeliveryMode[];
  targetConsumers: AplomoDataIntegrationTarget[];
  requiresLineage: boolean;
  requiresQualityScore: boolean;
  requiresRedaction: boolean;
  minimumQualityScore: number;
  ownerTeam: string;
  createdAt: string;
  updatedAt: string;
};

export type AplomoDataExportJob = {
  id: string;
  companyId: string;
  dataProductId: string;
  requestedByProfileId?: string;
  target: AplomoDataIntegrationTarget;
  format: AplomoDataExportFormat;
  deliveryMode: AplomoDataDeliveryMode;
  status: AplomoExportJobStatus;
  includeLineage: boolean;
  includeQualityMetrics: boolean;
  includeAiPolicy: boolean;
  redactSensitiveFields: boolean;
  rowCount?: number;
  fileName?: string;
  signedUrl?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorMessage?: string;
};

export type AplomoExternalConnectorDefinition = {
  id: string;
  companyId: string;
  name: string;
  kind: AplomoConnectorKind;
  target: AplomoDataIntegrationTarget;
  status: AplomoSaasResourceStatus;
  dataProductIds: string[];
  deliveryMode: AplomoDataDeliveryMode;
  supportedFormats: AplomoDataExportFormat[];
  credentialsRef?: string;
  configuration: Record<string, unknown>;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AplomoLlmToolDefinition = {
  id: string;
  companyId?: string;
  name: string;
  description: string;
  providerFamily: AplomoLlmProviderFamily;
  status: AplomoSaasResourceStatus;
  allowedDataProductIds: string[];
  allowedDomains: AplomoDataDomain[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  requiresHumanApproval: boolean;
  requiresRedaction: boolean;
  maxSensitivityAllowed: AplomoDataSensitivity;
  riskLevel: AplomoLlmToolRiskLevel;
  auditRequired: boolean;
  createdAt: string;
  updatedAt: string;
};

export const createAplomoDataProductId = (
  name: string,
  tier: AplomoDataProductTier,
): string => {
  const cleanName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `aplomo.data_product.${tier}.${cleanName}`;
};

export const isAplomoExportReady = (job: AplomoDataExportJob): boolean => {
  return job.status === "ready" && Boolean(job.signedUrl || job.fileName);
};

export const isAplomoConnectorEnterpriseReady = (
  connector: AplomoExternalConnectorDefinition,
): boolean => {
  return (
    connector.status === "active" &&
    connector.dataProductIds.length > 0 &&
    Boolean(connector.credentialsRef || connector.kind === "spreadsheet_export")
  );
};

export const isAplomoLlmToolSafeForAutomation = (
  tool: AplomoLlmToolDefinition,
): boolean => {
  return (
    tool.status === "active" &&
    tool.auditRequired &&
    tool.requiresRedaction &&
    !tool.requiresHumanApproval &&
    (tool.riskLevel === "low" || tool.riskLevel === "medium")
  );
};

export const createAplomoDefaultDataProducts = (): AplomoDataProductDefinition[] => {
  const timestamp = new Date().toISOString();

  return [
    {
      id: createAplomoDataProductId("operational_device_health", "gold"),
      name: "Operational Device Health",
      description:
        "Curated device health, connectivity, GPS precision, alerts and operational scores.",
      domains: ["device", "connection", "telemetry", "audit", "analytics"],
      tier: "gold",
      status: "active",
      sensitivity: "confidential",
      aiUsagePolicy: "allowed_with_redaction",
      supportedFormats: ["csv", "json", "ndjson", "parquet"],
      supportedDeliveryModes: ["manual_download", "scheduled_export", "api_pull", "warehouse_sync"],
      targetConsumers: ["excel", "power_bi", "snowflake", "databricks", "jupyter", "custom_api"],
      requiresLineage: true,
      requiresQualityScore: true,
      requiresRedaction: true,
      minimumQualityScore: 0.8,
      ownerTeam: "Aplomo Data Platform",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: createAplomoDataProductId("ai_ready_yard_telemetry", "feature"),
      name: "AI Ready Yard Telemetry",
      description:
        "Feature-tier telemetry for supervised AI, agents, anomaly detection and operational copilots.",
      domains: ["telemetry", "gps_capture", "map", "route", "analytics", "ai"],
      tier: "feature",
      status: "active",
      sensitivity: "restricted",
      aiUsagePolicy: "allowed_with_redaction",
      supportedFormats: ["json", "ndjson", "parquet", "geojson"],
      supportedDeliveryModes: ["api_pull", "llm_tool_call", "lakehouse_sync", "notebook_query"],
      targetConsumers: ["openai", "gemini", "claude", "databricks", "jupyter", "custom_llm"],
      requiresLineage: true,
      requiresQualityScore: true,
      requiresRedaction: true,
      minimumQualityScore: 0.85,
      ownerTeam: "Aplomo AI Platform",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: createAplomoDataProductId("executive_operations_snapshot", "gold"),
      name: "Executive Operations Snapshot",
      description:
        "Executive-ready operational snapshot for BI dashboards, weekly reviews and customer reporting.",
      domains: ["company", "site", "yard", "device", "telemetry", "analytics"],
      tier: "gold",
      status: "active",
      sensitivity: "confidential",
      aiUsagePolicy: "allowed_with_redaction",
      supportedFormats: ["csv", "xlsx", "json", "sql"],
      supportedDeliveryModes: ["manual_download", "scheduled_export", "warehouse_sync", "api_pull"],
      targetConsumers: ["excel", "power_bi", "tableau", "looker", "snowflake", "custom_api"],
      requiresLineage: true,
      requiresQualityScore: true,
      requiresRedaction: true,
      minimumQualityScore: 0.8,
      ownerTeam: "Aplomo Business Operations",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
};
