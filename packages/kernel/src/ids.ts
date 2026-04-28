import { assertNonEmptyString, type Brand } from "./brand.js";

export type OrganizationId = Brand<string, "OrganizationId">;
export type TenantId = Brand<string, "TenantId">;
export type TerminalId = Brand<string, "TerminalId">;
export type YardId = Brand<string, "YardId">;
export type ZoneId = Brand<string, "ZoneId">;
export type EntityId = Brand<string, "EntityId">;
export type AggregateId = Brand<string, "AggregateId">;
export type EventId = Brand<string, "EventId">;
export type UserId = Brand<string, "UserId">;
export type DeviceId = Brand<string, "DeviceId">;
export type EvidenceId = Brand<string, "EvidenceId">;
export type MeasurementSessionId = Brand<string, "MeasurementSessionId">;
export type SyncEnvelopeId = Brand<string, "SyncEnvelopeId">;
export type AuditEntryId = Brand<string, "AuditEntryId">;

function brandId<TId extends string>(value: string, label: string): Brand<string, TId> {
  assertNonEmptyString(value, label);
  return value as Brand<string, TId>;
}

export const asOrganizationId = (value: string): OrganizationId =>
  brandId<"OrganizationId">(value, "OrganizationId");

export const asTenantId = (value: string): TenantId =>
  brandId<"TenantId">(value, "TenantId");

export const asTerminalId = (value: string): TerminalId =>
  brandId<"TerminalId">(value, "TerminalId");

export const asYardId = (value: string): YardId =>
  brandId<"YardId">(value, "YardId");

export const asZoneId = (value: string): ZoneId =>
  brandId<"ZoneId">(value, "ZoneId");

export const asEntityId = (value: string): EntityId =>
  brandId<"EntityId">(value, "EntityId");

export const asAggregateId = (value: string): AggregateId =>
  brandId<"AggregateId">(value, "AggregateId");

export const asEventId = (value: string): EventId =>
  brandId<"EventId">(value, "EventId");

export const asUserId = (value: string): UserId =>
  brandId<"UserId">(value, "UserId");

export const asDeviceId = (value: string): DeviceId =>
  brandId<"DeviceId">(value, "DeviceId");

export const asEvidenceId = (value: string): EvidenceId =>
  brandId<"EvidenceId">(value, "EvidenceId");

export const asMeasurementSessionId = (value: string): MeasurementSessionId =>
  brandId<"MeasurementSessionId">(value, "MeasurementSessionId");

export const asSyncEnvelopeId = (value: string): SyncEnvelopeId =>
  brandId<"SyncEnvelopeId">(value, "SyncEnvelopeId");

export const asAuditEntryId = (value: string): AuditEntryId =>
  brandId<"AuditEntryId">(value, "AuditEntryId");
