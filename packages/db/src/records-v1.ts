export type DbJsonPrimitive = null | boolean | number | string;

export type DbJsonValue =
  | DbJsonPrimitive
  | readonly DbJsonValue[]
  | { readonly [key: string]: DbJsonValue };

export type DbRecordStatus = "active" | "inactive" | "archived";

export type DbUserRole = "operator" | "supervisor" | "admin" | "viewer";

export type DbDeviceKind = "web" | "android" | "edge" | "sensor" | "external";

export type DbDeviceStatus = "active" | "inactive" | "lost" | "archived";

export type DbStockpileStatus =
  | "draft"
  | "operational"
  | "pending_review"
  | "validated"
  | "archived";

export type DbZoneKind =
  | "stockpile_area"
  | "dock"
  | "warehouse"
  | "scale"
  | "route"
  | "restricted"
  | "other";

export type DbSyncEventStatus =
  | "accepted"
  | "conflict"
  | "rejected"
  | "invalid"
  | "duplicate"
  | "pending_review"
  | "superseded";

export type DbConflictResolutionDecision =
  | "accepted_after_review"
  | "rejected_after_review"
  | "manual_action_required";

export type DbAuditResult = "success" | "failure" | "conflict";

export interface DbBaseRecord {
  readonly id: string;
  readonly createdAt: string;
}

export interface DbMutableRecord extends DbBaseRecord {
  readonly updatedAt: string;
}

export interface DbTenantRecord extends DbMutableRecord {
  readonly name: string;
  readonly status: DbRecordStatus;
}

export interface DbTerminalRecord extends DbMutableRecord {
  readonly tenantId: string;
  readonly name: string;
  readonly timezone: string;
  readonly locationLabel: string;
}

export interface DbUserRecord extends DbMutableRecord {
  readonly tenantId: string;
  readonly displayName: string;
  readonly role: DbUserRole;
  readonly status: DbRecordStatus;
}

export interface DbDeviceRecord extends DbMutableRecord {
  readonly tenantId: string;
  readonly terminalId?: string;
  readonly label: string;
  readonly deviceKind: DbDeviceKind;
  readonly status: DbDeviceStatus;
  readonly lastSeenAt?: string;
}

export interface DbStockpileRecord extends DbMutableRecord {
  readonly tenantId: string;
  readonly terminalId: string;
  readonly name: string;
  readonly material: string;
  readonly category: string;
  readonly estimatedTons: number;
  readonly validationState: string;
  readonly confidenceLevel: string;
  readonly status: DbStockpileStatus;
}

export interface DbYardZoneRecord extends DbMutableRecord {
  readonly tenantId: string;
  readonly terminalId: string;
  readonly name: string;
  readonly zoneKind: DbZoneKind;
  readonly geometryGeojson: DbJsonValue;
  readonly status: DbRecordStatus;
}

export interface DbMeasurementRecord extends DbBaseRecord {
  readonly tenantId: string;
  readonly terminalId: string;
  readonly stockpileId?: string;
  readonly measurementSource: string;
  readonly quantity: number;
  readonly unit: string;
  readonly confidenceLevel: string;
  readonly measuredAt: string;
  readonly payload: DbJsonValue;
}

export interface DbSyncEventRecord extends DbBaseRecord {
  readonly tenantId: string;
  readonly terminalId?: string;
  readonly eventType: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly status: DbSyncEventStatus;
  readonly conflictType?: string;
  readonly idempotencyKey: string;
  readonly sourceRuntime: string;
  readonly userId: string;
  readonly deviceId: string;
  readonly validationState: string;
  readonly confidenceLevel?: string;
  readonly payload: DbJsonValue;
  readonly createdAtClient: string;
  readonly receivedAtEdge: string;
}

export interface DbConflictResolutionRecord extends DbBaseRecord {
  readonly tenantId: string;
  readonly syncEventId: string;
  readonly decision: DbConflictResolutionDecision;
  readonly note: string;
  readonly resolvedByUserId: string;
  readonly resolvedByDeviceId: string;
  readonly resolvedAt: string;
}

export interface DbAuditEntryRecord extends DbBaseRecord {
  readonly tenantId: string;
  readonly terminalId?: string;
  readonly actionType: string;
  readonly affectedEntityType: string;
  readonly affectedEntityId: string;
  readonly result: DbAuditResult;
  readonly sourceRuntime: string;
  readonly userId: string;
  readonly deviceId: string;
  readonly previousHash: string | null;
  readonly integrityHash: string;
  readonly hashAlgorithm: "sha256";
  readonly payload: DbJsonValue;
}

export interface DbEvidenceItemRecord extends DbBaseRecord {
  readonly tenantId: string;
  readonly terminalId?: string;
  readonly evidenceKind: string;
  readonly storageProvider: string;
  readonly storageKey: string;
  readonly fileName?: string;
  readonly mimeType?: string;
  readonly relatedEntityId?: string;
  readonly relatedEventId?: string;
  readonly ownerUserId: string;
  readonly ownerDeviceId: string;
  readonly sourceRuntime: string;
  readonly hashAlgorithm: "sha256";
  readonly hashValue: string;
  readonly byteSize: number;
  readonly immutable: boolean;
  readonly contentPreview?: string;
  readonly registeredAt: string;
}

export interface DbRecordMap {
  readonly app_tenants: DbTenantRecord;
  readonly terminals: DbTerminalRecord;
  readonly app_users: DbUserRecord;
  readonly devices: DbDeviceRecord;
  readonly stockpiles: DbStockpileRecord;
  readonly yard_zones: DbYardZoneRecord;
  readonly measurements: DbMeasurementRecord;
  readonly sync_events: DbSyncEventRecord;
  readonly conflict_resolutions: DbConflictResolutionRecord;
  readonly audit_entries: DbAuditEntryRecord;
  readonly evidence_items: DbEvidenceItemRecord;
}

export type DbAnyRecord = DbRecordMap[keyof DbRecordMap];

export function hasTenantId(record: DbAnyRecord): record is DbAnyRecord & { readonly tenantId: string } {
  return "tenantId" in record && typeof record.tenantId === "string";
}

export function assertNonEmptyRecordId(id: string): string {
  const normalized = id.trim();

  if (normalized.length === 0) {
    throw new Error("DB record id must not be empty.");
  }

  return normalized;
}

export function assertIsoDateString(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (normalized.length === 0 || Number.isNaN(Date.parse(normalized))) {
    throw new Error(`${fieldName} must be an ISO-compatible date string.`);
  }

  return normalized;
}