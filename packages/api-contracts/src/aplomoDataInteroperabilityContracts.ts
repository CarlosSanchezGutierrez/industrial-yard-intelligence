import type {
  AplomoDataConsumerType,
  AplomoDataExportFormat,
  AplomoDataIntegrationTarget,
  AplomoDataInteroperabilityProfile,
} from "@iyi/domain";

import type {
  AplomoApiResult,
  AplomoPagedResult,
  AplomoPageRequest,
} from "./aplomoCommon.js";

export type AplomoListDataInteroperabilityProfilesRequest = AplomoPageRequest & {
  consumerType?: AplomoDataConsumerType;
  target?: AplomoDataIntegrationTarget;
  format?: AplomoDataExportFormat;
  enterpriseReady?: boolean;
};

export type AplomoListDataInteroperabilityProfilesResponse = AplomoApiResult<
  AplomoPagedResult<AplomoDataInteroperabilityProfile>
>;

export type AplomoCreateDataExportRequest = {
  companyId: string;
  target: AplomoDataIntegrationTarget;
  format: AplomoDataExportFormat;
  domain: string;
  from?: string;
  to?: string;
  includeLineage: boolean;
  includeQualityMetrics: boolean;
  redactSensitiveFields: boolean;
};

export type AplomoCreateDataExportResponse = AplomoApiResult<{
  exportId: string;
  status: "queued" | "running" | "ready" | "failed";
  signedUrl?: string;
}>;

export type AplomoRegisterExternalDataConsumerRequest = {
  companyId: string;
  target: AplomoDataIntegrationTarget;
  name: string;
  enabled: boolean;
  configuration: Record<string, unknown>;
  credentialsRef?: string;
};

export type AplomoRegisterExternalDataConsumerResponse = AplomoApiResult<{
  consumerId: string;
  target: AplomoDataIntegrationTarget;
  enabled: boolean;
}>;

export const aplomoDataInteroperabilityApiRoutes = {
  listProfiles: "GET /data-interoperability/profiles",
  createExport: "POST /data-interoperability/exports",
  registerConsumer: "POST /data-interoperability/consumers",
} as const;

export type AplomoDataInteroperabilityApiRoute =
  (typeof aplomoDataInteroperabilityApiRoutes)[keyof typeof aplomoDataInteroperabilityApiRoutes];
