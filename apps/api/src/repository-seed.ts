import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  createEmptyJsonFileDbSnapshot,
  createInMemoryDbUnitOfWork,
  createJsonFileDbStore,
  type DbDeviceRecord,
  type DbStockpileRecord,
  type DbTenantRecord,
  type DbTerminalRecord,
  type DbUnitOfWork,
  type DbUserRecord,
  type JsonFileDbSnapshot,
  type JsonFileDbStore
} from "@iyi/db";
import { cooperSmokeSeed } from "@iyi/seed-data";

interface RecordLike {
  readonly [key: string]: unknown;
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeStockpileStatus(value: unknown): DbStockpileRecord["status"] {
  if (
    value === "draft" ||
    value === "operational" ||
    value === "pending_review" ||
    value === "validated" ||
    value === "archived"
  ) {
    return value;
  }

  return "operational";
}

export function getApiDbFilePath(): string {
  const dataDirectory = process.env["IYI_API_DATA_DIR"] ?? join(process.cwd(), ".api-data");

  return join(dataDirectory, "api-db.json");
}

export function createApiRepositorySeed(now = new Date().toISOString()): {
  readonly tenants: readonly DbTenantRecord[];
  readonly terminals: readonly DbTerminalRecord[];
  readonly users: readonly DbUserRecord[];
  readonly devices: readonly DbDeviceRecord[];
  readonly stockpiles: readonly DbStockpileRecord[];
} {
  const tenants: readonly DbTenantRecord[] = [
    {
      id: "tenant_cooper_tsmith",
      name: cooperSmokeSeed.tenantName,
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ];

  const terminals: readonly DbTerminalRecord[] = [
    {
      id: "terminal_altamira",
      tenantId: "tenant_cooper_tsmith",
      name: cooperSmokeSeed.terminalName,
      timezone: "America/Monterrey",
      locationLabel: "Altamira, Tamaulipas",
      createdAt: now,
      updatedAt: now
    }
  ];

  const users: readonly DbUserRecord[] = [
    {
      id: "user_demo_operator",
      tenantId: "tenant_cooper_tsmith",
      displayName: "Demo Operator",
      role: "operator",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "user_supervisor_demo",
      tenantId: "tenant_cooper_tsmith",
      displayName: "Demo Supervisor",
      role: "supervisor",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "user_admin_demo",
      tenantId: "tenant_cooper_tsmith",
      displayName: "Demo Admin",
      role: "admin",
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ];

  const devices: readonly DbDeviceRecord[] = [
    {
      id: "device_api_cloud",
      tenantId: "tenant_cooper_tsmith",
      terminalId: "terminal_altamira",
      label: "Cloud API",
      deviceKind: "external",
      status: "active",
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "device_edge_local",
      tenantId: "tenant_cooper_tsmith",
      terminalId: "terminal_altamira",
      label: "Local Edge",
      deviceKind: "edge",
      status: "active",
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now
    }
  ];

  const stockpiles: readonly DbStockpileRecord[] = cooperSmokeSeed.stockpiles.map((stockpile, index) => {
    const source = stockpile as unknown as RecordLike;

    return {
      id: stringValue(source["id"], `stockpile_${index + 1}`),
      tenantId: "tenant_cooper_tsmith",
      terminalId: "terminal_altamira",
      name: stringValue(source["name"], `Stockpile ${index + 1}`),
      material: stringValue(source["material"], "unknown"),
      category: stringValue(source["category"], "bulk"),
      estimatedTons: numberValue(source["estimatedTons"], 0),
      validationState: stringValue(source["validationState"], "operational"),
      confidenceLevel: stringValue(source["confidenceLevel"], "simulated"),
      status: normalizeStockpileStatus(source["status"]),
      createdAt: now,
      updatedAt: now
    };
  });

  return {
    tenants,
    terminals,
    users,
    devices,
    stockpiles
  };
}

export function createApiSeedSnapshot(now = new Date().toISOString()): JsonFileDbSnapshot {
  const seed = createApiRepositorySeed(now);
  const snapshot = createEmptyJsonFileDbSnapshot(now);

  return {
    ...snapshot,
    tables: {
      ...snapshot.tables,
      app_tenants: seed.tenants,
      terminals: seed.terminals,
      app_users: seed.users,
      devices: seed.devices,
      stockpiles: seed.stockpiles
    }
  };
}

export function createInMemoryApiUnitOfWork(now = new Date().toISOString()): DbUnitOfWork {
  const seed = createApiRepositorySeed(now);

  return createInMemoryDbUnitOfWork({
    tenants: seed.tenants,
    terminals: seed.terminals,
    users: seed.users,
    devices: seed.devices,
    stockpiles: seed.stockpiles
  });
}

function isEmptyApiSnapshot(snapshot: JsonFileDbSnapshot): boolean {
  return snapshot.tables.app_tenants.length === 0;
}

export function createApiJsonDbStore(now = new Date().toISOString()): JsonFileDbStore {
  const filePath = getApiDbFilePath();
  const store = createJsonFileDbStore({
    filePath
  });

  const snapshot = existsSync(filePath) ? store.loadFromDisk() : createEmptyJsonFileDbSnapshot(now);

  if (isEmptyApiSnapshot(snapshot)) {
    store.importSnapshot(createApiSeedSnapshot(now));
    store.saveToDisk(now);
  } else {
    store.importSnapshot(snapshot);
  }

  return store;
}

export function createApiUnitOfWork(now = new Date().toISOString()): DbUnitOfWork {
  return createApiJsonDbStore(now);
}

export function getApiJsonDbSnapshot(now = new Date().toISOString()): JsonFileDbSnapshot {
  return createApiJsonDbStore(now).exportSnapshot(now);
}

export function resetApiJsonDb(now = new Date().toISOString()): JsonFileDbStore {
  const store = createJsonFileDbStore({
    filePath: getApiDbFilePath()
  });

  store.reset(true);
  store.importSnapshot(createApiSeedSnapshot(now));
  store.saveToDisk(now);

  return store;
}