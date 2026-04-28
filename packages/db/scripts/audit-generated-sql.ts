import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

interface AuditIssue {
  readonly level: "error" | "warning";
  readonly message: string;
}

const drizzleDir = join(process.cwd(), "drizzle");

const requiredSchemas = [
  "core",
  "spatial",
  "operations",
  "sync",
  "media",
  "audit",
  "analytics"
] as const;

const requiredTables = [
  "core.tenants",
  "core.terminals",
  "core.users",
  "core.devices",
  "spatial.yards",
  "spatial.zones",
  "operations.materials",
  "operations.equipment",
  "operations.infrastructure",
  "operations.stockpiles",
  "operations.operational_events",
  "sync.sync_batches",
  "sync.sync_events",
  "media.evidence_items",
  "spatial.measurement_sessions",
  "audit.audit_log",
  "analytics.scenarios",
  "analytics.recommendations",
  "analytics.kpi_snapshots"
] as const;

const forbiddenSqlPatterns = [
  /\bdrop\s+database\b/iu,
  /\bdrop\s+schema\b/iu,
  /\bdrop\s+table\b/iu,
  /\btruncate\b/iu,
  /\bdelete\s+from\b/iu,
  /\balter\s+table\b.*\bdrop\s+column\b/isu
] as const;

function normalizeSql(sql: string): string {
  return sql.replace(/\s+/gu, " ").toLowerCase();
}

function includesSchema(sql: string, schema: string): boolean {
  const normalized = normalizeSql(sql);

  return (
    normalized.includes(`create schema "${schema}"`) ||
    normalized.includes(`create schema if not exists "${schema}"`)
  );
}

function includesTable(sql: string, qualifiedTable: string): boolean {
  const [schema, table] = qualifiedTable.split(".");

  if (!schema || !table) {
    return false;
  }

  const normalized = normalizeSql(sql);

  return normalized.includes(`create table "${schema}"."${table}"`);
}

function runAudit(): readonly AuditIssue[] {
  const issues: AuditIssue[] = [];

  if (!existsSync(drizzleDir)) {
    return [
      {
        level: "error",
        message: `Drizzle output directory not found: ${drizzleDir}`
      }
    ];
  }

  const sqlFiles = readdirSync(drizzleDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (sqlFiles.length === 0) {
    return [
      {
        level: "error",
        message: "No generated .sql migration files found in packages/db/drizzle."
      }
    ];
  }

  const allSql = sqlFiles
    .map((file) => readFileSync(join(drizzleDir, file), "utf8"))
    .join("\n\n");

  for (const pattern of forbiddenSqlPatterns) {
    if (pattern.test(allSql)) {
      issues.push({
        level: "error",
        message: `Generated SQL contains forbidden destructive pattern: ${pattern.toString()}`
      });
    }
  }

  for (const schema of requiredSchemas) {
    if (!includesSchema(allSql, schema)) {
      issues.push({
        level: "error",
        message: `Generated SQL is missing schema creation for "${schema}".`
      });
    }
  }

  for (const table of requiredTables) {
    if (!includesTable(allSql, table)) {
      issues.push({
        level: "error",
        message: `Generated SQL is missing table creation for "${table}".`
      });
    }
  }

  const normalized = normalizeSql(allSql);

  if (!normalized.includes('"tenant_id" uuid')) {
    issues.push({
      level: "error",
      message: "Generated SQL does not appear to include tenant_id uuid columns."
    });
  }

  if (!normalized.includes('"geometry" jsonb')) {
    issues.push({
      level: "warning",
      message: "Generated SQL does not include geometry jsonb placeholders. Confirm if PostGIS work already replaced placeholders."
    });
  }

  if (normalized.includes("geometry(") || normalized.includes("geography(")) {
    issues.push({
      level: "warning",
      message: "Generated SQL appears to include PostGIS geometry/geography types. Confirm PostGIS extension strategy before applying."
    });
  }

  if (normalized.includes("create extension")) {
    issues.push({
      level: "warning",
      message: "Generated SQL includes CREATE EXTENSION. Confirm extension permissions before applying."
    });
  }

  return issues;
}

const issues = runAudit();
const errors = issues.filter((issue) => issue.level === "error");
const warnings = issues.filter((issue) => issue.level === "warning");

console.log("Generated SQL audit");
console.log("===================");
console.log(`Directory: ${drizzleDir}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

for (const issue of issues) {
  console.log(`[${issue.level.toUpperCase()}] ${issue.message}`);
}

if (errors.length > 0) {
  process.exitCode = 1;
} else {
  console.log("OK: generated SQL passed required safety and structure checks.");
}