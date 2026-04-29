import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createApiJsonDbStore,
  createStockpileCommand,
  parseCreateStockpileCommand
} from "./index.js";

const now = "2026-04-28T12:00:00.000Z";

let tempDirectory: string | null = null;

beforeEach(() => {
  tempDirectory = mkdtempSync(join(tmpdir(), "iyi-api-stockpile-service-"));
  process.env["IYI_API_DATA_DIR"] = tempDirectory;
});

afterEach(() => {
  delete process.env["IYI_API_DATA_DIR"];

  if (tempDirectory !== null) {
    rmSync(tempDirectory, {
      recursive: true,
      force: true
    });
  }

  tempDirectory = null;
});

describe("@iyi/api stockpile service", () => {
  it("parses a create stockpile command", () => {
    const result = parseCreateStockpileCommand(
      {
        id: "stockpile_service_001",
        tenantId: "tenant_cooper_tsmith",
        terminalId: "terminal_altamira",
        name: "Service stockpile",
        material: "pet coke",
        estimatedTons: 123,
        status: "draft"
      },
      now
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.record.id).toBe("stockpile_service_001");
      expect(result.record.estimatedTons).toBe(123);
      expect(result.record.status).toBe("draft");
    }
  });

  it("rejects malformed create commands", () => {
    const result = parseCreateStockpileCommand(
      {
        tenantId: "tenant_cooper_tsmith"
      },
      now
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.code).toBe("bad_request");
      expect(result.message).toContain("terminalId");
    }
  });

  it("creates and persists a stockpile", async () => {
    const result = await createStockpileCommand(
      {
        id: "stockpile_service_created",
        tenantId: "tenant_cooper_tsmith",
        terminalId: "terminal_altamira",
        name: "Created from service",
        material: "pet coke",
        estimatedTons: 456,
        status: "draft"
      },
      now
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.stockpile.id).toBe("stockpile_service_created");
      expect(result.stockpile.estimatedTons).toBe(456);
    }

    const store = createApiJsonDbStore(now);
    const loaded = await store.repositories.stockpiles.getById("stockpile_service_created");

    expect(loaded?.name).toBe("Created from service");
  });

  it("rejects duplicate stockpile ids", async () => {
    const body = {
      id: "stockpile_duplicate",
      tenantId: "tenant_cooper_tsmith",
      terminalId: "terminal_altamira",
      name: "Duplicate",
      material: "pet coke"
    };

    const first = await createStockpileCommand(body, now);
    const second = await createStockpileCommand(body, now);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);

    if (!second.ok) {
      expect(second.code).toBe("conflict");
      expect(second.message).toContain("already exists");
    }
  });
});