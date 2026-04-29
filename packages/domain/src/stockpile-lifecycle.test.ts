import { describe, expect, it } from "vitest";
import {
  canTransitionStockpileStatus,
  describeStockpileStatusTransition,
  getAllowedStockpileStatusTransitions,
  isStockpileLifecycleStatus,
  stockpileLifecycleStatuses,
  stockpileLifecycleTransitions
} from "./index.js";

describe("@iyi/domain stockpile lifecycle", () => {
  it("defines stable lifecycle statuses", () => {
    expect(stockpileLifecycleStatuses).toEqual([
      "draft",
      "operational",
      "pending_review",
      "validated",
      "archived"
    ]);
  });

  it("recognizes valid lifecycle statuses", () => {
    expect(isStockpileLifecycleStatus("draft")).toBe(true);
    expect(isStockpileLifecycleStatus("operational")).toBe(true);
    expect(isStockpileLifecycleStatus("pending_review")).toBe(true);
    expect(isStockpileLifecycleStatus("validated")).toBe(true);
    expect(isStockpileLifecycleStatus("archived")).toBe(true);
    expect(isStockpileLifecycleStatus("deleted")).toBe(false);
    expect(isStockpileLifecycleStatus(null)).toBe(false);
  });

  it("defines allowed transitions", () => {
    expect(stockpileLifecycleTransitions.draft).toContain("operational");
    expect(stockpileLifecycleTransitions.operational).toContain("pending_review");
    expect(stockpileLifecycleTransitions.pending_review).toContain("validated");
    expect(stockpileLifecycleTransitions.validated).toContain("archived");
    expect(stockpileLifecycleTransitions.archived).toEqual([]);
  });

  it("returns allowed transitions for a status", () => {
    expect(getAllowedStockpileStatusTransitions("draft")).toEqual([
      "operational",
      "pending_review",
      "validated",
      "archived"
    ]);

    expect(getAllowedStockpileStatusTransitions("archived")).toEqual([]);
  });

  it("allows idempotent same-status updates", () => {
    expect(canTransitionStockpileStatus("draft", "draft")).toBe(true);
    expect(canTransitionStockpileStatus("validated", "validated")).toBe(true);
    expect(canTransitionStockpileStatus("archived", "archived")).toBe(true);
  });

  it("allows normal supervisor transitions", () => {
    expect(canTransitionStockpileStatus("draft", "operational")).toBe(true);
    expect(canTransitionStockpileStatus("operational", "pending_review")).toBe(true);
    expect(canTransitionStockpileStatus("pending_review", "validated")).toBe(true);
    expect(canTransitionStockpileStatus("validated", "pending_review")).toBe(true);
    expect(canTransitionStockpileStatus("validated", "archived")).toBe(true);
  });

  it("rejects transitions out of archived", () => {
    expect(canTransitionStockpileStatus("archived", "draft")).toBe(false);
    expect(canTransitionStockpileStatus("archived", "operational")).toBe(false);
    expect(canTransitionStockpileStatus("archived", "pending_review")).toBe(false);
    expect(canTransitionStockpileStatus("archived", "validated")).toBe(false);
  });

  it("describes transition decisions", () => {
    expect(describeStockpileStatusTransition("draft", "validated")).toContain("is allowed");
    expect(describeStockpileStatusTransition("archived", "operational")).toContain("is not allowed");
  });
});