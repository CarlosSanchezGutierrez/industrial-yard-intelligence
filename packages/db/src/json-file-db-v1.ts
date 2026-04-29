import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type {
  DbAuditEntryRecord,
  DbConflictResolutionRecord,
  DbDeviceRecord,
  DbEvidenceItemRecord,
  DbMeasurementRecord,
  DbStockpileRecord,
  DbTenantRecord,
  DbTerminalRecord,
  DbUserRecord,
  DbYardZoneRecord,
  DbSyncEventRecord
} from "./records-v1.js";
import type {
  DbRepositorySet,
  DbTransactionContext,
  DbUnitOfWork
} from "./repositories-v1.js";
import { InMemoryDbRepository } from "./repositories-v1.js";

export interface JsonFileDbTablesSnapshot {
  readonly app_tenants: readonly DbTenantRecord[];
  readonly terminals: readonly DbTerminalRecord[];
  readonly app_users: readonly DbUserRecord[];
  readonly devices: readonly DbDeviceRecord[];
  readonly stockpiles: readonly DbStockpileRecord[];
  readonly yard_zones: readonly DbYardZoneRecord[];
  readonly measurements: readonly DbMeasurementRecord[];
  readonly sync_events: readonly DbSyncEventRecord[];
  readonly conflict_resolutions: readonly DbConflictResolutionRecord[];
  readonly audit_entries: readonly DbAuditEntryRecord[];
  readonly evidence_items: readonly DbEvidenceItemRecord[];
}

export interface JsonFileDbSnapshot {
  readonly version: 1;
  readonly exportedAt?: string;
  readonly tables: JsonFileDbTablesSnapshot;
}

export interface JsonFileDbStoreOptions {
  readonly filePath: string;
  readonly initialSnapshot?: JsonFileDbSnapshot;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneValue<TValue>(value: TValue): TValue {
  return JSON.parse(JSON.stringify(value)) as TValue;
}

function getArrayTable<TRecord>(tables: Record<string, unknown>, tableName: string): readonly TRecord[] {
  const value = tables[tableName];

  if (!Array.isArray(value)) {
    return [];
  }

  return cloneValue(value) as readonly TRecord[];
}

export function createEmptyJsonFileDbSnapshot(exportedAt?: string): JsonFileDbSnapshot {
  return {
    version: 1,
    ...(exportedAt !== undefined ? { exportedAt } : {}),
    tables: {
      app_tenants: [],
      terminals: [],
      app_users: [],
      devices: [],
      stockpiles: [],
      yard_zones: [],
      measurements: [],
      sync_events: [],
      conflict_resolutions: [],
      audit_entries: [],
      evidence_items: []
    }
  };
}

export function normalizeJsonFileDbSnapshot(value: unknown): JsonFileDbSnapshot {
  if (!isRecord(value) || value["version"] !== 1 || !isRecord(value["tables"])) {
    throw new Error("Invalid JSON file DB snapshot.");
  }

  const tables = value["tables"];

  return {
    version: 1,
    ...(typeof value["exportedAt"] === "string" ? { exportedAt: value["exportedAt"] } : {}),
    tables: {
      app_tenants: getArrayTable<DbTenantRecord>(tables, "app_tenants"),
      terminals: getArrayTable<DbTerminalRecord>(tables, "terminals"),
      app_users: getArrayTable<DbUserRecord>(tables, "app_users"),
      devices: getArrayTable<DbDeviceRecord>(tables, "devices"),
      stockpiles: getArrayTable<DbStockpileRecord>(tables, "stockpiles"),
      yard_zones: getArrayTable<DbYardZoneRecord>(tables, "yard_zones"),
      measurements: getArrayTable<DbMeasurementRecord>(tables, "measurements"),
      sync_events: getArrayTable<DbSyncEventRecord>(tables, "sync_events"),
      conflict_resolutions: getArrayTable<DbConflictResolutionRecord>(tables, "conflict_resolutions"),
      audit_entries: getArrayTable<DbAuditEntryRecord>(tables, "audit_entries"),
      evidence_items: getArrayTable<DbEvidenceItemRecord>(tables, "evidence_items")
    }
  };
}

export class JsonFileDbStore implements DbUnitOfWork {
  private readonly tenantRepository = new InMemoryDbRepository<DbTenantRecord>("app_tenants");
  private readonly terminalRepository = new InMemoryDbRepository<DbTerminalRecord>("terminals");
  private readonly userRepository = new InMemoryDbRepository<DbUserRecord>("app_users");
  private readonly deviceRepository = new InMemoryDbRepository<DbDeviceRecord>("devices");
  private readonly stockpileRepository = new InMemoryDbRepository<DbStockpileRecord>("stockpiles");
  private readonly yardZoneRepository = new InMemoryDbRepository<DbYardZoneRecord>("yard_zones");
  private readonly measurementRepository = new InMemoryDbRepository<DbMeasurementRecord>("measurements");
  private readonly syncEventRepository = new InMemoryDbRepository<DbSyncEventRecord>("sync_events");
  private readonly conflictResolutionRepository = new InMemoryDbRepository<DbConflictResolutionRecord>(
    "conflict_resolutions"
  );
  private readonly auditEntryRepository = new InMemoryDbRepository<DbAuditEntryRecord>("audit_entries");
  private readonly evidenceItemRepository = new InMemoryDbRepository<DbEvidenceItemRecord>("evidence_items");

  readonly filePath: string;
  readonly repositories: DbRepositorySet;

  constructor(options: JsonFileDbStoreOptions) {
    this.filePath = options.filePath;
    this.repositories = {
      tenants: this.tenantRepository,
      terminals: this.terminalRepository,
      users: this.userRepository,
      devices: this.deviceRepository,
      stockpiles: this.stockpileRepository,
      yardZones: this.yardZoneRepository,
      measurements: this.measurementRepository,
      syncEvents: this.syncEventRepository,
      conflictResolutions: this.conflictResolutionRepository,
      auditEntries: this.auditEntryRepository,
      evidenceItems: this.evidenceItemRepository
    };

    if (options.initialSnapshot !== undefined) {
      this.importSnapshot(options.initialSnapshot);
    }
  }

  async transaction<TResult>(
    handler: (context: DbTransactionContext) => Promise<TResult>
  ): Promise<TResult> {
    return handler({
      repositories: this.repositories
    });
  }

  loadFromDisk(): JsonFileDbSnapshot {
    if (!existsSync(this.filePath)) {
      const emptySnapshot = createEmptyJsonFileDbSnapshot();

      this.importSnapshot(emptySnapshot);

      return emptySnapshot;
    }

    const raw = readFileSync(this.filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const snapshot = normalizeJsonFileDbSnapshot(parsed);

    this.importSnapshot(snapshot);

    return snapshot;
  }

  saveToDisk(exportedAt = new Date().toISOString()): JsonFileDbSnapshot {
    const snapshot = this.exportSnapshot(exportedAt);
    const directory = dirname(this.filePath);

    mkdirSync(directory, {
      recursive: true
    });

    writeFileSync(this.filePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

    return snapshot;
  }

  exportSnapshot(exportedAt?: string): JsonFileDbSnapshot {
    return {
      version: 1,
      ...(exportedAt !== undefined ? { exportedAt } : {}),
      tables: {
        app_tenants: this.tenantRepository.snapshot().records,
        terminals: this.terminalRepository.snapshot().records,
        app_users: this.userRepository.snapshot().records,
        devices: this.deviceRepository.snapshot().records,
        stockpiles: this.stockpileRepository.snapshot().records,
        yard_zones: this.yardZoneRepository.snapshot().records,
        measurements: this.measurementRepository.snapshot().records,
        sync_events: this.syncEventRepository.snapshot().records,
        conflict_resolutions: this.conflictResolutionRepository.snapshot().records,
        audit_entries: this.auditEntryRepository.snapshot().records,
        evidence_items: this.evidenceItemRepository.snapshot().records
      }
    };
  }

  importSnapshot(snapshot: JsonFileDbSnapshot): void {
    this.tenantRepository.restore({
      tableName: "app_tenants",
      records: snapshot.tables.app_tenants
    });
    this.terminalRepository.restore({
      tableName: "terminals",
      records: snapshot.tables.terminals
    });
    this.userRepository.restore({
      tableName: "app_users",
      records: snapshot.tables.app_users
    });
    this.deviceRepository.restore({
      tableName: "devices",
      records: snapshot.tables.devices
    });
    this.stockpileRepository.restore({
      tableName: "stockpiles",
      records: snapshot.tables.stockpiles
    });
    this.yardZoneRepository.restore({
      tableName: "yard_zones",
      records: snapshot.tables.yard_zones
    });
    this.measurementRepository.restore({
      tableName: "measurements",
      records: snapshot.tables.measurements
    });
    this.syncEventRepository.restore({
      tableName: "sync_events",
      records: snapshot.tables.sync_events
    });
    this.conflictResolutionRepository.restore({
      tableName: "conflict_resolutions",
      records: snapshot.tables.conflict_resolutions
    });
    this.auditEntryRepository.restore({
      tableName: "audit_entries",
      records: snapshot.tables.audit_entries
    });
    this.evidenceItemRepository.restore({
      tableName: "evidence_items",
      records: snapshot.tables.evidence_items
    });
  }

  reset(deleteFile = true): void {
    this.importSnapshot(createEmptyJsonFileDbSnapshot());

    if (deleteFile && existsSync(this.filePath)) {
      rmSync(this.filePath, {
        force: true
      });
    }
  }
}

export function createJsonFileDbStore(options: JsonFileDbStoreOptions): JsonFileDbStore {
  return new JsonFileDbStore(options);
}