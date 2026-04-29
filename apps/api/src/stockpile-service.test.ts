import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createApiJsonDbStore,
  createStockpileCommand,
  parseCreateStockpileCommand,
  parseUpdateStockpileStatusCommand,
  updateStockpileStatusCommand
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

  it("parses a status update command", () => {
    const result = parseUpdateStockpileStatusCommand({
      status: "validated",
      validationState: "supervisor_validated",
      confidenceLevel: "reviewed"
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.status).toBe("validated");
      expect(result.validationState).toBe("supervisor_validated");
      expect(result.confidenceLevel).toBe("reviewed");
    }
  });

  it("rejects invalid status update commands", () => {
    const result = parseUpdateStockpileStatusCommand({
      status: "deleted"
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.code).toBe("bad_request");
      expect(result.message).toContain("status must be");
    }
  });

  it("updates and persists stockpile status", async () => {
    await createStockpileCommand(
      {
        id: "stockpile_status_update",
        tenantId: "tenant_cooper_tsmith",
        terminalId: "terminal_altamira",
        name: "Status update target",
        material: "pet coke",
        estimatedTons: 456,
        status: "draft"
      },
      now
    );

    const result = await updateStockpileStatusCommand(
      "stockpile_status_update",
      {
        status: "validated",
        validationState: "supervisor_validated",
        confidenceLevel: "reviewed"
      },
      "2026-04-28T13:00:00.000Z"
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.stockpile.status).toBe("validated");
      expect(result.stockpile.validationState).toBe("supervisor_validated");
      expect(result.stockpile.confidenceLevel).toBe("reviewed");
    }

    const store = createApiJsonDbStore(now);
    const loaded = await store.repositories.stockpiles.getById("stockpile_status_update");

    expect(loaded?.status).toBe("validated");
    expect(loaded?.updatedAt).toBe("2026-04-28T13:00:00.000Z");
  });

  it("returns not_found when updating missing stockpile", async () => {
    const result = await updateStockpileStatusCommand(
      "missing_stockpile",
      {
        status: "validated"
      },
      now
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.code).toBe("not_found");
      expect(result.message).toContain("missing_stockpile");
    }
  });

  it("rejects status transitions from archived to active states", async () => {
    await createStockpileCommand(
      {
        id: "stockpile_archived_terminal",
        tenantId: "tenant_cooper_tsmith",
        terminalId: "terminal_altamira",
        name: "Archived target",
        material: "pet coke",
        status: "archived"
      },
      now
    );

    const result = await updateStockpileStatusCommand(
      "stockpile_archived_terminal",
      {
        status: "operational"
      },
      "2026-04-28T14:00:00.000Z"
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.code).toBe("conflict");
      expect(result.message).toContain("cannot transition");
    }
  });
});