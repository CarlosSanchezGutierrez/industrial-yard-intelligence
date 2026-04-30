import type {
  AplomoIndustrialDeviceIntegrationProfile,
  AplomoIndustrialRawIngestEnvelope,
  AplomoProtocolFamily,
} from "@iyi/domain";

import type {
  AplomoApiResult,
  AplomoPagedResult,
  AplomoPageRequest,
} from "./aplomoCommon.js";

export type AplomoListIndustrialIntegrationProfilesRequest = AplomoPageRequest & {
  deviceType?: string;
  protocol?: AplomoProtocolFamily;
  requiresGateway?: boolean;
  supportsHighAccuracy?: boolean;
};

export type AplomoListIndustrialIntegrationProfilesResponse = AplomoApiResult<
  AplomoPagedResult<AplomoIndustrialDeviceIntegrationProfile>
>;

export type AplomoGetIndustrialIntegrationProfileRequest = {
  profileId: string;
};

export type AplomoGetIndustrialIntegrationProfileResponse = AplomoApiResult<{
  profile: AplomoIndustrialDeviceIntegrationProfile;
}>;

export type AplomoRegisterIndustrialAdapterRequest = {
  companyId: string;
  profileId: string;
  adapterName: string;
  deviceId?: string;
  enabled: boolean;
  credentialsRef?: string;
  configuration: Record<string, unknown>;
};

export type AplomoRegisterIndustrialAdapterResponse = AplomoApiResult<{
  adapterId: string;
  profileId: string;
  enabled: boolean;
}>;

export type AplomoIngestIndustrialRawPayloadRequest = {
  envelope: AplomoIndustrialRawIngestEnvelope;
};

export type AplomoIngestIndustrialRawPayloadResponse = AplomoApiResult<{
  accepted: boolean;
  normalizedEventId?: string;
  warnings: string[];
}>;

export const aplomoIndustrialIntegrationApiRoutes = {
  listProfiles: "GET /industrial-integrations/profiles",
  getProfile: "GET /industrial-integrations/profiles/:profileId",
  registerAdapter: "POST /industrial-integrations/adapters",
  ingestRawPayload: "POST /industrial-integrations/ingest/raw",
} as const;

export type AplomoIndustrialIntegrationApiRoute =
  (typeof aplomoIndustrialIntegrationApiRoutes)[keyof typeof aplomoIndustrialIntegrationApiRoutes];
