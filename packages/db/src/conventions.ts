import { err, ok, type Result } from "@iyi/kernel";
import type { DatabaseSchemaName, TableName } from "./naming.js";
import { qualifyTableName, validateSqlIdentifier } from "./naming.js";

export interface TableConvention {
  readonly schema: DatabaseSchemaName;
  readonly table: TableName;
  readonly qualifiedName: string;
  readonly tenantAware: boolean;
  readonly appendOnly: boolean;
  readonly spatial: boolean;
  readonly requiredColumns: readonly string[];
}

export type TableConventionValidationError =
  | "invalid_schema"
  | "invalid_table"
  | "tenant_aware_table_requires_tenant_id"
  | "append_only_table_must_not_require_updated_at"
  | "spatial_table_requires_geometry_column";

export function createTableConvention(input: {
  readonly schema: DatabaseSchemaName;
  readonly table: TableName;
  readonly tenantAware: boolean;
  readonly appendOnly?: boolean;
  readonly spatial?: boolean;
  readonly requiredColumns?: readonly string[];
}): TableConvention {
  const requiredColumns = input.requiredColumns ?? [];

  return {
    schema: input.schema,
    table: input.table,
    qualifiedName: qualifyTableName(input.schema, input.table),
    tenantAware: input.tenantAware,
    appendOnly: input.appendOnly ?? false,
    spatial: input.spatial ?? false,
    requiredColumns
  };
}

export function validateTableConvention(
  convention: TableConvention
): Result<true, TableConventionValidationError> {
  const schemaResult = validateSqlIdentifier(convention.schema);

  if (!schemaResult.ok) {
    return err("invalid_schema", schemaResult.message);
  }

  const tableResult = validateSqlIdentifier(convention.table);

  if (!tableResult.ok) {
    return err("invalid_table", tableResult.message);
  }

  if (convention.tenantAware && !convention.requiredColumns.includes("tenant_id")) {
    return err(
      "tenant_aware_table_requires_tenant_id",
      "Tenant-aware tables must include tenant_id."
    );
  }

  if (convention.appendOnly && convention.requiredColumns.includes("updated_at")) {
    return err(
      "append_only_table_must_not_require_updated_at",
      "Append-only tables must not require updated_at."
    );
  }

  if (convention.spatial && !convention.requiredColumns.includes("geometry")) {
    return err(
      "spatial_table_requires_geometry_column",
      "Spatial tables must include a geometry column."
    );
  }

  return ok(true);
}