import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type ConflictResolutionDecision =
  | "accepted_after_review"
  | "rejected_after_review"
  | "manual_action_required";

export interface ConflictResolutionRecord {
  readonly resolutionId: string;
  readonly eventId: string;
  readonly decision: ConflictResolutionDecision;
  readonly note: string;
  readonly resolvedByUserId: string;
  readonly resolvedByDeviceId: string;
  readonly resolvedAt: string;
}

export interface ConflictResolutionFile {
  readonly version: 1;
  readonly exportedAt?: string;
  readonly resolutions: ConflictResolutionRecord[];
}

export interface ConflictResolutionImportResult {
  readonly importedResolutions: number;
  readonly replacedExistingStore: boolean;
}

let cachedResolutionFile: ConflictResolutionFile | null = null;

function createEmptyResolutionFile(): ConflictResolutionFile {
  return {
    version: 1,
    resolutions: []
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeDecision(value: unknown): ConflictResolutionDecision {
  if (
    value === "accepted_after_review" ||
    value === "rejected_after_review" ||
    value === "manual_action_required"
  ) {
    return value;
  }

  return "manual_action_required";
}

function normalizeResolution(value: unknown): ConflictResolutionRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value["resolutionId"] !== "string" ||
    typeof value["eventId"] !== "string" ||
    typeof value["note"] !== "string" ||
    typeof value["resolvedByUserId"] !== "string" ||
    typeof value["resolvedByDeviceId"] !== "string" ||
    typeof value["resolvedAt"] !== "string"
  ) {
    return null;
  }

  return {
    resolutionId: value["resolutionId"],
    eventId: value["eventId"],
    decision: normalizeDecision(value["decision"]),
    note: value["note"],
    resolvedByUserId: value["resolvedByUserId"],
    resolvedByDeviceId: value["resolvedByDeviceId"],
    resolvedAt: value["resolvedAt"]
  };
}

function normalizeResolutionFile(value: unknown): ConflictResolutionFile | null {
  if (Array.isArray(value)) {
    const resolutions = value
      .map((resolution) => normalizeResolution(resolution))
      .filter((resolution): resolution is ConflictResolutionRecord => resolution !== null);

    return {
      version: 1,
      resolutions
    };
  }

  if (!isRecord(value) || value["version"] !== 1 || !Array.isArray(value["resolutions"])) {
    return null;
  }

  const resolutions = value["resolutions"]
    .map((resolution) => normalizeResolution(resolution))
    .filter((resolution): resolution is ConflictResolutionRecord => resolution !== null);

  return {
    version: 1,
    ...(typeof value["exportedAt"] === "string" ? { exportedAt: value["exportedAt"] } : {}),
    resolutions
  };
}

export function getConflictResolutionFilePath(): string {
  const dataDirectory = process.env["IYI_EDGE_DATA_DIR"] ?? join(process.cwd(), ".edge-data");

  return join(dataDirectory, "conflict-resolutions.json");
}

function loadResolutionFile(): ConflictResolutionFile {
  if (cachedResolutionFile !== null) {
    return cachedResolutionFile;
  }

  const filePath = getConflictResolutionFilePath();

  if (!existsSync(filePath)) {
    cachedResolutionFile = createEmptyResolutionFile();
    return cachedResolutionFile;
  }

  const raw = readFileSync(filePath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  const normalized = normalizeResolutionFile(parsed);

  if (normalized === null) {
    throw new Error(`Invalid conflict resolution file format: ${filePath}`);
  }

  cachedResolutionFile = normalized;

  return cachedResolutionFile;
}

function persistResolutionFile(file: ConflictResolutionFile): void {
  const filePath = getConflictResolutionFilePath();
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

export function getConflictResolutions(): readonly ConflictResolutionRecord[] {
  const file = loadResolutionFile();

  return [...file.resolutions].reverse();
}

export function getResolvedConflictEventIds(): ReadonlySet<string> {
  const file = loadResolutionFile();

  return new Set(file.resolutions.map((resolution) => resolution.eventId));
}

export function recordConflictResolution(input: {
  readonly eventId: string;
  readonly decision?: ConflictResolutionDecision;
  readonly note?: string;
  readonly resolvedByUserId?: string;
  readonly resolvedByDeviceId?: string;
  readonly resolvedAt: string;
}): ConflictResolutionRecord {
  const file = loadResolutionFile();
  const existing = file.resolutions.find((resolution) => resolution.eventId === input.eventId);

  if (existing !== undefined) {
    return existing;
  }

  const resolution: ConflictResolutionRecord = {
    resolutionId: randomUUID(),
    eventId: input.eventId,
    decision: input.decision ?? "manual_action_required",
    note: input.note ?? "Conflict marked as reviewed by supervisor.",
    resolvedByUserId: input.resolvedByUserId ?? "user_supervisor_demo",
    resolvedByDeviceId: input.resolvedByDeviceId ?? "device_web_supervisor",
    resolvedAt: input.resolvedAt
  };

  file.resolutions.push(resolution);
  persistResolutionFile(file);

  return resolution;
}

export function exportConflictResolutionStore(now: string): ConflictResolutionFile {
  const file = loadResolutionFile();

  return {
    version: 1,
    exportedAt: now,
    resolutions: [...file.resolutions]
  };
}

export function importConflictResolutionStore(
  value: unknown,
  replaceExistingStore = true
): ConflictResolutionImportResult {
  const imported = normalizeResolutionFile(value);

  if (imported === null) {
    throw new Error("Invalid conflict resolution import payload.");
  }

  if (replaceExistingStore) {
    cachedResolutionFile = {
      version: 1,
      resolutions: [...imported.resolutions]
    };

    persistResolutionFile(cachedResolutionFile);

    return {
      importedResolutions: imported.resolutions.length,
      replacedExistingStore: true
    };
  }

  const file = loadResolutionFile();
  const existingEventIds = new Set(file.resolutions.map((resolution) => resolution.eventId));
  const existingResolutionIds = new Set(file.resolutions.map((resolution) => resolution.resolutionId));

  for (const resolution of imported.resolutions) {
    if (
      !existingEventIds.has(resolution.eventId) &&
      !existingResolutionIds.has(resolution.resolutionId)
    ) {
      file.resolutions.push(resolution);
      existingEventIds.add(resolution.eventId);
      existingResolutionIds.add(resolution.resolutionId);
    }
  }

  persistResolutionFile(file);

  return {
    importedResolutions: imported.resolutions.length,
    replacedExistingStore: false
  };
}

export function resetConflictResolutionStore(): void {
  cachedResolutionFile = createEmptyResolutionFile();

  const filePath = getConflictResolutionFilePath();

  if (existsSync(filePath)) {
    rmSync(filePath, { force: true });
  }
}