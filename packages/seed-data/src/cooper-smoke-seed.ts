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
  layers: [
    {
      id: "orthomosaic_simulated",
      label: "Ortomosaico simulado",
      enabled: true,
      classification: "simulated"
    },
    {
      id: "stockpiles",
      label: "Materiales y pilas",
      enabled: true,
      classification: "operational"
    },
    {
      id: "equipment",
      label: "Equipo operativo",
      enabled: true,
      classification: "operational"
    },
    {
      id: "rail_and_scales",
      label: "Ferrocarril y básculas",
      enabled: true,
      classification: "simulated"
    },
    {
      id: "future_rtk",
      label: "Medición RTK futura",
      enabled: false,
      classification: "estimated"
    }
  ],
  movements: [
    {
      id: "movement_001",
      type: "VESSEL_DISCHARGE",
      title: "Descarga vinculada a Sharon",
      description: "Evento operativo simulado desde muelle hacia patio de almacenaje.",
      timestamp: "08:20",
      actor: "Operador patio",
      status: "accepted"
    },
    {
      id: "movement_002",
      type: "STOCKPILE_CREATED",
      title: "Nueva pila operativa registrada",
      description: "Pila Clinker B creada con confianza approximate.",
      timestamp: "09:05",
      actor: "Supervisor turno A",
      status: "pending_review"
    },
    {
      id: "movement_003",
      type: "MEASUREMENT_ADDED",
      title: "Medición georreferenciada agregada",
      description: "Fluorita MT marcada como georeferenced para revisión futura.",
      timestamp: "09:45",
      actor: "Captura móvil",
      status: "accepted"
    },
    {
      id: "movement_004",
      type: "VALIDATION_REQUESTED",
      title: "Validación requerida",
      description: "Clinker B requiere revisión por diferencia de geometría estimada.",
      timestamp: "10:10",
      actor: "Regla del sistema",
      status: "conflict"
    }
  ],
  recommendations: [
    {
      id: "recommendation_001",
      title: "Priorizar revisión de Clinker B",
      reason: "La pila tiene confianza approximate y está cerca de zona de maniobra.",
      severity: "high",
      score: 92
    },
    {
      id: "recommendation_002",
      title: "Mantener Pet Coke A como referencia operativa",
      reason: "Su trazabilidad es estable y no presenta conflicto reciente.",
      severity: "medium",
      score: 74
    },
    {
      id: "recommendation_003",
      title: "Preparar capa GeoTIFF futura",
      reason: "El mapa actual es representativo; la demo debe mostrar reemplazo por ortomosaico real.",
      severity: "medium",
      score: 81
    }
  ],
  scenarios: [
    {
      id: "scenario_001",
      name: "Alta saturación de patio",
      description: "Simula llegada simultánea de granel mineral y acero.",
      impact: "Riesgo de congestión en patio +18%"
    },
    {
      id: "scenario_002",
      name: "Telestacker fuera de servicio",
      description: "Evalúa impacto operativo si el equipo de apilamiento queda detenido.",
      impact: "Aumenta prioridad de grúas y transportadores móviles"
    },
    {
      id: "scenario_003",
      name: "Ortomosaico RTK disponible",
      description: "Reemplaza plano representativo por capa georreferenciada futura.",
      impact: "Mejora confianza espacial a centimeter_ready"
    }
  ],
  alerts: [
    "Datos de patio representativos: no corresponden a plano real confirmado.",
    "4 eventos requieren revisión de supervisor antes de validación.",
    "Capa ortomosaico simulada lista para reemplazo por GeoTIFF futuro."
  ]
};