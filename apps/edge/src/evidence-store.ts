import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  assertEvidenceStorageKey,
  createTextEvidenceMetadata,
  verifyEvidenceIntegrity,
  type EvidenceIntegrityMetadata
} from "@iyi/media";
import {
  asDeviceId,
  asEntityId,
  asEventId,
  asTenantId,
  asTerminalId,
  asUserId
} from "@iyi/kernel";

export interface StoredEvidenceItem {
  readonly metadata: EvidenceIntegrityMetadata;
  readonly contentText: string;
  readonly registeredAt: string;
}

export interface EvidenceStoreFile {
  readonly version: 1;
  readonly exportedAt?: string;
  readonly items: StoredEvidenceItem[];
}

export interface EvidenceSummary {
  readonly totalEvidenceItems: number;
  readonly verifiedItems: number;
  readonly failedItems: number;
}

export interface EvidenceVerificationResult {
  readonly ok: boolean;
  readonly checkedItems: number;
  readonly failedEvidenceIds: readonly string[];
}

export interface EvidenceImportResult {
  readonly importedEvidenceItems: number;
  readonly replacedExistingStore: boolean;
}

let cachedEvidenceStore: EvidenceStoreFile | null = null;

function createEmptyEvidenceStore(): EvidenceStoreFile {
  return {
    version: 1,
    items: []
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeEvidenceKind(value: unknown):
  | "photo"
  | "document"
  | "geojson"
  | "geotiff"
  | "point_cloud"
  | "cad_file"
  | "rtk_observation"
  | "sensor_export"
  | "other" {
  if (
    value === "photo" ||
    value === "document" ||
    value === "geojson" ||
    value === "geotiff" ||
    value === "point_cloud" ||
    value === "cad_file" ||
    value === "rtk_observation" ||
    value === "sensor_export" ||
    value === "other"
  ) {
    return value;
  }

  return "other";
}

function normalizeStorageProvider(value: unknown):
  | "edge_filesystem"
  | "edge_object_store"
  | "cloud_object_store"
  | "external_reference" {
  if (
    value === "edge_filesystem" ||
    value === "edge_object_store" ||
    value === "cloud_object_store" ||
    value === "external_reference"
  ) {
    return value;
  }

  return "edge_filesystem";
}

function normalizeStoredEvidenceItem(value: unknown): StoredEvidenceItem | null {
  if (!isRecord(value) || !isRecord(value["metadata"]) || typeof value["contentText"] !== "string") {
    return null;
  }

  const metadata = value["metadata"];

  if (
    typeof metadata["tenantId"] !== "string" ||
    typeof metadata["evidenceId"] !== "string" ||
    typeof metadata["evidenceKind"] !== "string" ||
    typeof metadata["storageProvider"] !== "string" ||
    typeof metadata["storageKey"] !== "string" ||
    typeof metadata["ownerUserId"] !== "string" ||
    typeof metadata["ownerDeviceId"] !== "string" ||
    typeof metadata["sourceRuntime"] !== "string" ||
    typeof metadata["createdAt"] !== "string" ||
    !isRecord(metadata["integrity"]) ||
    metadata["immutable"] !== true
  ) {
    return null;
  }

  const integrity = metadata["integrity"];

  if (
    integrity["algorithm"] !== "sha256" ||
    typeof integrity["hashValue"] !== "string" ||
    typeof integrity["byteSize"] !== "number"
  ) {
    return null;
  }

  const sourceRuntime: EvidenceIntegrityMetadata["sourceRuntime"] =
    metadata["sourceRuntime"] === "mobile"
      ? "mobile"
      : metadata["sourceRuntime"] === "edge"
        ? "edge"
        : metadata["sourceRuntime"] === "cloud"
          ? "cloud"
          : metadata["sourceRuntime"] === "external_ingestion"
            ? "external_ingestion"
            : "edge";

  const normalizedMetadata = {
    tenantId: asTenantId(metadata["tenantId"]),
    ...(typeof metadata["terminalId"] === "string"
      ? { terminalId: asTerminalId(metadata["terminalId"]) }
      : {}),
    evidenceId: asEntityId(metadata["evidenceId"]),
    evidenceKind: normalizeEvidenceKind(metadata["evidenceKind"]),
    storageProvider: normalizeStorageProvider(metadata["storageProvider"]),
    storageKey: metadata["storageKey"],
    ...(typeof metadata["fileName"] === "string" ? { fileName: metadata["fileName"] } : {}),
    ...(typeof metadata["mimeType"] === "string" ? { mimeType: metadata["mimeType"] } : {}),
    ...(typeof metadata["relatedEntityId"] === "string"
      ? { relatedEntityId: asEntityId(metadata["relatedEntityId"]) }
      : {}),
    ...(typeof metadata["relatedEventId"] === "string"
      ? { relatedEventId: asEventId(metadata["relatedEventId"]) }
      : {}),
    ownerUserId: asUserId(metadata["ownerUserId"]),
    ownerDeviceId: asDeviceId(metadata["ownerDeviceId"]),
    sourceRuntime,
    createdAt: metadata["createdAt"],
    integrity: {
      algorithm: "sha256" as const,
      hashValue: integrity["hashValue"],
      byteSize: integrity["byteSize"]
    },
    immutable: true as const
  };

  return {
    metadata: normalizedMetadata,
    contentText: value["contentText"],
    registeredAt: typeof value["registeredAt"] === "string" ? value["registeredAt"] : metadata["createdAt"]
  };
}

function normalizeEvidenceStoreFile(value: unknown): EvidenceStoreFile | null {
  if (!isRecord(value) || value["version"] !== 1 || !Array.isArray(value["items"])) {
    return null;
  }

  const items = value["items"]
    .map((item) => normalizeStoredEvidenceItem(item))
    .filter((item): item is StoredEvidenceItem => item !== null);

  return {
    version: 1,
    ...(typeof value["exportedAt"] === "string" ? { exportedAt: value["exportedAt"] } : {}),
    items
  };
}

export function getEvidenceStoreFilePath(): string {
  const dataDirectory = process.env["IYI_EDGE_DATA_DIR"] ?? join(process.cwd(), ".edge-data");

  return join(dataDirectory, "evidence-store.json");
}

function loadEvidenceStore(): EvidenceStoreFile {
  if (cachedEvidenceStore !== null) {
    return cachedEvidenceStore;
  }

  const filePath = getEvidenceStoreFilePath();

  if (!existsSync(filePath)) {
    cachedEvidenceStore = createEmptyEvidenceStore();
    return cachedEvidenceStore;
  }

  const raw = readFileSync(filePath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  const normalized = normalizeEvidenceStoreFile(parsed);

  if (normalized === null) {
    throw new Error(`Invalid evidence store file format: ${filePath}`);
  }

  cachedEvidenceStore = normalized;

  return cachedEvidenceStore;
}

function persistEvidenceStore(store: EvidenceStoreFile): void {
  const filePath = getEvidenceStoreFilePath();
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export function getEvidenceItems(): readonly StoredEvidenceItem[] {
  const store = loadEvidenceStore();

  return [...store.items].reverse();
}

export function verifyEvidenceStore(): EvidenceVerificationResult {
  const store = loadEvidenceStore();
  const failedEvidenceIds: string[] = [];

  for (const item of store.items) {
    const verified = verifyEvidenceIntegrity(item.contentText, item.metadata.integrity);

    if (!verified) {
      failedEvidenceIds.push(String(item.metadata.evidenceId));
    }
  }

  return {
    ok: failedEvidenceIds.length === 0,
    checkedItems: store.items.length,
    failedEvidenceIds
  };
}

export function getEvidenceSummary(): EvidenceSummary {
  const store = loadEvidenceStore();
  const verification = verifyEvidenceStore();

  return {
    totalEvidenceItems: store.items.length,
    verifiedItems: store.items.length - verification.failedEvidenceIds.length,
    failedItems: verification.failedEvidenceIds.length
  };
}

export function recordTextEvidence(input: {
  readonly content: string;
  readonly evidenceKind?: string;
  readonly storageProvider?: string;
  readonly storageKey?: string;
  readonly fileName?: string;
  readonly mimeType?: string;
  readonly relatedEntityId?: string;
  readonly relatedEventId?: string;
  readonly registeredAt: string;
}): StoredEvidenceItem {
  const store = loadEvidenceStore();
  const evidenceId = asEntityId(`evidence_${Date.now()}_${store.items.length + 1}`);
  const evidenceKind = normalizeEvidenceKind(input.evidenceKind);
  const storageKey = assertEvidenceStorageKey(
    input.storageKey ?? `evidence/${evidenceKind}/${String(evidenceId)}.txt`
  );

  const metadata = createTextEvidenceMetadata({
    content: input.content,
    metadata: {
      tenantId: asTenantId("tenant_cooper_tsmith"),
      terminalId: asTerminalId("terminal_altamira"),
      evidenceId,
      evidenceKind,
      storageProvider: normalizeStorageProvider(input.storageProvider),
      storageKey,
      ...(input.fileName !== undefined ? { fileName: input.fileName } : {}),
      ...(input.mimeType !== undefined ? { mimeType: input.mimeType } : {}),
      ...(input.relatedEntityId !== undefined
        ? { relatedEntityId: asEntityId(input.relatedEntityId) }
        : {}),
      ...(input.relatedEventId !== undefined ? { relatedEventId: asEventId(input.relatedEventId) } : {}),
      ownerUserId: asUserId("user_operator_001"),
      ownerDeviceId: asDeviceId("device_web_demo"),
      sourceRuntime: "edge",
      createdAt: input.registeredAt
    }
  });

  const item: StoredEvidenceItem = {
    metadata,
    contentText: input.content,
    registeredAt: input.registeredAt
  };

  store.items.push(item);
  persistEvidenceStore(store);

  return item;
}

export function exportEvidenceStore(now: string): EvidenceStoreFile {
  const store = loadEvidenceStore();

  return {
    version: 1,
    exportedAt: now,
    items: [...store.items]
  };
}

export function importEvidenceStore(value: unknown, replaceExistingStore = true): EvidenceImportResult {
  const imported = normalizeEvidenceStoreFile(value);

  if (imported === null) {
    throw new Error("Invalid evidence store import payload.");
  }

  if (replaceExistingStore) {
    cachedEvidenceStore = {
      version: 1,
      items: [...imported.items]
    };

    persistEvidenceStore(cachedEvidenceStore);

    return {
      importedEvidenceItems: imported.items.length,
      replacedExistingStore: true
    };
  }

  const store = loadEvidenceStore();
  const existingEvidenceIds = new Set(store.items.map((item) => String(item.metadata.evidenceId)));
  const existingHashes = new Set(store.items.map((item) => item.metadata.integrity.hashValue));

  for (const item of imported.items) {
    const evidenceId = String(item.metadata.evidenceId);
    const hash = item.metadata.integrity.hashValue;

    if (!existingEvidenceIds.has(evidenceId) && !existingHashes.has(hash)) {
      store.items.push(item);
      existingEvidenceIds.add(evidenceId);
      existingHashes.add(hash);
    }
  }

  persistEvidenceStore(store);

  return {
    importedEvidenceItems: imported.items.length,
    replacedExistingStore: false
  };
}

export function resetEvidenceStore(): void {
  cachedEvidenceStore = createEmptyEvidenceStore();

  const filePath = getEvidenceStoreFilePath();

  if (existsSync(filePath)) {
    rmSync(filePath, { force: true });
  }
}