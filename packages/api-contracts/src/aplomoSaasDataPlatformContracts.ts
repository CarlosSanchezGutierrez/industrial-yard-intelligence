import type {
  AplomoConnectorKind,
  AplomoDataExportJob,
  AplomoDataProductDefinition,
  AplomoExportJobStatus,
  AplomoExternalConnectorDefinition,
  AplomoLlmProviderFamily,
  AplomoLlmToolDefinition,
  AplomoSaasResourceStatus,
  AplomoDataDeliveryMode,
  AplomoDataExportFormat,
  AplomoDataIntegrationTarget,
} from "@iyi/domain";

import type {
  AplomoApiResult,
  AplomoPagedResult,
  AplomoPageRequest,
} from "./aplomoCommon.js";

export type AplomoListDataProductsRequest = AplomoPageRequest & {
  companyId?: string;
  status?: AplomoSaasResourceStatus;
  tier?: AplomoDataProductDefinition["tier"];
  targetConsumer?: AplomoDataIntegrationTarget;
  search?: string;
};

export type AplomoListDataProductsResponse = AplomoApiResult<
  AplomoPagedResult<AplomoDataProductDefinition>
>;

export type AplomoGetDataProductRequest = {
  dataProductId: string;
  companyId?: string;
};

export type AplomoGetDataProductResponse = AplomoApiResult<{
  dataProduct: AplomoDataProductDefinition;
}>;

export type AplomoCreateDataExportJobRequest = {
  companyId: string;
  dataProductId: string;
  requestedByProfileId?: string;
  target: AplomoDataIntegrationTarget;
  format: AplomoDataExportFormat;
  deliveryMode: AplomoDataDeliveryMode;
  includeLineage: boolean;
  includeQualityMetrics: boolean;
  includeAiPolicy: boolean;
  redactSensitiveFields: boolean;
  filters?: Record<string, unknown>;
};

export type AplomoCreateDataExportJobResponse = AplomoApiResult<{
  job: AplomoDataExportJob;
}>;

export type AplomoGetDataExportJobRequest = {
  companyId: string;
  exportJobId: string;
};

export type AplomoGetDataExportJobResponse = AplomoApiResult<{
  job: AplomoDataExportJob;
}>;

export type AplomoListDataExportJobsRequest = AplomoPageRequest & {
  companyId: string;
  dataProductId?: string;
  status?: AplomoExportJobStatus;
  target?: AplomoDataIntegrationTarget;
};

export type AplomoListDataExportJobsResponse = AplomoApiResult<
  AplomoPagedResult<AplomoDataExportJob>
>;

export type AplomoRegisterExternalConnectorRequest = {
  companyId: string;
  name: string;
  kind: AplomoConnectorKind;
  target: AplomoDataIntegrationTarget;
  dataProductIds: string[];
  deliveryMode: AplomoDataDeliveryMode;
  supportedFormats: AplomoDataExportFormat[];
  credentialsRef?: string;
  configuration: Record<string, unknown>;
};

export type AplomoRegisterExternalConnectorResponse = AplomoApiResult<{
  connector: AplomoExternalConnectorDefinition;
}>;

export type AplomoListExternalConnectorsRequest = AplomoPageRequest & {
  companyId: string;
  kind?: AplomoConnectorKind;
  target?: AplomoDataIntegrationTarget;
  status?: AplomoSaasResourceStatus;
};

export type AplomoListExternalConnectorsResponse = AplomoApiResult<
  AplomoPagedResult<AplomoExternalConnectorDefinition>
>;

export type AplomoTestExternalConnectorRequest = {
  companyId: string;
  connectorId: string;
};

export type AplomoTestExternalConnectorResponse = AplomoApiResult<{
  connectorId: string;
  reachable: boolean;
  testedAt: string;
  warnings: string[];
}>;

export type AplomoTriggerConnectorSyncRequest = {
  companyId: string;
  connectorId: string;
  dataProductId?: string;
  dryRun?: boolean;
};

export type AplomoTriggerConnectorSyncResponse = AplomoApiResult<{
  syncId: string;
  connectorId: string;
  status: "queued" | "running" | "completed" | "failed";
  dryRun: boolean;
}>;

export type AplomoListLlmToolsRequest = AplomoPageRequest & {
  companyId?: string;
  providerFamily?: AplomoLlmProviderFamily;
  status?: AplomoSaasResourceStatus;
};

export type AplomoListLlmToolsResponse = AplomoApiResult<
  AplomoPagedResult<AplomoLlmToolDefinition>
>;

export type AplomoInvokeLlmToolRequest = {
  companyId: string;
  toolId: string;
  providerFamily: AplomoLlmProviderFamily;
  requestedByProfileId?: string;
  input: Record<string, unknown>;
  dryRun?: boolean;
  humanApprovalToken?: string;
};

export type AplomoInvokeLlmToolResponse = AplomoApiResult<{
  invocationId: string;
  toolId: string;
  providerFamily: AplomoLlmProviderFamily;
  status: "accepted" | "requires_human_approval" | "blocked" | "failed";
  output?: Record<string, unknown>;
  auditEventId?: string;
  warnings: string[];
}>;

export const aplomoSaasDataPlatformApiRoutes = {
  listDataProducts: "GET /data-products",
  getDataProduct: "GET /data-products/:dataProductId",
  createExportJob: "POST /exports",
  getExportJob: "GET /exports/:exportJobId",
  listExportJobs: "GET /exports",
  registerConnector: "POST /connectors",
  listConnectors: "GET /connectors",
  testConnector: "POST /connectors/:connectorId/test",
  triggerConnectorSync: "POST /connectors/:connectorId/sync",
  listLlmTools: "GET /llm-tools",
  invokeLlmTool: "POST /llm-tools/:toolId/invoke",
} as const;

export type AplomoSaasDataPlatformApiRoute =
  (typeof aplomoSaasDataPlatformApiRoutes)[keyof typeof aplomoSaasDataPlatformApiRoutes];
