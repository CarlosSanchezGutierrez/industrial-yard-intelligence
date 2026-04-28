export type SeedDataClassification = "simulated" | "estimated" | "operational";

export type StockpileStatus = "operational" | "pending_review" | "validated";

export type MovementType =
  | "VESSEL_DISCHARGE"
  | "STOCKPILE_CREATED"
  | "STOCKPILE_MOVED"
  | "EQUIPMENT_ASSIGNED"
  | "MEASUREMENT_ADDED"
  | "VALIDATION_REQUESTED";

export type RecommendationSeverity = "low" | "medium" | "high";

export interface SmokeStockpile {
  readonly id: string;
  readonly name: string;
  readonly material: string;
  readonly category: string;
  readonly yard: string;
  readonly estimatedTons: number;
  readonly confidence: string;
  readonly status: StockpileStatus;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface SmokeEquipment {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly status: string;
  readonly x: number;
  readonly y: number;
}

export interface SmokeKpi {
  readonly label: string;
  readonly value: string;
  readonly classification: SeedDataClassification;
}

export interface SmokeLayer {
  readonly id: string;
  readonly label: string;
  readonly enabled: boolean;
  readonly classification: SeedDataClassification;
}

export interface SmokeMovement {
  readonly id: string;
  readonly type: MovementType;
  readonly title: string;
  readonly description: string;
  readonly timestamp: string;
  readonly actor: string;
  readonly status: "accepted" | "pending_review" | "conflict";
}

export interface SmokeRecommendation {
  readonly id: string;
  readonly title: string;
  readonly reason: string;
  readonly severity: RecommendationSeverity;
  readonly score: number;
}

export interface SmokeScenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly impact: string;
}

export interface SmokeTenantSeed {
  readonly tenantName: string;
  readonly terminalName: string;
  readonly classification: "SIMULATED_DATA";
  readonly kpis: readonly SmokeKpi[];
  readonly stockpiles: readonly SmokeStockpile[];
  readonly equipment: readonly SmokeEquipment[];
  readonly layers: readonly SmokeLayer[];
  readonly movements: readonly SmokeMovement[];
  readonly recommendations: readonly SmokeRecommendation[];
  readonly scenarios: readonly SmokeScenario[];
  readonly alerts: readonly string[];
}