export interface DbProjectionTablesContract {
  readonly app_tenants: readonly unknown[];
  readonly terminals: readonly unknown[];
  readonly app_users: readonly unknown[];
  readonly devices: readonly unknown[];
  readonly stockpiles: readonly unknown[];
  readonly yard_zones: readonly unknown[];
  readonly measurements: readonly unknown[];
  readonly sync_events: readonly unknown[];
  readonly conflict_resolutions: readonly unknown[];
  readonly audit_entries: readonly unknown[];
  readonly evidence_items: readonly unknown[];
}

export interface DbProjectionSnapshotContract {
  readonly version: 1;
  readonly exportedAt?: string;
  readonly tables: DbProjectionTablesContract;
}

export interface DbProjectionSummaryContract {
  readonly version: 1;
  readonly exportedAt: string;
  readonly storeFile: string;
  readonly tableCounts: Record<keyof DbProjectionTablesContract, number>;
  readonly totalRows: number;
}

export interface DbProjectionSummaryPayloadContract {
  readonly summary: DbProjectionSummaryContract;
}

export interface DbProjectionSnapshotPayloadContract {
  readonly snapshot: DbProjectionSnapshotContract;
}

export interface DbProjectionSnapshotSavePayloadContract {
  readonly saved: true;
  readonly storeFile: string;
  readonly snapshot: DbProjectionSnapshotContract;
}

export const dbProjectionTableNames = [
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

export type DbProjectionTableNameContract = (typeof dbProjectionTableNames)[number];

export function isDbProjectionTableName(value: string): value is DbProjectionTableNameContract {
  return (dbProjectionTableNames as readonly string[]).includes(value);
}

export function getEmptyDbProjectionTableCounts(): Record<DbProjectionTableNameContract, number> {
  return {
    app_tenants: 0,
    terminals: 0,
    app_users: 0,
    devices: 0,
    stockpiles: 0,
    yard_zones: 0,
    measurements: 0,
    sync_events: 0,
    conflict_resolutions: 0,
    audit_entries: 0,
    evidence_items: 0
  };
}

export function countDbProjectionRows(
  tableCounts: Record<DbProjectionTableNameContract, number>
): number {
  return Object.values(tableCounts).reduce((total, count) => total + count, 0);
}