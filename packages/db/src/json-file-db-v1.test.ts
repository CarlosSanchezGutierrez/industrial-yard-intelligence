import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createEmptyJsonFileDbSnapshot,
  createJsonFileDbStore,
  normalizeJsonFileDbSnapshot,
  type DbEvidenceItemRecord,
  type DbStockpileRecord,
  type DbTenantRecord
} from "./index.js";

const tempDirectories: string[] = [];
const now = "2026-04-28T12:00:00.000Z";

function createTempFilePath(): string {
  const directory = mkdtempSync(join(tmpdir(), "iyi-json-db-"));
  tempDirectories.push(directory);

  return join(directory, "edge-db.json");
}

function createTenant(id = "tenant_cooper_tsmith"): DbTenantRecord {
  return {
    id,
    name: "Cooper/T. Smith",
    status: "active",
    createdAt: now,
    updatedAt: now
  };
}

function createStockpile(id = "stockpile_pet_coke_001"): DbStockpileRecord {
  return {
    id,
    tenantId: "tenant_cooper_tsmith",
    terminalId: "terminal_altamira",
    name: "Pet Coke Patio Norte",
    material: "Pet coke",
    category: "bulk",
    estimatedTons: 1200,
    validationState: "operational",
    confidenceLevel: "simulated",
    status: "operational",
    createdAt: now,
    updatedAt: now
  };
}

function createEvidenceItem(id = "evidence_geojson_001"): DbEvidenceItemRecord {
  return {
    id,
    tenantId: "tenant_cooper_tsmith",
    terminalId: "terminal_altamira",
    evidenceKind: "geojson",
    storageProvider: "edge_filesystem",
    storageKey: "evidence/geojson/demo.geojson",
    fileName: "demo.geojson",
    mimeType: "application/geo+json",
    relatedEntityId: "stockpile_pet_coke_001",
    ownerUserId: "user_operator_001",
    ownerDeviceId: "device_web_demo",
    sourceRuntime: "edge",
    hashAlgorithm: "sha256",
    hashValue: "a".repeat(64),
    byteSize: 123,
    immutable: true,
    contentPreview: "{}",
    registeredAt: now,
    createdAt: now
  };
}

afterEach(() => {
  while (tempDirectories.length > 0) {
    const directory = tempDirectories.pop();

    if (directory !== undefined && existsSync(directory)) {
      rmSync(directory, {
        recursive: true,
        force: true
      });
    }
  }
});

describe("@iyi/db JSON file adapter v1", () => {
  it("creates an empty snapshot", () => {
    const snapshot = createEmptyJsonFileDbSnapshot(now);

    expect(snapshot.version).toBe(1);
    expect(snapshot.exportedAt).toBe(now);
    expect(snapshot.tables.app_tenants).toHaveLength(0);
    expect(snapshot.tables.sync_events).toHaveLength(0);
    expect(snapshot.tables.evidence_items).toHaveLength(0);
  });

  it("saves and loads records from disk", async () => {
    const filePath = createTempFilePath();
    const store = createJsonFileDbStore({
      filePath
    });

    await store.repositories.tenants.upsert(createTenant());
    await store.repositories.stockpiles.upsert(createStockpile());
    await store.repositories.evidenceItems.upsert(createEvidenceItem());

    const saved = store.saveToDisk(now);

    expect(saved.exportedAt).toBe(now);
    expect(existsSync(filePath)).toBe(true);

    const reloadedStore = createJsonFileDbStore({
      filePath
    });

    const loadedSnapshot = reloadedStore.loadFromDisk();

    expect(loadedSnapshot.tables.app_tenants).toHaveLength(1);
    expect(loadedSnapshot.tables.stockpiles).toHaveLength(1);
    expect(loadedSnapshot.tables.evidence_items).toHaveLength(1);

    const loadedTenant = await reloadedStore.repositories.tenants.getById("tenant_cooper_tsmith");
    const loadedStockpile = await reloadedStore.repositories.stockpiles.getById("stockpile_pet_coke_001");
    const loadedEvidence = await reloadedStore.repositories.evidenceItems.getById("evidence_geojson_001");

    expect(loadedTenant?.name).toBe("Cooper/T. Smith");
    expect(loadedStockpile?.estimatedTons).toBe(1200);
    expect(loadedEvidence?.hashValue).toBe("a".repeat(64));
  });

  it("exports and imports snapshots between stores", async () => {
    const firstStore = createJsonFileDbStore({
      filePath: createTempFilePath()
    });

    await firstStore.repositories.tenants.upsert(createTenant());
    await firstStore.repositories.stockpiles.upsert(createStockpile());

    const snapshot = firstStore.exportSnapshot(now);

    const secondStore = createJsonFileDbStore({
      filePath: createTempFilePath()
    });

    secondStore.importSnapshot(snapshot);

    expect(await secondStore.repositories.tenants.count()).toBe(1);
    expect(await secondStore.repositories.stockpiles.count()).toBe(1);
  });

  it("normalizes missing tables as empty arrays", () => {
    const snapshot = normalizeJsonFileDbSnapshot({
      version: 1,
      exportedAt: now,
      tables: {
        app_tenants: [createTenant()]
      }
    });

    expect(snapshot.tables.app_tenants).toHaveLength(1);
    expect(snapshot.tables.terminals).toHaveLength(0);
    expect(snapshot.tables.evidence_items).toHaveLength(0);
  });

  it("rejects invalid snapshots", () => {
    expect(() => normalizeJsonFileDbSnapshot(null)).toThrow("Invalid JSON file DB snapshot");
    expect(() =>
      normalizeJsonFileDbSnapshot({
        version: 2,
        tables: {}
      })
    ).toThrow("Invalid JSON file DB snapshot");
  });

  it("resets memory and optionally deletes the JSON file", async () => {
    const filePath = createTempFilePath();
    const store = createJsonFileDbStore({
      filePath
    });

    await store.repositories.tenants.upsert(createTenant());

    store.saveToDisk(now);

    expect(existsSync(filePath)).toBe(true);

    store.reset(true);

    expect(existsSync(filePath)).toBe(false);
    expect(await store.repositories.tenants.count()).toBe(0);
  });

  it("writes UTF-8 JSON payloads without corrupting content", async () => {
    const filePath = createTempFilePath();
    const store = createJsonFileDbStore({
      filePath
    });

    await store.repositories.tenants.upsert({
      ...createTenant(),
      name: "Cooper Altamira Patio Ñ"
    });

    store.saveToDisk(now);

    const raw = readFileSync(filePath, "utf8");

    expect(raw).toContain("Cooper Altamira Patio Ñ");
    expect(raw).toContain('"version": 1');
  });
});