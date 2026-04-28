import type { SmokeTenantSeed } from "./types.js";

export const cooperSmokeSeed: SmokeTenantSeed = {
  tenantName: "Cooper/T. Smith",
  terminalName: "Terminal Altamira",
  classification: "SIMULATED_DATA",
  kpis: [
    {
      label: "Materiales visibles",
      value: "7",
      classification: "simulated"
    },
    {
      label: "Movimientos hoy",
      value: "18",
      classification: "simulated"
    },
    {
      label: "Eventos pendientes",
      value: "4",
      classification: "simulated"
    },
    {
      label: "Confianza promedio",
      value: "Operacional",
      classification: "estimated"
    }
  ],
  stockpiles: [
    {
      id: "stockpile_pet_coke_001",
      name: "Pila Pet Coke A",
      material: "Pet coke",
      category: "Granel mineral",
      yard: "Patios de Almacenaje",
      estimatedTons: 12400,
      confidence: "operational",
      status: "operational",
      x: 45,
      y: 48,
      width: 17,
      height: 12
    },
    {
      id: "stockpile_clinker_001",
      name: "Pila Clinker B",
      material: "Clinker",
      category: "Granel mineral",
      yard: "Patios de Almacenaje",
      estimatedTons: 8600,
      confidence: "approximate",
      status: "pending_review",
      x: 67,
      y: 53,
      width: 14,
      height: 10
    },
    {
      id: "stockpile_scrap_001",
      name: "Chatarra HMS",
      material: "Chatarra HMS y P&S",
      category: "Acero",
      yard: "Placa de Concreto",
      estimatedTons: 3200,
      confidence: "operational",
      status: "operational",
      x: 23,
      y: 70,
      width: 13,
      height: 9
    },
    {
      id: "stockpile_fluorita_001",
      name: "Fluorita MT",
      material: "Fluorita MT",
      category: "Granel mineral",
      yard: "Patios de Almacenaje",
      estimatedTons: 5400,
      confidence: "georeferenced",
      status: "validated",
      x: 51,
      y: 72,
      width: 11,
      height: 8
    }
  ],
  equipment: [
    {
      id: "crane_arthur",
      name: "Arthur",
      type: "Grúa Clyde 24",
      status: "Disponible",
      x: 23,
      y: 19
    },
    {
      id: "crane_sharon",
      name: "Sharon",
      type: "Grúa Clyde 24",
      status: "Descarga activa",
      x: 38,
      y: 18
    },
    {
      id: "crane_mr2",
      name: "MR2",
      type: "Grúa Clyde 24",
      status: "Mantenimiento",
      x: 53,
      y: 19
    },
    {
      id: "telestacker_001",
      name: "Telestacker",
      type: "Apilamiento radial telescópico",
      status: "Operando",
      x: 61,
      y: 63
    }
  ],
  alerts: [
    "Datos de patio representativos: no corresponden a plano real confirmado.",
    "4 eventos requieren revisión de supervisor antes de validación.",
    "Capa ortomosaico simulada lista para reemplazo por GeoTIFF futuro."
  ]
};