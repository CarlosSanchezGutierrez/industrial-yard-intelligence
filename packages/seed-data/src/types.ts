export type SeedDataClassification = "simulated" | "estimated" | "operational";

export type StockpileStatus = "operational" | "pending_review" | "validated";

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

export interface SmokeTenantSeed {
  readonly tenantName: string;
  readonly terminalName: string;
  readonly classification: "SIMULATED_DATA";
  readonly kpis: readonly SmokeKpi[];
  readonly stockpiles: readonly SmokeStockpile[];
  readonly equipment: readonly SmokeEquipment[];
  readonly alerts: readonly string[];
}