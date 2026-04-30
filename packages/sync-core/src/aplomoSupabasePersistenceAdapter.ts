import type {
  AplomoDataExportJob,
  AplomoDataProductDefinition,
  AplomoExternalConnectorDefinition,
  AplomoLlmToolDefinition,
} from "@iyi/domain";

import type { AplomoInMemoryDeviceTelemetrySnapshot } from "./aplomoInMemoryDeviceTelemetryStore.js";
import type { AplomoGovernedTelemetryOutput } from "./aplomoGovernedDeviceSimulator.js";
import type { AplomoOperationalAlert } from "./aplomoOperationalAlertEngine.js";

import type {
  AplomoConnectorListRequest,
  AplomoDataPlatformRepositoryPort,
  AplomoDataProductListRequest,
  AplomoExportJobListRequest,
  AplomoGovernedEventListRequest,
  AplomoGovernedEventRepositoryPort,
  AplomoLlmToolListRequest,
  AplomoOperationalIntelligenceRepositoryPort,
  AplomoPersistedGovernedTelemetryEvent,
  AplomoPersistedOperationalScoreSnapshot,
  AplomoPersistenceAdapter,
  AplomoPersistenceHealth,
  AplomoRepositoryPage,
  AplomoRepositoryPageRequest,
  AplomoTelemetryPersistencePort,
} from "./aplomoPersistencePorts.js";

type AplomoSupabaseError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

type AplomoSupabaseResult<TData = unknown> = {
  data: TData | null;
  error: AplomoSupabaseError | null;
  count?: number | null;
};

export type AplomoSupabaseQuery<TData = unknown> =
  PromiseLike<AplomoSupabaseResult<TData>> & {
    select(columns?: string, options?: Record<string, unknown>): AplomoSupabaseQuery<TData>;
    insert(values: unknown, options?: Record<string, unknown>): AplomoSupabaseQuery<TData>;
    upsert(values: unknown, options?: Record<string, unknown>): AplomoSupabaseQuery<TData>;
    update(values: unknown): AplomoSupabaseQuery<TData>;
    delete(): AplomoSupabaseQuery<TData>;
    eq(column: string, value: unknown): AplomoSupabaseQuery<TData>;
    neq(column: string, value: unknown): AplomoSupabaseQuery<TData>;
    gte(column: string, value: unknown): AplomoSupabaseQuery<TData>;
    lte(column: string, value: unknown): AplomoSupabaseQuery<TData>;
    order(column: string, options?: Record<string, unknown>): AplomoSupabaseQuery<TData>;
    range(from: number, to: number): AplomoSupabaseQuery<TData>;
    limit(count: number): AplomoSupabaseQuery<TData>;
    single(): AplomoSupabaseQuery<TData>;
    maybeSingle(): AplomoSupabaseQuery<TData>;
  };

export type AplomoSupabaseClientLike = {
  from(table: string): AplomoSupabaseQuery<unknown>;
};

type JsonRecord = Record<string, unknown>;

const nowIso = (): string => new Date().toISOString();

const readJsonRecord = (value: unknown): JsonRecord => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
  }

  return {};
};

const readJsonArray = (value: unknown): unknown[] => {
  return Array.isArray(value) ? value : [];
};

const readStringArray = (value: unknown): string[] => {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
};

const assertNoError = (result: AplomoSupabaseResult<unknown>, context: string): void => {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
};

const runRows = async <TRow>(
  query: AplomoSupabaseQuery<unknown>,
  context: string,
): Promise<TRow[]> => {
  const result = await query;
  assertNoError(result, context);

  return Array.isArray(result.data) ? (result.data as TRow[]) : [];
};

const runMaybeSingle = async <TRow>(
  query: AplomoSupabaseQuery<unknown>,
  context: string,
): Promise<TRow | null> => {
  const result = await query;
  assertNoError(result, context);

  return (result.data as TRow | null) ?? null;
};

const runMutation = async (
  query: AplomoSupabaseQuery<unknown>,
  context: string,
): Promise<void> => {
  const result = await query;
  assertNoError(result, context);
};

const safeLimit = (limit: number | undefined): number => {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return 50;
  }

  return Math.max(1, Math.min(Math.floor(limit), 500));
};

const applyRange = (
  query: AplomoSupabaseQuery<unknown>,
  request: AplomoRepositoryPageRequest,
): AplomoSupabaseQuery<unknown> => {
  const limit = safeLimit(request.limit);
  const start = Math.max(0, Number.parseInt(request.cursor ?? "0", 10) || 0);

  return query.range(start, start + limit);
};

const pageFromRows = <TItem>(
  rows: TItem[],
  request: AplomoRepositoryPageRequest,
): AplomoRepositoryPage<TItem> => {
  const limit = safeLimit(request.limit);
  const hasMore = rows.length > limit;
  const start = Math.max(0, Number.parseInt(request.cursor ?? "0", 10) || 0);

  const page: AplomoRepositoryPage<TItem>["page"] = {
    limit,
    hasMore,
  };

  if (hasMore) {
    page.nextCursor = String(start + limit);
  }

  return {
    items: rows.slice(0, limit),
    page,
  };
};

const clearTable = async (
  client: AplomoSupabaseClientLike,
  table: string,
): Promise<void> => {
  await runMutation(
    client.from(table).delete().neq("id", "__aplomo_never__"),
    `clear ${table}`,
  );
};

type Row = Record<string, unknown>;

const mapDeviceRow = (row: Row): AplomoInMemoryDeviceTelemetrySnapshot["devices"][number] => {
  const device: Record<string, unknown> = {
    id: String(row.id),
    companyId: String(row.company_id),
    name: String(row.name),
    type: String(row.type),
    status: String(row.status ?? "active"),
    capabilities: readStringArray(row.capabilities),
    metadata: readJsonRecord(row.metadata),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };

  if (typeof row.site_id === "string") {
    device.siteId = row.site_id;
  }

  if (typeof row.serial_number === "string") {
    device.serialNumber = row.serial_number;
  }

  if (typeof row.external_identifier === "string") {
    device.externalIdentifier = row.external_identifier;
  }

  return device as AplomoInMemoryDeviceTelemetrySnapshot["devices"][number];
};

const mapSessionRow = (row: Row): AplomoInMemoryDeviceTelemetrySnapshot["sessions"][number] => {
  const session: Record<string, unknown> = {
    id: String(row.id),
    companyId: String(row.company_id),
    deviceId: String(row.device_id),
    status: String(row.status ?? "active"),
    metadata: readJsonRecord(row.metadata),
    startedAt: String(row.started_at),
    lastSeenAt: String(row.last_seen_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };

  if (typeof row.profile_id === "string") {
    session.profileId = row.profile_id;
  }

  if (typeof row.ip_address === "string") {
    session.ipAddress = row.ip_address;
  }

  if (typeof row.user_agent === "string") {
    session.userAgent = row.user_agent;
  }

  if (typeof row.app_version === "string") {
    session.appVersion = row.app_version;
  }

  if (typeof row.platform === "string") {
    session.platform = row.platform;
  }

  if (typeof row.ended_at === "string") {
    session.endedAt = row.ended_at;
  }

  return session as AplomoInMemoryDeviceTelemetrySnapshot["sessions"][number];
};

const mapConnectionRow = (row: Row): AplomoInMemoryDeviceTelemetrySnapshot["connections"][number] => {
  const connection: Record<string, unknown> = {
    id: String(row.id),
    companyId: String(row.company_id),
    deviceId: String(row.device_id),
    connectionType: String(row.connection_type),
    role: String(row.role),
    status: String(row.status ?? "online"),
    metadata: readJsonRecord(row.metadata),
    startedAt: String(row.started_at),
    lastSeenAt: String(row.last_seen_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };

  if (typeof row.session_id === "string") {
    connection.sessionId = row.session_id;
  }

  if (typeof row.protocol === "string") {
    connection.protocol = row.protocol;
  }

  if (typeof row.remote_address === "string") {
    connection.remoteAddress = row.remote_address;
  }

  if (typeof row.closed_at === "string") {
    connection.closedAt = row.closed_at;
  }

  return connection as AplomoInMemoryDeviceTelemetrySnapshot["connections"][number];
};

const mapTelemetryRow = (row: Row): AplomoInMemoryDeviceTelemetrySnapshot["telemetryEvents"][number] => {
  const event: Record<string, unknown> = {
    id: String(row.id),
    companyId: String(row.company_id),
    deviceId: String(row.device_id),
    eventType: String(row.event_type ?? "gps_position"),
    source: String(row.source),
    capturedAt: String(row.captured_at),
    receivedAt: String(row.received_at),
    createdAt: String(row.created_at),
  };

  if (typeof row.session_id === "string") {
    event.sessionId = row.session_id;
  }

  if (row.position) {
    event.position = row.position;
  }

  if (row.quality) {
    event.quality = row.quality;
  }

  if (row.raw_payload) {
    event.rawPayload = row.raw_payload;
  }

  return event as AplomoInMemoryDeviceTelemetrySnapshot["telemetryEvents"][number];
};

const mapLatestPositionRow = (row: Row): AplomoInMemoryDeviceTelemetrySnapshot["latestPositions"][number] => {
  const position: Record<string, unknown> = {
    id: String(row.id),
    companyId: String(row.company_id),
    deviceId: String(row.device_id),
    source: String(row.source),
    status: String(row.status ?? "fresh"),
    position: row.position,
    updatedAt: String(row.updated_at),
  };

  if (row.quality) {
    position.quality = row.quality;
  }

  if (typeof row.telemetry_event_id === "string") {
    position.telemetryEventId = row.telemetry_event_id;
  }

  return position as AplomoInMemoryDeviceTelemetrySnapshot["latestPositions"][number];
};

const toDeviceRow = (
  device: AplomoInMemoryDeviceTelemetrySnapshot["devices"][number],
): Row => ({
  id: device.id,
  company_id: device.companyId,
  site_id: device.siteId ?? null,
  name: device.name,
  type: device.type,
  status: device.status,
  capabilities: device.capabilities,
  serial_number: device.serialNumber ?? null,
  external_identifier: device.externalIdentifier ?? null,
  metadata: device.metadata ?? {},
  created_at: device.createdAt,
  updated_at: device.updatedAt,
});

const toGovernedEventRow = (
  item: AplomoGovernedTelemetryOutput,
): Row => ({
  id: item.event.id,
  company_id: item.event.companyId,
  device_id: item.event.deviceId,
  event_name: item.envelope.eventName,
  event_version: item.envelope.eventVersion,
  domain: item.envelope.domain,
  producer: item.envelope.producer,
  occurred_at: item.envelope.occurredAt,
  ingested_at: item.envelope.ingestedAt,
  data_contract_id: item.envelope.governance.dataContractId,
  sensitivity: item.envelope.governance.sensitivity,
  tier: item.envelope.governance.tier,
  ai_usage_policy: item.envelope.governance.aiUsagePolicy,
  quality: item.envelope.governance.quality,
  lineage: item.envelope.governance.lineage,
  retention_days: item.envelope.governance.retentionDays,
  tags: item.envelope.governance.tags,
  payload: item.event,
  envelope: item.envelope,
});

const mapGovernedEventRow = (row: Row): AplomoPersistedGovernedTelemetryEvent => ({
  persistedAt: String(row.persisted_at),
  tenantPartitionKey: String(row.company_id),
  version: 1,
  event: {
    event: row.payload,
    envelope: row.envelope,
  } as AplomoGovernedTelemetryOutput,
});

const toAlertRow = (
  companyId: string,
  alert: AplomoOperationalAlert,
): Row => ({
  id: alert.id,
  company_id: companyId,
  device_id: alert.deviceId ?? null,
  severity: alert.severity,
  category: alert.category,
  title: alert.title,
  message: alert.message,
  detected_at: alert.detectedAt,
  source: alert.source,
  recommended_action: alert.recommendedAction,
  data_quality_impact: alert.dataQualityImpact,
  ai_readiness_impact: alert.aiReadinessImpact,
  evidence: alert.evidence,
});

const mapAlertRow = (row: Row): AplomoOperationalAlert => {
  const alert: Record<string, unknown> = {
    id: String(row.id),
    severity: String(row.severity),
    category: String(row.category),
    title: String(row.title),
    message: String(row.message),
    detectedAt: String(row.detected_at),
    source: String(row.source ?? "rule_engine"),
    recommendedAction: String(row.recommended_action),
    dataQualityImpact: String(row.data_quality_impact),
    aiReadinessImpact: String(row.ai_readiness_impact),
    evidence: readJsonArray(row.evidence),
  };

  if (typeof row.device_id === "string") {
    alert.deviceId = row.device_id;
  }

  return alert as AplomoOperationalAlert;
};

const toDataProductRow = (item: AplomoDataProductDefinition): Row => ({
  id: item.id,
  company_id: item.companyId ?? null,
  name: item.name,
  description: item.description,
  domains: item.domains,
  tier: item.tier,
  status: item.status,
  sensitivity: item.sensitivity,
  ai_usage_policy: item.aiUsagePolicy,
  supported_formats: item.supportedFormats,
  supported_delivery_modes: item.supportedDeliveryModes,
  target_consumers: item.targetConsumers,
  requires_lineage: item.requiresLineage,
  requires_quality_score: item.requiresQualityScore,
  requires_redaction: item.requiresRedaction,
  minimum_quality_score: item.minimumQualityScore,
  owner_team: item.ownerTeam,
  created_at: item.createdAt,
  updated_at: item.updatedAt,
});

const mapDataProductRow = (row: Row): AplomoDataProductDefinition => {
  const item: Record<string, unknown> = {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    domains: readStringArray(row.domains),
    tier: String(row.tier),
    status: String(row.status),
    sensitivity: String(row.sensitivity),
    aiUsagePolicy: String(row.ai_usage_policy),
    supportedFormats: readStringArray(row.supported_formats),
    supportedDeliveryModes: readStringArray(row.supported_delivery_modes),
    targetConsumers: readStringArray(row.target_consumers),
    requiresLineage: Boolean(row.requires_lineage),
    requiresQualityScore: Boolean(row.requires_quality_score),
    requiresRedaction: Boolean(row.requires_redaction),
    minimumQualityScore: Number(row.minimum_quality_score ?? 0),
    ownerTeam: String(row.owner_team),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };

  if (typeof row.company_id === "string") {
    item.companyId = row.company_id;
  }

  return item as AplomoDataProductDefinition;
};

const toExportJobRow = (job: AplomoDataExportJob): Row => ({
  id: job.id,
  company_id: job.companyId,
  data_product_id: job.dataProductId,
  requested_by_profile_id: job.requestedByProfileId ?? null,
  target: job.target,
  format: job.format,
  delivery_mode: job.deliveryMode,
  status: job.status,
  include_lineage: job.includeLineage,
  include_quality_metrics: job.includeQualityMetrics,
  include_ai_policy: job.includeAiPolicy,
  redact_sensitive_fields: job.redactSensitiveFields,
  row_count: job.rowCount ?? null,
  file_name: job.fileName ?? null,
  signed_url: job.signedUrl ?? null,
  expires_at: job.expiresAt ?? null,
  created_at: job.createdAt,
  updated_at: job.updatedAt,
  completed_at: job.completedAt ?? null,
  error_message: job.errorMessage ?? null,
});

const mapExportJobRow = (row: Row): AplomoDataExportJob => {
  const job: Record<string, unknown> = {
    id: String(row.id),
    companyId: String(row.company_id),
    dataProductId: String(row.data_product_id),
    target: String(row.target),
    format: String(row.format),
    deliveryMode: String(row.delivery_mode),
    status: String(row.status),
    includeLineage: Boolean(row.include_lineage),
    includeQualityMetrics: Boolean(row.include_quality_metrics),
    includeAiPolicy: Boolean(row.include_ai_policy),
    redactSensitiveFields: Boolean(row.redact_sensitive_fields),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };

  if (typeof row.requested_by_profile_id === "string") {
    job.requestedByProfileId = row.requested_by_profile_id;
  }

  if (typeof row.row_count === "number") {
    job.rowCount = row.row_count;
  }

  if (typeof row.file_name === "string") {
    job.fileName = row.file_name;
  }

  if (typeof row.signed_url === "string") {
    job.signedUrl = row.signed_url;
  }

  if (typeof row.expires_at === "string") {
    job.expiresAt = row.expires_at;
  }

  if (typeof row.completed_at === "string") {
    job.completedAt = row.completed_at;
  }

  if (typeof row.error_message === "string") {
    job.errorMessage = row.error_message;
  }

  return job as AplomoDataExportJob;
};

const toConnectorRow = (connector: AplomoExternalConnectorDefinition): Row => ({
  id: connector.id,
  company_id: connector.companyId,
  name: connector.name,
  kind: connector.kind,
  target: connector.target,
  status: connector.status,
  data_product_ids: connector.dataProductIds,
  delivery_mode: connector.deliveryMode,
  supported_formats: connector.supportedFormats,
  credentials_ref: connector.credentialsRef ?? null,
  configuration: connector.configuration,
  last_sync_at: connector.lastSyncAt ?? null,
  created_at: connector.createdAt,
  updated_at: connector.updatedAt,
});

const mapConnectorRow = (row: Row): AplomoExternalConnectorDefinition => {
  const connector: Record<string, unknown> = {
    id: String(row.id),
    companyId: String(row.company_id),
    name: String(row.name),
    kind: String(row.kind),
    target: String(row.target),
    status: String(row.status),
    dataProductIds: readStringArray(row.data_product_ids),
    deliveryMode: String(row.delivery_mode),
    supportedFormats: readStringArray(row.supported_formats),
    configuration: readJsonRecord(row.configuration),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };

  if (typeof row.credentials_ref === "string") {
    connector.credentialsRef = row.credentials_ref;
  }

  if (typeof row.last_sync_at === "string") {
    connector.lastSyncAt = row.last_sync_at;
  }

  return connector as AplomoExternalConnectorDefinition;
};

const toLlmToolRow = (tool: AplomoLlmToolDefinition): Row => ({
  id: tool.id,
  company_id: tool.companyId ?? null,
  name: tool.name,
  description: tool.description,
  provider_family: tool.providerFamily,
  status: tool.status,
  allowed_data_product_ids: tool.allowedDataProductIds,
  allowed_domains: tool.allowedDomains,
  input_schema: tool.inputSchema,
  output_schema: tool.outputSchema,
  requires_human_approval: tool.requiresHumanApproval,
  requires_redaction: tool.requiresRedaction,
  max_sensitivity_allowed: tool.maxSensitivityAllowed,
  risk_level: tool.riskLevel,
  audit_required: tool.auditRequired,
  created_at: tool.createdAt,
  updated_at: tool.updatedAt,
});

const mapLlmToolRow = (row: Row): AplomoLlmToolDefinition => {
  const tool: Record<string, unknown> = {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    providerFamily: String(row.provider_family),
    status: String(row.status),
    allowedDataProductIds: readStringArray(row.allowed_data_product_ids),
    allowedDomains: readStringArray(row.allowed_domains),
    inputSchema: readJsonRecord(row.input_schema),
    outputSchema: readJsonRecord(row.output_schema),
    requiresHumanApproval: Boolean(row.requires_human_approval),
    requiresRedaction: Boolean(row.requires_redaction),
    maxSensitivityAllowed: String(row.max_sensitivity_allowed),
    riskLevel: String(row.risk_level),
    auditRequired: Boolean(row.audit_required),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };

  if (typeof row.company_id === "string") {
    tool.companyId = row.company_id;
  }

  return tool as AplomoLlmToolDefinition;
};

export class AplomoSupabaseTelemetryPersistencePort
  implements AplomoTelemetryPersistencePort
{
  constructor(private readonly client: AplomoSupabaseClientLike) {}

  async getSnapshot(): Promise<AplomoInMemoryDeviceTelemetrySnapshot> {
    const [devices, sessions, connections, telemetryEvents, latestPositions] =
      await Promise.all([
        runRows<Row>(
          this.client.from("aplomo_devices").select("*"),
          "select aplomo_devices",
        ),
        runRows<Row>(
          this.client.from("aplomo_device_sessions").select("*"),
          "select aplomo_device_sessions",
        ),
        runRows<Row>(
          this.client.from("aplomo_device_connections").select("*"),
          "select aplomo_device_connections",
        ),
        runRows<Row>(
          this.client.from("aplomo_telemetry_events").select("*"),
          "select aplomo_telemetry_events",
        ),
        runRows<Row>(
          this.client.from("aplomo_latest_device_positions").select("*"),
          "select aplomo_latest_device_positions",
        ),
      ]);

    return {
      devices: devices.map(mapDeviceRow),
      sessions: sessions.map(mapSessionRow),
      connections: connections.map(mapConnectionRow),
      telemetryEvents: telemetryEvents.map(mapTelemetryRow),
      latestPositions: latestPositions.map(mapLatestPositionRow),
    };
  }

  async replaceSnapshot(snapshot: AplomoInMemoryDeviceTelemetrySnapshot): Promise<void> {
    if (snapshot.devices.length > 0) {
      await runMutation(
        this.client.from("aplomo_devices").upsert(snapshot.devices.map(toDeviceRow)),
        "upsert aplomo_devices",
      );
    }
  }

  async clear(): Promise<void> {
    await clearTable(this.client, "aplomo_latest_device_positions");
    await clearTable(this.client, "aplomo_telemetry_events");
    await clearTable(this.client, "aplomo_device_connections");
    await clearTable(this.client, "aplomo_device_sessions");
    await clearTable(this.client, "aplomo_devices");
  }
}

export class AplomoSupabaseGovernedEventRepository
  implements AplomoGovernedEventRepositoryPort
{
  constructor(private readonly client: AplomoSupabaseClientLike) {}

  async append(
    event: AplomoGovernedTelemetryOutput,
  ): Promise<AplomoPersistedGovernedTelemetryEvent> {
    await runMutation(
      this.client.from("aplomo_governed_events").upsert(toGovernedEventRow(event)),
      "upsert aplomo_governed_events",
    );

    return {
      event,
      persistedAt: nowIso(),
      tenantPartitionKey: event.event.companyId,
      version: 1,
    };
  }

  async appendMany(
    events: AplomoGovernedTelemetryOutput[],
  ): Promise<AplomoPersistedGovernedTelemetryEvent[]> {
    if (events.length === 0) {
      return [];
    }

    await runMutation(
      this.client.from("aplomo_governed_events").upsert(events.map(toGovernedEventRow)),
      "upsert aplomo_governed_events batch",
    );

    return events.map((event) => ({
      event,
      persistedAt: nowIso(),
      tenantPartitionKey: event.event.companyId,
      version: 1,
    }));
  }

  async list(
    request: AplomoGovernedEventListRequest,
  ): Promise<AplomoRepositoryPage<AplomoPersistedGovernedTelemetryEvent>> {
    let query = this.client
      .from("aplomo_governed_events")
      .select("*")
      .order("occurred_at", { ascending: false });

    if (request.companyId) {
      query = query.eq("company_id", request.companyId);
    }

    if (request.deviceId) {
      query = query.eq("device_id", request.deviceId);
    }

    if (request.eventName) {
      query = query.eq("event_name", request.eventName);
    }

    if (request.fromOccurredAt) {
      query = query.gte("occurred_at", request.fromOccurredAt);
    }

    if (request.toOccurredAt) {
      query = query.lte("occurred_at", request.toOccurredAt);
    }

    const rows = await runRows<Row>(
      applyRange(query, request),
      "list aplomo_governed_events",
    );

    return pageFromRows(rows.map(mapGovernedEventRow), request);
  }

  async count(companyId?: string): Promise<number> {
    let query = this.client
      .from("aplomo_governed_events")
      .select("id", { count: "exact", head: true });

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const result = await query;
    assertNoError(result, "count aplomo_governed_events");

    return result.count ?? 0;
  }

  async clear(): Promise<void> {
    await clearTable(this.client, "aplomo_governed_events");
  }
}

export class AplomoSupabaseOperationalIntelligenceRepository
  implements AplomoOperationalIntelligenceRepositoryPort
{
  constructor(private readonly client: AplomoSupabaseClientLike) {}

  async saveAlerts(companyId: string, alerts: AplomoOperationalAlert[]): Promise<void> {
    if (alerts.length === 0) {
      return;
    }

    await runMutation(
      this.client.from("aplomo_operational_alerts").upsert(
        alerts.map((alert) => toAlertRow(companyId, alert)),
      ),
      "upsert aplomo_operational_alerts",
    );
  }

  async listAlerts(companyId: string): Promise<AplomoOperationalAlert[]> {
    const rows = await runRows<Row>(
      this.client
        .from("aplomo_operational_alerts")
        .select("*")
        .eq("company_id", companyId)
        .order("detected_at", { ascending: false }),
      "list aplomo_operational_alerts",
    );

    return rows.map(mapAlertRow);
  }

  async saveScoreSnapshot(
    snapshot: AplomoPersistedOperationalScoreSnapshot,
  ): Promise<void> {
    await runMutation(
      this.client.from("aplomo_operational_score_snapshots").insert({
        id: snapshot.id,
        company_id: snapshot.companyId,
        site_id: snapshot.siteId ?? null,
        generated_at: snapshot.generatedAt,
        site_score: snapshot.siteScore,
        device_scores: snapshot.deviceScores,
      }),
      "insert aplomo_operational_score_snapshots",
    );
  }

  async listScoreSnapshots(
    companyId: string,
  ): Promise<AplomoPersistedOperationalScoreSnapshot[]> {
    const rows = await runRows<Row>(
      this.client
        .from("aplomo_operational_score_snapshots")
        .select("*")
        .eq("company_id", companyId)
        .order("generated_at", { ascending: false }),
      "list aplomo_operational_score_snapshots",
    );

    return rows.map((row) => {
      const snapshot: Record<string, unknown> = {
        id: String(row.id),
        companyId: String(row.company_id),
        generatedAt: String(row.generated_at),
        siteScore: row.site_score,
        deviceScores: readJsonArray(row.device_scores),
      };

      if (typeof row.site_id === "string") {
        snapshot.siteId = row.site_id;
      }

      return snapshot as AplomoPersistedOperationalScoreSnapshot;
    });
  }

  async clear(): Promise<void> {
    await clearTable(this.client, "aplomo_operational_alerts");
    await clearTable(this.client, "aplomo_operational_score_snapshots");
  }
}

export class AplomoSupabaseDataPlatformRepository
  implements AplomoDataPlatformRepositoryPort
{
  constructor(private readonly client: AplomoSupabaseClientLike) {}

  async upsertDataProduct(
    dataProduct: AplomoDataProductDefinition,
  ): Promise<AplomoDataProductDefinition> {
    await runMutation(
      this.client.from("aplomo_data_products").upsert(toDataProductRow(dataProduct)),
      "upsert aplomo_data_products",
    );

    return dataProduct;
  }

  async listDataProducts(
    request: AplomoDataProductListRequest,
  ): Promise<AplomoRepositoryPage<AplomoDataProductDefinition>> {
    let query = this.client
      .from("aplomo_data_products")
      .select("*")
      .order("name", { ascending: true });

    if (request.status) {
      query = query.eq("status", request.status);
    }

    const rows = await runRows<Row>(
      applyRange(query, request),
      "list aplomo_data_products",
    );

    const items = rows
      .map(mapDataProductRow)
      .filter((item) => !request.companyId || !item.companyId || item.companyId === request.companyId)
      .filter((item) => !request.targetConsumer || item.targetConsumers.includes(request.targetConsumer))
      .filter((item) => {
        const search = request.search?.trim().toLowerCase();

        if (!search) {
          return true;
        }

        return (
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search) ||
          item.id.toLowerCase().includes(search)
        );
      });

    return pageFromRows(items, request);
  }

  async getDataProduct(dataProductId: string): Promise<AplomoDataProductDefinition | null> {
    const row = await runMaybeSingle<Row>(
      this.client
        .from("aplomo_data_products")
        .select("*")
        .eq("id", dataProductId)
        .maybeSingle(),
      "get aplomo_data_products",
    );

    return row ? mapDataProductRow(row) : null;
  }

  async createExportJob(job: AplomoDataExportJob): Promise<AplomoDataExportJob> {
    await runMutation(
      this.client.from("aplomo_export_jobs").insert(toExportJobRow(job)),
      "insert aplomo_export_jobs",
    );

    return job;
  }

  async updateExportJob(job: AplomoDataExportJob): Promise<AplomoDataExportJob> {
    await runMutation(
      this.client.from("aplomo_export_jobs").upsert(toExportJobRow(job)),
      "upsert aplomo_export_jobs",
    );

    return job;
  }

  async listExportJobs(
    request: AplomoExportJobListRequest,
  ): Promise<AplomoRepositoryPage<AplomoDataExportJob>> {
    let query = this.client
      .from("aplomo_export_jobs")
      .select("*")
      .eq("company_id", request.companyId)
      .order("created_at", { ascending: false });

    if (request.dataProductId) {
      query = query.eq("data_product_id", request.dataProductId);
    }

    if (request.status) {
      query = query.eq("status", request.status);
    }

    if (request.target) {
      query = query.eq("target", request.target);
    }

    const rows = await runRows<Row>(
      applyRange(query, request),
      "list aplomo_export_jobs",
    );

    return pageFromRows(rows.map(mapExportJobRow), request);
  }

  async getExportJob(
    companyId: string,
    exportJobId: string,
  ): Promise<AplomoDataExportJob | null> {
    const row = await runMaybeSingle<Row>(
      this.client
        .from("aplomo_export_jobs")
        .select("*")
        .eq("company_id", companyId)
        .eq("id", exportJobId)
        .maybeSingle(),
      "get aplomo_export_jobs",
    );

    return row ? mapExportJobRow(row) : null;
  }

  async upsertConnector(
    connector: AplomoExternalConnectorDefinition,
  ): Promise<AplomoExternalConnectorDefinition> {
    await runMutation(
      this.client.from("aplomo_external_connectors").upsert(toConnectorRow(connector)),
      "upsert aplomo_external_connectors",
    );

    return connector;
  }

  async listConnectors(
    request: AplomoConnectorListRequest,
  ): Promise<AplomoRepositoryPage<AplomoExternalConnectorDefinition>> {
    let query = this.client
      .from("aplomo_external_connectors")
      .select("*")
      .eq("company_id", request.companyId)
      .order("name", { ascending: true });

    if (request.status) {
      query = query.eq("status", request.status);
    }

    if (request.target) {
      query = query.eq("target", request.target);
    }

    const rows = await runRows<Row>(
      applyRange(query, request),
      "list aplomo_external_connectors",
    );

    return pageFromRows(rows.map(mapConnectorRow), request);
  }

  async getConnector(
    companyId: string,
    connectorId: string,
  ): Promise<AplomoExternalConnectorDefinition | null> {
    const row = await runMaybeSingle<Row>(
      this.client
        .from("aplomo_external_connectors")
        .select("*")
        .eq("company_id", companyId)
        .eq("id", connectorId)
        .maybeSingle(),
      "get aplomo_external_connectors",
    );

    return row ? mapConnectorRow(row) : null;
  }

  async upsertLlmTool(tool: AplomoLlmToolDefinition): Promise<AplomoLlmToolDefinition> {
    await runMutation(
      this.client.from("aplomo_llm_tools").upsert(toLlmToolRow(tool)),
      "upsert aplomo_llm_tools",
    );

    return tool;
  }

  async listLlmTools(
    request: AplomoLlmToolListRequest,
  ): Promise<AplomoRepositoryPage<AplomoLlmToolDefinition>> {
    let query = this.client
      .from("aplomo_llm_tools")
      .select("*")
      .order("name", { ascending: true });

    if (request.providerFamily) {
      query = query.eq("provider_family", request.providerFamily);
    }

    if (request.status) {
      query = query.eq("status", request.status);
    }

    const rows = await runRows<Row>(
      applyRange(query, request),
      "list aplomo_llm_tools",
    );

    const items = rows
      .map(mapLlmToolRow)
      .filter((tool) => !request.companyId || !tool.companyId || tool.companyId === request.companyId);

    return pageFromRows(items, request);
  }

  async getLlmTool(toolId: string): Promise<AplomoLlmToolDefinition | null> {
    const row = await runMaybeSingle<Row>(
      this.client
        .from("aplomo_llm_tools")
        .select("*")
        .eq("id", toolId)
        .maybeSingle(),
      "get aplomo_llm_tools",
    );

    return row ? mapLlmToolRow(row) : null;
  }
}

export class AplomoSupabasePersistenceAdapter implements AplomoPersistenceAdapter {
  readonly driver = "supabase" as const;
  readonly telemetry: AplomoTelemetryPersistencePort;
  readonly governedEvents: AplomoGovernedEventRepositoryPort;
  readonly operationalIntelligence: AplomoOperationalIntelligenceRepositoryPort;
  readonly dataPlatform: AplomoDataPlatformRepositoryPort;

  constructor(private readonly client: AplomoSupabaseClientLike) {
    this.telemetry = new AplomoSupabaseTelemetryPersistencePort(client);
    this.governedEvents = new AplomoSupabaseGovernedEventRepository(client);
    this.operationalIntelligence =
      new AplomoSupabaseOperationalIntelligenceRepository(client);
    this.dataPlatform = new AplomoSupabaseDataPlatformRepository(client);
  }

  async health(): Promise<AplomoPersistenceHealth> {
    try {
      const result = await this.client
        .from("aplomo_companies")
        .select("id", { count: "exact", head: true });

      assertNoError(result, "health aplomo_companies");

      return {
        driver: this.driver,
        status: "ok",
        checkedAt: nowIso(),
        details: {
          companies: result.count ?? 0,
          reachable: true,
        },
      };
    } catch (error) {
      return {
        driver: this.driver,
        status: "down",
        checkedAt: nowIso(),
        details: {
          reachable: false,
        },
        errorMessage: error instanceof Error ? error.message : "Unknown Supabase error",
      };
    }
  }
}

export const createAplomoSupabasePersistenceAdapter = (
  client: AplomoSupabaseClientLike,
): AplomoSupabasePersistenceAdapter => {
  return new AplomoSupabasePersistenceAdapter(client);
};
