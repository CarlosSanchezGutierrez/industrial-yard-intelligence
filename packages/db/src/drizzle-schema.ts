import {
  boolean,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

export interface GeoJsonGeometryPlaceholder {
  readonly type: string;
  readonly coordinates: unknown;
}

export interface JsonObject {
  readonly [key: string]: unknown;
}

export const coreSchema = pgSchema("core");
export const spatialSchema = pgSchema("spatial");
export const operationsSchema = pgSchema("operations");
export const syncSchema = pgSchema("sync");
export const mediaSchema = pgSchema("media");
export const auditSchema = pgSchema("audit");
export const analyticsSchema = pgSchema("analytics");

const id = () => uuid("id").primaryKey();
const tenantId = () => uuid("tenant_id").notNull();
const terminalId = () => uuid("terminal_id");
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull();
const updatedAt = () => timestamp("updated_at", { withTimezone: true });
const createdByUserId = () => uuid("created_by_user_id").notNull();
const createdByDeviceId = () => uuid("created_by_device_id").notNull();
const sourceRuntime = () => text("source_runtime").notNull();
const validationState = () => text("validation_state").notNull();
const confidenceLevel = () => text("confidence_level").notNull();
const payload = () => jsonb("payload").$type<JsonObject>().notNull();
const geometry = () => jsonb("geometry").$type<GeoJsonGeometryPlaceholder>().notNull();

export const tenantsTable = coreSchema.table("tenants", {
  id: id(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const terminalsTable = coreSchema.table("terminals", {
  id: id(),
  tenantId: tenantId(),
  name: text("name").notNull(),
  locationLabel: text("location_label"),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const usersTable = coreSchema.table("users", {
  id: id(),
  tenantId: tenantId(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  role: text("role").notNull(),
  active: boolean("active").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const devicesTable = coreSchema.table("devices", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  name: text("name").notNull(),
  deviceType: text("device_type").notNull(),
  active: boolean("active").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const yardsTable = spatialSchema.table("yards", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  name: text("name").notNull(),
  geometry: geometry(),
  validationState: validationState(),
  confidenceLevel: confidenceLevel(),
  createdByUserId: createdByUserId(),
  createdByDeviceId: createdByDeviceId(),
  sourceRuntime: sourceRuntime(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const zonesTable = spatialSchema.table("zones", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  yardId: uuid("yard_id").notNull(),
  name: text("name").notNull(),
  geometry: geometry(),
  validationState: validationState(),
  confidenceLevel: confidenceLevel(),
  createdByUserId: createdByUserId(),
  createdByDeviceId: createdByDeviceId(),
  sourceRuntime: sourceRuntime(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const materialsTable = operationsSchema.table("materials", {
  id: id(),
  tenantId: tenantId(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  defaultUnit: text("default_unit").notNull(),
  technicalProperties: jsonb("technical_properties").$type<JsonObject>().notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const equipmentTable = operationsSchema.table("equipment", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  name: text("name").notNull(),
  equipmentType: text("equipment_type").notNull(),
  status: text("status").notNull(),
  geometry: jsonb("geometry").$type<GeoJsonGeometryPlaceholder>(),
  createdByUserId: createdByUserId(),
  createdByDeviceId: createdByDeviceId(),
  sourceRuntime: sourceRuntime(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const infrastructureTable = operationsSchema.table("infrastructure", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  name: text("name").notNull(),
  infrastructureType: text("infrastructure_type").notNull(),
  geometry: geometry(),
  validationState: validationState(),
  confidenceLevel: confidenceLevel(),
  createdByUserId: createdByUserId(),
  createdByDeviceId: createdByDeviceId(),
  sourceRuntime: sourceRuntime(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const stockpilesTable = operationsSchema.table("stockpiles", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  materialId: uuid("material_id").notNull(),
  name: text("name").notNull(),
  estimatedQuantity: integer("estimated_quantity"),
  unit: text("unit").notNull(),
  geometry: geometry(),
  validationState: validationState(),
  confidenceLevel: confidenceLevel(),
  createdByUserId: createdByUserId(),
  createdByDeviceId: createdByDeviceId(),
  sourceRuntime: sourceRuntime(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const operationalEventsTable = operationsSchema.table("operational_events", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  eventType: text("event_type").notNull(),
  aggregateType: text("aggregate_type").notNull(),
  aggregateId: uuid("aggregate_id").notNull(),
  payload: payload(),
  createdByUserId: createdByUserId(),
  createdByDeviceId: createdByDeviceId(),
  sourceRuntime: sourceRuntime(),
  createdAt: createdAt()
});

export const syncBatchesTable = syncSchema.table("sync_batches", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  batchId: text("batch_id").notNull(),
  deviceId: uuid("device_id").notNull(),
  receivedAtEdge: timestamp("received_at_edge", { withTimezone: true }).notNull(),
  resultSummary: jsonb("result_summary").$type<JsonObject>().notNull(),
  createdAt: createdAt()
});

export const syncEventsTable = syncSchema.table("sync_events", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  eventId: text("event_id").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  localSequence: integer("local_sequence").notNull(),
  aggregateType: text("aggregate_type").notNull(),
  aggregateId: text("aggregate_id").notNull(),
  eventType: text("event_type").notNull(),
  eventVersion: integer("event_version").notNull(),
  syncStatus: text("sync_status").notNull(),
  conflictType: text("conflict_type"),
  payload: payload(),
  createdByUserId: createdByUserId(),
  createdByDeviceId: createdByDeviceId(),
  sourceRuntime: sourceRuntime(),
  createdAtClient: timestamp("created_at_client", { withTimezone: true }).notNull(),
  receivedAtEdge: timestamp("received_at_edge", { withTimezone: true }).notNull(),
  createdAt: createdAt()
});

export const evidenceItemsTable = mediaSchema.table("evidence_items", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  evidenceId: text("evidence_id").notNull(),
  evidenceType: text("evidence_type").notNull(),
  storageProvider: text("storage_provider").notNull(),
  storageKey: text("storage_key").notNull(),
  fileName: text("file_name"),
  mimeType: text("mime_type"),
  byteSize: integer("byte_size"),
  integrityHashAlgorithm: text("integrity_hash_algorithm"),
  integrityHashValue: text("integrity_hash_value"),
  relatedEntityId: text("related_entity_id"),
  relatedEventId: text("related_event_id"),
  relatedMeasurementSessionId: text("related_measurement_session_id"),
  createdByUserId: createdByUserId(),
  createdByDeviceId: createdByDeviceId(),
  sourceRuntime: sourceRuntime(),
  createdAt: createdAt()
});

export const measurementSessionsTable = spatialSchema.table("measurement_sessions", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  sourceType: text("source_type").notNull(),
  operatorUserId: uuid("operator_user_id").notNull(),
  deviceLabel: text("device_label"),
  rawEvidenceId: text("raw_evidence_id"),
  processedGeometry: geometry(),
  confidenceLevel: confidenceLevel(),
  validationState: validationState(),
  metadata: jsonb("metadata").$type<JsonObject>().notNull(),
  createdByUserId: createdByUserId(),
  createdByDeviceId: createdByDeviceId(),
  sourceRuntime: sourceRuntime(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const auditLogTable = auditSchema.table("audit_log", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  actionType: text("action_type").notNull(),
  affectedEntityId: text("affected_entity_id").notNull(),
  affectedEntityType: text("affected_entity_type").notNull(),
  previousValue: jsonb("previous_value").$type<JsonObject>(),
  newValue: jsonb("new_value").$type<JsonObject>().notNull(),
  result: text("result").notNull(),
  syncEventId: text("sync_event_id"),
  integrityHashValue: text("integrity_hash_value"),
  createdByUserId: createdByUserId(),
  createdByDeviceId: createdByDeviceId(),
  sourceRuntime: sourceRuntime(),
  createdAt: createdAt()
});

export const scenariosTable = analyticsSchema.table("scenarios", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  inputSnapshot: jsonb("input_snapshot").$type<JsonObject>().notNull(),
  outputSnapshot: jsonb("output_snapshot").$type<JsonObject>().notNull(),
  createdByUserId: createdByUserId(),
  createdByDeviceId: createdByDeviceId(),
  sourceRuntime: sourceRuntime(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const recommendationsTable = analyticsSchema.table("recommendations", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  title: text("title").notNull(),
  reason: text("reason").notNull(),
  severity: text("severity").notNull(),
  score: integer("score").notNull(),
  status: text("status").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const kpiSnapshotsTable = analyticsSchema.table("kpi_snapshots", {
  id: id(),
  tenantId: tenantId(),
  terminalId: terminalId(),
  kpiKey: text("kpi_key").notNull(),
  value: text("value").notNull(),
  classification: text("classification").notNull(),
  snapshotAt: timestamp("snapshot_at", { withTimezone: true }).notNull(),
  createdAt: createdAt()
});

export const drizzleTableRegistry = [
  { schema: "core", table: "tenants", object: tenantsTable },
  { schema: "core", table: "terminals", object: terminalsTable },
  { schema: "core", table: "users", object: usersTable },
  { schema: "core", table: "devices", object: devicesTable },
  { schema: "spatial", table: "yards", object: yardsTable },
  { schema: "spatial", table: "zones", object: zonesTable },
  { schema: "operations", table: "materials", object: materialsTable },
  { schema: "operations", table: "equipment", object: equipmentTable },
  { schema: "operations", table: "infrastructure", object: infrastructureTable },
  { schema: "operations", table: "stockpiles", object: stockpilesTable },
  { schema: "operations", table: "operational_events", object: operationalEventsTable },
  { schema: "sync", table: "sync_batches", object: syncBatchesTable },
  { schema: "sync", table: "sync_events", object: syncEventsTable },
  { schema: "media", table: "evidence_items", object: evidenceItemsTable },
  { schema: "spatial", table: "measurement_sessions", object: measurementSessionsTable },
  { schema: "audit", table: "audit_log", object: auditLogTable },
  { schema: "analytics", table: "scenarios", object: scenariosTable },
  { schema: "analytics", table: "recommendations", object: recommendationsTable },
  { schema: "analytics", table: "kpi_snapshots", object: kpiSnapshotsTable }
] as const;

export function getDrizzleTableIdentifiers(): readonly string[] {
  return drizzleTableRegistry.map((entry) => `${entry.schema}.${entry.table}`);
}