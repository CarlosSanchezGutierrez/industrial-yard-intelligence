import { err, ok, type Result } from "@iyi/kernel";

export const migrationPhases = [
  "tenants_terminals",
  "users_devices",
  "yards_zones",
  "materials_equipment_infrastructure",
  "operational_events",
  "sync_events",
  "evidence_metadata",
  "measurement_sessions",
  "spatial_geometries",
  "audit_log",
  "scenarios_recommendations_kpis"
] as const;

export type MigrationPhase = (typeof migrationPhases)[number];

export interface MigrationDescriptor {
  readonly id: string;
  readonly sequence: number;
  readonly phase: MigrationPhase;
  readonly description: string;
}

export type MigrationIdError =
  | "invalid_migration_sequence"
  | "empty_migration_slug"
  | "invalid_migration_slug";

export function createMigrationId(
  sequence: number,
  slug: string
): Result<string, MigrationIdError> {
  if (!Number.isInteger(sequence) || sequence < 1) {
    return err(
      "invalid_migration_sequence",
      "Migration sequence must be a positive integer."
    );
  }

  const normalizedSlug = slug.trim();

  if (normalizedSlug.length === 0) {
    return err("empty_migration_slug", "Migration slug must not be empty.");
  }

  if (!/^[a-z][a-z0-9_]*$/u.test(normalizedSlug)) {
    return err(
      "invalid_migration_slug",
      "Migration slug must use lowercase snake_case and start with a letter."
    );
  }

  return ok(`${String(sequence).padStart(4, "0")}_${normalizedSlug}`);
}

export function createMigrationDescriptor(input: {
  readonly sequence: number;
  readonly phase: MigrationPhase;
  readonly description: string;
}): Result<MigrationDescriptor, MigrationIdError> {
  const idResult = createMigrationId(input.sequence, input.phase);

  if (!idResult.ok) {
    return idResult;
  }

  return ok({
    id: idResult.value,
    sequence: input.sequence,
    phase: input.phase,
    description: input.description
  });
}