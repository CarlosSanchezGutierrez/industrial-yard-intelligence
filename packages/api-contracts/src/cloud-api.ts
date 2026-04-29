export interface CloudApiRouteDefinitionContract {
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly path: string;
  readonly description: string;
}

export interface CloudApiManifestPayloadContract {
  readonly service: "@iyi/api";
  readonly name: "Industrial Yard Intelligence API";
  readonly runtime: "cloud-api-skeleton";
  readonly routes: readonly CloudApiRouteDefinitionContract[];
}

export interface CloudApiHealthPayloadContract {
  readonly status: "ok";
  readonly service: "@iyi/api";
  readonly dbSchemaVersion: string;
  readonly repositoryMode: "in_memory" | "json_file";
}

export interface CloudApiDbSchemaPayloadContract {
  readonly migrationId: string;
  readonly sql: string;
}

export interface CloudApiDbTablesPayloadContract {
  readonly migrationId: string;
  readonly tables: readonly string[];
}

export interface CloudApiSeedPayloadContract {
  readonly seed: unknown;
}

export interface CloudApiTenantSummaryContract {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CloudApiTerminalSummaryContract {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly timezone: string;
  readonly locationLabel: string;
}

export type CloudApiStockpileStatusContract =
  | "draft"
  | "operational"
  | "pending_review"
  | "validated"
  | "archived";

export interface CloudApiStockpileSummaryContract {
  readonly id: string;
  readonly tenantId: string;
  readonly terminalId: string;
  readonly name: string;
  readonly material: string;
  readonly category: string;
  readonly estimatedTons: number;
  readonly validationState: string;
  readonly confidenceLevel: string;
  readonly status: string;
}

export interface CloudApiCreateStockpileRequestContract {
  readonly id?: string;
  readonly tenantId: string;
  readonly terminalId: string;
  readonly name: string;
  readonly material: string;
  readonly category?: string;
  readonly estimatedTons?: number;
  readonly validationState?: string;
  readonly confidenceLevel?: string;
  readonly status?: CloudApiStockpileStatusContract;
}

export interface CloudApiCreateStockpilePayloadContract {
  readonly stockpile: CloudApiStockpileSummaryContract;
}

export interface CloudApiUpdateStockpileStatusRequestContract {
  readonly status: CloudApiStockpileStatusContract;
  readonly validationState?: string;
  readonly confidenceLevel?: string;
}

export interface CloudApiUpdateStockpileStatusPayloadContract {
  readonly stockpile: CloudApiStockpileSummaryContract;
}

export interface CloudApiTenantsPayloadContract {
  readonly tenants: readonly CloudApiTenantSummaryContract[];
}

export interface CloudApiStockpilesPayloadContract {
  readonly stockpiles: readonly CloudApiStockpileSummaryContract[];
}


export type CloudApiStockpileLifecycleStatusContract =
    | "draft"
    | "operational"
    | "pending_review"
    | "validated"
    | "archived";

export interface CloudApiStockpileLifecycleTransitionContract {
    from: CloudApiStockpileLifecycleStatusContract;
    to: CloudApiStockpileLifecycleStatusContract;
}

export interface CloudApiStockpileLifecyclePayloadContract {
    statuses: readonly CloudApiStockpileLifecycleStatusContract[];
    transitions: readonly CloudApiStockpileLifecycleTransitionContract[];
    allowedTransitionsByStatus: Record<
        CloudApiStockpileLifecycleStatusContract,
        readonly CloudApiStockpileLifecycleStatusContract[]
    >;
}
export interface CloudApiSystemOverviewPayloadContract {
  readonly tenantCount: number;
  readonly terminalCount: number;
  readonly userCount: number;
  readonly deviceCount: number;
  readonly stockpileCount: number;
  readonly syncEventCount: number;
  readonly auditEntryCount: number;
  readonly evidenceItemCount: number;
}

export interface CloudApiAdminDbSnapshotPayloadContract {
  readonly storeFile: string;
  readonly snapshot: unknown;
}

export interface CloudApiAdminDbResetPayloadContract {
  readonly reset: true;
  readonly storeFile: string;
  readonly overview: CloudApiSystemOverviewPayloadContract;
}

export const cloudApiRouteDefinitions = [
  {
    method: "GET",
    path: "/",
    description: "API manifest."
  },
  {
    method: "GET",
    path: "/health",
    description: "API health check."
  },
  {
    method: "GET",
    path: "/db/schema",
    description: "Return DB schema SQL contract."
  },
  {
    method: "GET",
    path: "/db/tables",
    description: "Return required DB table names."
  },
  {
    method: "GET",
    path: "/seed/cooper-smoke",
    description: "Return Cooper/T. Smith smoke seed data."
  },
  {
    method: "GET",
    path: "/tenants",
    description: "List tenants from API repository layer."
  },
  {
    method: "GET",
    path: "/stockpiles/lifecycle",
    description: "Expose stockpile lifecycle statuses and allowed transitions."
  },
{
    method: "GET",
    path: "/stockpiles",
    description: "List stockpiles from API repository layer."
  },
  {
    method: "POST",
    path: "/stockpiles",
    description: "Create stockpile in API repository layer."
  },
  {
    method: "PATCH",
    path: "/stockpiles/:id/status",
    description: "Update stockpile status in API repository layer."
  },
  {
    method: "GET",
    path: "/system/overview",
    description: "Return repository-backed system overview."
  },
  {
    method: "GET",
    path: "/admin/db/snapshot",
    description: "Return API JSON database snapshot."
  },
  {
    method: "POST",
    path: "/admin/db/reset",
    description: "Reset API JSON database to seed state."
  }
] as const satisfies readonly CloudApiRouteDefinitionContract[];

export type CloudApiRoutePathContract = (typeof cloudApiRouteDefinitions)[number]["path"];

export function isCloudApiRoutePath(value: string): value is CloudApiRoutePathContract {
  return cloudApiRouteDefinitions.some((route) => route.path === value);
}

export function isCloudApiStockpileStatus(value: string): value is CloudApiStockpileStatusContract {
  return (
    value === "draft" ||
    value === "operational" ||
    value === "pending_review" ||
    value === "validated" ||
    value === "archived"
  );
}