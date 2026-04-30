import type {
  AplomoDataContract,
  AplomoDataDomain,
  AplomoDataQualityMetric,
  AplomoGovernanceEnvelope,
} from "@iyi/domain";

import type {
  AplomoApiResult,
  AplomoPagedResult,
  AplomoPageRequest,
} from "./aplomoCommon.js";

export type AplomoRegisterDataContractRequest = {
  contract: AplomoDataContract;
};

export type AplomoRegisterDataContractResponse = AplomoApiResult<{
  contract: AplomoDataContract;
}>;

export type AplomoListDataContractsRequest = AplomoPageRequest & {
  domain?: AplomoDataDomain;
  entityName?: string;
  tier?: AplomoDataContract["tier"];
  sensitivity?: AplomoDataContract["sensitivity"];
};

export type AplomoListDataContractsResponse = AplomoApiResult<
  AplomoPagedResult<AplomoDataContract>
>;

export type AplomoValidateGovernedEventRequest<TPayload = Record<string, unknown>> = {
  envelope: AplomoGovernanceEnvelope<TPayload>;
};

export type AplomoValidateGovernedEventResponse = AplomoApiResult<{
  accepted: boolean;
  qualityScore: number;
  blockingFailures: AplomoDataQualityMetric[];
  warnings: string[];
}>;

export type AplomoIngestGovernedEventRequest<TPayload = Record<string, unknown>> = {
  envelope: AplomoGovernanceEnvelope<TPayload>;
};

export type AplomoIngestGovernedEventResponse = AplomoApiResult<{
  eventId: string;
  accepted: boolean;
  storedAt: string;
}>;

export const aplomoDataGovernanceApiRoutes = {
  registerDataContract: "POST /data-contracts",
  listDataContracts: "GET /data-contracts",
  validateGovernedEvent: "POST /governance/events/validate",
  ingestGovernedEvent: "POST /governance/events/ingest",
} as const;

export type AplomoDataGovernanceApiRoute =
  (typeof aplomoDataGovernanceApiRoutes)[keyof typeof aplomoDataGovernanceApiRoutes];
