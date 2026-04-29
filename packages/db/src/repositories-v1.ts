import type { DbTableName } from "./schema-v1.js";
import type {
  DbAnyRecord,
  DbRecordMap
} from "./records-v1.js";
import {
  assertNonEmptyRecordId,
  hasTenantId
} from "./records-v1.js";

export interface DbListOptions {
  readonly tenantId?: string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface DbRepository<TRecord extends DbAnyRecord> {
  readonly tableName: DbTableName;
  getById(id: string): Promise<TRecord | null>;
  list(options?: DbListOptions): Promise<readonly TRecord[]>;
  upsert(record: TRecord): Promise<TRecord>;
  deleteById(id: string): Promise<boolean>;
  count(options?: DbListOptions): Promise<number>;
}

export interface DbRepositorySet {
  readonly tenants: DbRepository<DbRecordMap["app_tenants"]>;
  readonly terminals: DbRepository<DbRecordMap["terminals"]>;
  readonly users: DbRepository<DbRecordMap["app_users"]>;
  readonly devices: DbRepository<DbRecordMap["devices"]>;
  readonly stockpiles: DbRepository<DbRecordMap["stockpiles"]>;
  readonly yardZones: DbRepository<DbRecordMap["yard_zones"]>;
  readonly measurements: DbRepository<DbRecordMap["measurements"]>;
  readonly syncEvents: DbRepository<DbRecordMap["sync_events"]>;
  readonly conflictResolutions: DbRepository<DbRecordMap["conflict_resolutions"]>;
  readonly auditEntries: DbRepository<DbRecordMap["audit_entries"]>;
  readonly evidenceItems: DbRepository<DbRecordMap["evidence_items"]>;
}

export interface DbTransactionContext {
  readonly repositories: DbRepositorySet;
}

export interface DbUnitOfWork {
  readonly repositories: DbRepositorySet;
  transaction<TResult>(
    handler: (context: DbTransactionContext) => Promise<TResult>
  ): Promise<TResult>;
}

export interface InMemoryRepositorySnapshot<TRecord extends DbAnyRecord> {
  readonly tableName: DbTableName;
  readonly records: readonly TRecord[];
}

function normalizePagination(options?: DbListOptions): {
  readonly limit: number;
  readonly offset: number;
} {
  const limit = options?.limit ?? 1000;
  const offset = options?.offset ?? 0;

  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error("DB list limit must be a non-negative integer.");
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("DB list offset must be a non-negative integer.");
  }

  return {
    limit,
    offset
  };
}

function cloneRecord<TRecord extends DbAnyRecord>(record: TRecord): TRecord {
  return JSON.parse(JSON.stringify(record)) as TRecord;
}

function filterByTenant<TRecord extends DbAnyRecord>(
  records: readonly TRecord[],
  tenantId?: string
): readonly TRecord[] {
  if (tenantId === undefined) {
    return records;
  }

  return records.filter((record) => hasTenantId(record) && record.tenantId === tenantId);
}

export class InMemoryDbRepository<TRecord extends DbAnyRecord>
  implements DbRepository<TRecord> {
  readonly tableName: DbTableName;

  private readonly recordsById = new Map<string, TRecord>();

  constructor(tableName: DbTableName, initialRecords: readonly TRecord[] = []) {
    this.tableName = tableName;

    for (const record of initialRecords) {
      this.recordsById.set(assertNonEmptyRecordId(record.id), cloneRecord(record));
    }
  }

  async getById(id: string): Promise<TRecord | null> {
    const record = this.recordsById.get(assertNonEmptyRecordId(id));

    return record === undefined ? null : cloneRecord(record);
  }

  async list(options?: DbListOptions): Promise<readonly TRecord[]> {
    const { limit, offset } = normalizePagination(options);
    const records = filterByTenant([...this.recordsById.values()], options?.tenantId);

    return records.slice(offset, offset + limit).map((record) => cloneRecord(record));
  }

  async upsert(record: TRecord): Promise<TRecord> {
    const id = assertNonEmptyRecordId(record.id);
    const cloned = cloneRecord(record);

    this.recordsById.set(id, cloned);

    return cloneRecord(cloned);
  }

  async deleteById(id: string): Promise<boolean> {
    return this.recordsById.delete(assertNonEmptyRecordId(id));
  }

  async count(options?: DbListOptions): Promise<number> {
    const records = await this.list({
      tenantId: options?.tenantId,
      limit: Number.MAX_SAFE_INTEGER,
      offset: 0
    });

    return records.length;
  }

  snapshot(): InMemoryRepositorySnapshot<TRecord> {
    return {
      tableName: this.tableName,
      records: [...this.recordsById.values()].map((record) => cloneRecord(record))
    };
  }

  restore(snapshot: InMemoryRepositorySnapshot<TRecord>): void {
    if (snapshot.tableName !== this.tableName) {
      throw new Error(`Cannot restore ${snapshot.tableName} snapshot into ${this.tableName} repository.`);
    }

    this.recordsById.clear();

    for (const record of snapshot.records) {
      this.recordsById.set(record.id, cloneRecord(record));
    }
  }

  clear(): void {
    this.recordsById.clear();
  }
}

export class InMemoryDbUnitOfWork implements DbUnitOfWork {
  readonly repositories: DbRepositorySet;

  constructor(initial?: Partial<{
    readonly tenants: readonly DbRecordMap["app_tenants"][];
    readonly terminals: readonly DbRecordMap["terminals"][];
    readonly users: readonly DbRecordMap["app_users"][];
    readonly devices: readonly DbRecordMap["devices"][];
    readonly stockpiles: readonly DbRecordMap["stockpiles"][];
    readonly yardZones: readonly DbRecordMap["yard_zones"][];
    readonly measurements: readonly DbRecordMap["measurements"][];
    readonly syncEvents: readonly DbRecordMap["sync_events"][];
    readonly conflictResolutions: readonly DbRecordMap["conflict_resolutions"][];
    readonly auditEntries: readonly DbRecordMap["audit_entries"][];
    readonly evidenceItems: readonly DbRecordMap["evidence_items"][];
  }> = {}) {
    this.repositories = {
      tenants: new InMemoryDbRepository("app_tenants", initial.tenants ?? []),
      terminals: new InMemoryDbRepository("terminals", initial.terminals ?? []),
      users: new InMemoryDbRepository("app_users", initial.users ?? []),
      devices: new InMemoryDbRepository("devices", initial.devices ?? []),
      stockpiles: new InMemoryDbRepository("stockpiles", initial.stockpiles ?? []),
      yardZones: new InMemoryDbRepository("yard_zones", initial.yardZones ?? []),
      measurements: new InMemoryDbRepository("measurements", initial.measurements ?? []),
      syncEvents: new InMemoryDbRepository("sync_events", initial.syncEvents ?? []),
      conflictResolutions: new InMemoryDbRepository(
        "conflict_resolutions",
        initial.conflictResolutions ?? []
      ),
      auditEntries: new InMemoryDbRepository("audit_entries", initial.auditEntries ?? []),
      evidenceItems: new InMemoryDbRepository("evidence_items", initial.evidenceItems ?? [])
    };
  }

  async transaction<TResult>(
    handler: (context: DbTransactionContext) => Promise<TResult>
  ): Promise<TResult> {
    return handler({
      repositories: this.repositories
    });
  }
}

export function createInMemoryDbUnitOfWork(
  initial?: ConstructorParameters<typeof InMemoryDbUnitOfWork>[0]
): InMemoryDbUnitOfWork {
  return new InMemoryDbUnitOfWork(initial);
}