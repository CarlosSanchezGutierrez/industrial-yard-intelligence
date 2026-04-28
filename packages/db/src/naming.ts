import { err, ok, type Result } from "@iyi/kernel";

export const databaseSchemas = [
  "core",
  "spatial",
  "operations",
  "sync",
  "media",
  "audit",
  "analytics"
] as const;

export type DatabaseSchemaName = (typeof databaseSchemas)[number];

export const tableNames = [
  "tenants",
  "terminals",
  "users",
  "devices",
  "yards",
  "zones",
  "materials",
  "equipment",
  "infrastructure",
  "stockpiles",
  "operational_events",
  "sync_events",
  "sync_batches",
  "evidence_items",
  "measurement_sessions",
  "audit_log",
  "scenarios",
  "recommendations",
  "kpi_snapshots"
] as const;

export type TableName = (typeof tableNames)[number];

export type SqlIdentifierValidationError = "empty_identifier" | "invalid_identifier";

export function validateSqlIdentifier(
  identifier: string
): Result<string, SqlIdentifierValidationError> {
  if (identifier.trim().length === 0) {
    return err("empty_identifier", "SQL identifier must not be empty.");
  }

  if (!/^[a-z][a-z0-9_]*$/u.test(identifier)) {
    return err(
      "invalid_identifier",
      "SQL identifier must use lowercase snake_case and start with a letter."
    );
  }

  return ok(identifier);
}

export function qualifyTableName(schema: DatabaseSchemaName, table: TableName): string {
  return `${schema}.${table}`;
}