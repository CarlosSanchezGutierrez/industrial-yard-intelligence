export const dbSchemaVersion = "2026_04_28_0001_core_schema" as const;

export const dbTableNames = [
  "app_tenants",
  "terminals",
  "app_users",
  "devices",
  "stockpiles",
  "yard_zones",
  "measurements",
  "sync_events",
  "conflict_resolutions",
  "audit_entries",
  "evidence_items"
] as const;

export type DbTableName = (typeof dbTableNames)[number];

export interface DbMigration {
  readonly id: string;
  readonly description: string;
  readonly statements: readonly string[];
}

export const coreSchemaStatements = [
  `CREATE TABLE IF NOT EXISTS app_tenants (
    id text PRIMARY KEY,
    name text NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS terminals (
    id text PRIMARY KEY,
    tenant_id text NOT NULL REFERENCES app_tenants(id),
    name text NOT NULL,
    timezone text NOT NULL DEFAULT 'America/Monterrey',
    location_label text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS app_users (
    id text PRIMARY KEY,
    tenant_id text NOT NULL REFERENCES app_tenants(id),
    display_name text NOT NULL,
    role text NOT NULL CHECK (role IN ('operator', 'supervisor', 'admin', 'viewer')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS devices (
    id text PRIMARY KEY,
    tenant_id text NOT NULL REFERENCES app_tenants(id),
    terminal_id text REFERENCES terminals(id),
    label text NOT NULL,
    device_kind text NOT NULL CHECK (device_kind IN ('web', 'android', 'edge', 'sensor', 'external')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lost', 'archived')),
    last_seen_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS stockpiles (
    id text PRIMARY KEY,
    tenant_id text NOT NULL REFERENCES app_tenants(id),
    terminal_id text NOT NULL REFERENCES terminals(id),
    name text NOT NULL,
    material text NOT NULL,
    category text NOT NULL,
    estimated_tons numeric(14, 3) NOT NULL DEFAULT 0,
    validation_state text NOT NULL,
    confidence_level text NOT NULL,
    status text NOT NULL DEFAULT 'operational' CHECK (status IN ('draft', 'operational', 'pending_review', 'validated', 'archived')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS yard_zones (
    id text PRIMARY KEY,
    tenant_id text NOT NULL REFERENCES app_tenants(id),
    terminal_id text NOT NULL REFERENCES terminals(id),
    name text NOT NULL,
    zone_kind text NOT NULL CHECK (zone_kind IN ('stockpile_area', 'dock', 'warehouse', 'scale', 'route', 'restricted', 'other')),
    geometry_geojson jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS measurements (
    id text PRIMARY KEY,
    tenant_id text NOT NULL REFERENCES app_tenants(id),
    terminal_id text NOT NULL REFERENCES terminals(id),
    stockpile_id text REFERENCES stockpiles(id),
    measurement_source text NOT NULL,
    quantity numeric(14, 3) NOT NULL,
    unit text NOT NULL DEFAULT 'ton',
    confidence_level text NOT NULL,
    measured_at timestamptz NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS sync_events (
    id text PRIMARY KEY,
    tenant_id text NOT NULL REFERENCES app_tenants(id),
    terminal_id text REFERENCES terminals(id),
    event_type text NOT NULL,
    aggregate_type text NOT NULL,
    aggregate_id text NOT NULL,
    status text NOT NULL CHECK (status IN ('accepted', 'conflict', 'rejected', 'invalid', 'duplicate', 'pending_review', 'superseded')),
    conflict_type text,
    idempotency_key text NOT NULL,
    source_runtime text NOT NULL,
    user_id text NOT NULL,
    device_id text NOT NULL,
    validation_state text NOT NULL,
    confidence_level text,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at_client timestamptz NOT NULL,
    received_at_edge timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, idempotency_key)
  );`,

  `CREATE TABLE IF NOT EXISTS conflict_resolutions (
    id text PRIMARY KEY,
    tenant_id text NOT NULL REFERENCES app_tenants(id),
    sync_event_id text NOT NULL REFERENCES sync_events(id),
    decision text NOT NULL CHECK (decision IN ('accepted_after_review', 'rejected_after_review', 'manual_action_required')),
    note text NOT NULL,
    resolved_by_user_id text NOT NULL,
    resolved_by_device_id text NOT NULL,
    resolved_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (sync_event_id)
  );`,

  `CREATE TABLE IF NOT EXISTS audit_entries (
    id text PRIMARY KEY,
    tenant_id text NOT NULL REFERENCES app_tenants(id),
    terminal_id text REFERENCES terminals(id),
    action_type text NOT NULL,
    affected_entity_type text NOT NULL,
    affected_entity_id text NOT NULL,
    result text NOT NULL CHECK (result IN ('success', 'failure', 'conflict')),
    source_runtime text NOT NULL,
    user_id text NOT NULL,
    device_id text NOT NULL,
    previous_hash text,
    integrity_hash text NOT NULL UNIQUE,
    hash_algorithm text NOT NULL DEFAULT 'sha256',
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS evidence_items (
    id text PRIMARY KEY,
    tenant_id text NOT NULL REFERENCES app_tenants(id),
    terminal_id text REFERENCES terminals(id),
    evidence_kind text NOT NULL,
    storage_provider text NOT NULL,
    storage_key text NOT NULL,
    file_name text,
    mime_type text,
    related_entity_id text,
    related_event_id text,
    owner_user_id text NOT NULL,
    owner_device_id text NOT NULL,
    source_runtime text NOT NULL,
    hash_algorithm text NOT NULL DEFAULT 'sha256',
    hash_value text NOT NULL,
    byte_size integer NOT NULL CHECK (byte_size >= 0),
    immutable boolean NOT NULL DEFAULT true,
    content_preview text,
    created_at timestamptz NOT NULL,
    registered_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, hash_value)
  );`
] as const;

export const coreSchemaIndexes = [
  `CREATE INDEX IF NOT EXISTS idx_terminals_tenant_id ON terminals(tenant_id);`,
  `CREATE INDEX IF NOT EXISTS idx_app_users_tenant_id ON app_users(tenant_id);`,
  `CREATE INDEX IF NOT EXISTS idx_devices_tenant_terminal ON devices(tenant_id, terminal_id);`,
  `CREATE INDEX IF NOT EXISTS idx_stockpiles_tenant_terminal ON stockpiles(tenant_id, terminal_id);`,
  `CREATE INDEX IF NOT EXISTS idx_yard_zones_tenant_terminal ON yard_zones(tenant_id, terminal_id);`,
  `CREATE INDEX IF NOT EXISTS idx_measurements_stockpile_id ON measurements(stockpile_id);`,
  `CREATE INDEX IF NOT EXISTS idx_measurements_measured_at ON measurements(measured_at);`,
  `CREATE INDEX IF NOT EXISTS idx_sync_events_tenant_status ON sync_events(tenant_id, status);`,
  `CREATE INDEX IF NOT EXISTS idx_sync_events_aggregate ON sync_events(aggregate_type, aggregate_id);`,
  `CREATE INDEX IF NOT EXISTS idx_conflict_resolutions_sync_event_id ON conflict_resolutions(sync_event_id);`,
  `CREATE INDEX IF NOT EXISTS idx_audit_entries_tenant_created_at ON audit_entries(tenant_id, created_at);`,
  `CREATE INDEX IF NOT EXISTS idx_evidence_items_tenant_registered_at ON evidence_items(tenant_id, registered_at);`
] as const;

export const coreSchemaMigration: DbMigration = {
  id: dbSchemaVersion,
  description: "Core Industrial Yard Intelligence relational schema.",
  statements: [...coreSchemaStatements, ...coreSchemaIndexes]
};

export function getCoreSchemaSql(): string {
  return `${coreSchemaMigration.statements.join("\n\n")}\n`;
}

export function getRequiredCoreTableNames(): readonly DbTableName[] {
  return [...dbTableNames];
}

export function isKnownDbTableName(value: string): value is DbTableName {
  return (dbTableNames as readonly string[]).includes(value);
}

export function assertKnownDbTableName(value: string): DbTableName {
  if (!isKnownDbTableName(value)) {
    throw new Error(`Unknown DB table name: ${value}`);
  }

  return value;
}