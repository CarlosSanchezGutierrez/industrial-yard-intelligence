import { randomUUID } from "node:crypto";
import type {
  CloudApiCreateStockpileRequestContract,
  CloudApiStockpileSummaryContract
} from "@iyi/api-contracts";
import type {
  DbStockpileRecord,
  JsonFileDbStore
} from "@iyi/db";
import { createApiJsonDbStore } from "./repository-seed.js";

interface RecordLike {
  readonly [key: string]: unknown;
}

export interface CreateStockpileCommandResult {
  readonly ok: true;
  readonly stockpile: CloudApiStockpileSummaryContract;
}

export interface CreateStockpileCommandFailure {
  readonly ok: false;
  readonly code: "bad_request" | "conflict";
  readonly message: string;
}

export type CreateStockpileCommandResponse =
  | CreateStockpileCommandResult
  | CreateStockpileCommandFailure;

function isRecord(value: unknown): value is RecordLike {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringBodyValue(body: RecordLike, key: string): string | null {
  const value = body[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function optionalStringBodyValue(body: RecordLike, key: string): string | undefined {
  const value = body[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  return value.trim();
}

function optionalNumberBodyValue(body: RecordLike, key: string, fallback: number): number {
  const value = body[key];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return value;
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

  return "draft";
}

export function toStockpileSummary(record: DbStockpileRecord): CloudApiStockpileSummaryContract {
  return {
    id: record.id,
    tenantId: record.tenantId,
    terminalId: record.terminalId,
    name: record.name,
    material: record.material,
    category: record.category,
    estimatedTons: record.estimatedTons,
    validationState: record.validationState,
    confidenceLevel: record.confidenceLevel,
    status: record.status
  };
}

export function parseCreateStockpileCommand(
  body: unknown,
  now: string
): { readonly ok: true; readonly record: DbStockpileRecord } | CreateStockpileCommandFailure {
  if (!isRecord(body)) {
    return {
      ok: false,
      code: "bad_request",
      message: "Request body must be a JSON object."
    };
  }

  const tenantId = stringBodyValue(body, "tenantId");
  const terminalId = stringBodyValue(body, "terminalId");
  const name = stringBodyValue(body, "name");
  const material = stringBodyValue(body, "material");

  if (tenantId === null) {
    return {
      ok: false,
      code: "bad_request",
      message: "tenantId is required."
    };
  }

  if (terminalId === null) {
    return {
      ok: false,
      code: "bad_request",
      message: "terminalId is required."
    };
  }

  if (name === null) {
    return {
      ok: false,
      code: "bad_request",
      message: "name is required."
    };
  }

  if (material === null) {
    return {
      ok: false,
      code: "bad_request",
      message: "material is required."
    };
  }

  const request = body as unknown as Partial<CloudApiCreateStockpileRequestContract>;
  const id = optionalStringBodyValue(body, "id") ?? `stockpile_${randomUUID()}`;
  const category = optionalStringBodyValue(body, "category") ?? "bulk";
  const validationState = optionalStringBodyValue(body, "validationState") ?? "created_from_api";
  const confidenceLevel = optionalStringBodyValue(body, "confidenceLevel") ?? "operator_input";
  const estimatedTons = optionalNumberBodyValue(body, "estimatedTons", 0);
  const status = normalizeStockpileStatus(request.status);

  return {
    ok: true,
    record: {
      id,
      tenantId,
      terminalId,
      name,
      material,
      category,
      estimatedTons,
      validationState,
      confidenceLevel,
      status,
      createdAt: now,
      updatedAt: now
    }
  };
}

export async function createStockpileCommand(
  body: unknown,
  now: string,
  store: JsonFileDbStore = createApiJsonDbStore(now)
): Promise<CreateStockpileCommandResponse> {
  const parsed = parseCreateStockpileCommand(body, now);

  if (!parsed.ok) {
    return parsed;
  }

  const existing = await store.repositories.stockpiles.getById(parsed.record.id);

  if (existing !== null) {
    return {
      ok: false,
      code: "conflict",
      message: `Stockpile ${parsed.record.id} already exists.`
    };
  }

  const saved = await store.repositories.stockpiles.upsert(parsed.record);

  store.saveToDisk(now);

  return {
    ok: true,
    stockpile: toStockpileSummary(saved)
  };
}