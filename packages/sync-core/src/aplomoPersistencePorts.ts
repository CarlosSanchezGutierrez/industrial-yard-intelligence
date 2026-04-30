import {
  createAplomoDefaultDataProducts,
  type AplomoDataExportJob,
  type AplomoDataIntegrationTarget,
  type AplomoDataProductDefinition,
  type AplomoExternalConnectorDefinition,
  type AplomoLlmProviderFamily,
  type AplomoLlmToolDefinition,
  type AplomoSaasResourceStatus,
} from "@iyi/domain";

import {
  AplomoInMemoryDeviceTelemetryStore,
  type AplomoInMemoryDeviceTelemetrySnapshot,
} from "./aplomoInMemoryDeviceTelemetryStore.js";

import type { AplomoGovernedTelemetryOutput } from "./aplomoGovernedDeviceSimulator.js";
import type { AplomoOperationalAlert } from "./aplomoOperationalAlertEngine.js";
import type {
  AplomoDeviceOperationalScore,
  AplomoSiteOperationalScore,
} from "./aplomoOperationalScoreEngine.js";

export const aplomoPersistenceDriverKinds = [
  "memory",
  "supabase",
  "postgres",
  "warehouse",
  "mock",
] as const;

export type AplomoPersistenceDriverKind =
  (typeof aplomoPersistenceDriverKinds)[number];

export const aplomoPersistenceHealthStatuses = [
  "ok",
  "degraded",
  "down",
] as const;

export type AplomoPersistenceHealthStatus =
  (typeof aplomoPersistenceHealthStatuses)[number];

export type AplomoPersistenceHealth = {
  driver: AplomoPersistenceDriverKind;
  status: AplomoPersistenceHealthStatus;
  checkedAt: string;
  details: Record<string, string | number | boolean>;
  errorMessage?: string;
};

export type AplomoRepositoryPageRequest = {
  limit?: number;
  cursor?: string;
};

export type AplomoRepositoryPage<TItem> = {
  items: TItem[];
  page: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
};

export type AplomoGovernedEventListRequest = AplomoRepositoryPageRequest & {
  companyId?: string;
  deviceId?: string;
  eventName?: string;
  fromOccurredAt?: string;
  toOccurredAt?: string;
};

export type AplomoDataProductListRequest = AplomoRepositoryPageRequest & {
  companyId?: string;
  status?: AplomoSaasResourceStatus;
  targetConsumer?: AplomoDataIntegrationTarget;
  search?: string;
};

export type AplomoExportJobListRequest = AplomoRepositoryPageRequest & {
  companyId: string;
  dataProductId?: string;
  target?: AplomoDataIntegrationTarget;
  status?: AplomoDataExportJob["status"];
};

export type AplomoConnectorListRequest = AplomoRepositoryPageRequest & {
  companyId: string;
  target?: AplomoDataIntegrationTarget;
  status?: AplomoSaasResourceStatus;
};

export type AplomoLlmToolListRequest = AplomoRepositoryPageRequest & {
  companyId?: string;
  providerFamily?: AplomoLlmProviderFamily;
  status?: AplomoSaasResourceStatus;
};

export type AplomoPersistedGovernedTelemetryEvent = {
  persistedAt: string;
  tenantPartitionKey: string;
  version: number;
  event: AplomoGovernedTelemetryOutput;
};

export type AplomoPersistedOperationalScoreSnapshot = {
  id: string;
  companyId: string;
  siteId?: string;
  generatedAt: string;
  siteScore: AplomoSiteOperationalScore;
  deviceScores: AplomoDeviceOperationalScore[];
};

export interface AplomoTelemetryPersistencePort {
  getSnapshot(): Promise<AplomoInMemoryDeviceTelemetrySnapshot>;
  replaceSnapshot(snapshot: AplomoInMemoryDeviceTelemetrySnapshot): Promise<void>;
  clear(): Promise<void>;
}

export interface AplomoGovernedEventRepositoryPort {
  append(event: AplomoGovernedTelemetryOutput): Promise<AplomoPersistedGovernedTelemetryEvent>;
  appendMany(events: AplomoGovernedTelemetryOutput[]): Promise<AplomoPersistedGovernedTelemetryEvent[]>;
  list(request: AplomoGovernedEventListRequest): Promise<AplomoRepositoryPage<AplomoPersistedGovernedTelemetryEvent>>;
  count(companyId?: string): Promise<number>;
  clear(): Promise<void>;
}

export interface AplomoOperationalIntelligenceRepositoryPort {
  saveAlerts(companyId: string, alerts: AplomoOperationalAlert[]): Promise<void>;
  listAlerts(companyId: string): Promise<AplomoOperationalAlert[]>;
  saveScoreSnapshot(snapshot: AplomoPersistedOperationalScoreSnapshot): Promise<void>;
  listScoreSnapshots(companyId: string): Promise<AplomoPersistedOperationalScoreSnapshot[]>;
  clear(): Promise<void>;
}

export interface AplomoDataPlatformRepositoryPort {
  upsertDataProduct(dataProduct: AplomoDataProductDefinition): Promise<AplomoDataProductDefinition>;
  listDataProducts(request: AplomoDataProductListRequest): Promise<AplomoRepositoryPage<AplomoDataProductDefinition>>;
  getDataProduct(dataProductId: string): Promise<AplomoDataProductDefinition | null>;

  createExportJob(job: AplomoDataExportJob): Promise<AplomoDataExportJob>;
  updateExportJob(job: AplomoDataExportJob): Promise<AplomoDataExportJob>;
  listExportJobs(request: AplomoExportJobListRequest): Promise<AplomoRepositoryPage<AplomoDataExportJob>>;
  getExportJob(companyId: string, exportJobId: string): Promise<AplomoDataExportJob | null>;

  upsertConnector(connector: AplomoExternalConnectorDefinition): Promise<AplomoExternalConnectorDefinition>;
  listConnectors(request: AplomoConnectorListRequest): Promise<AplomoRepositoryPage<AplomoExternalConnectorDefinition>>;
  getConnector(companyId: string, connectorId: string): Promise<AplomoExternalConnectorDefinition | null>;

  upsertLlmTool(tool: AplomoLlmToolDefinition): Promise<AplomoLlmToolDefinition>;
  listLlmTools(request: AplomoLlmToolListRequest): Promise<AplomoRepositoryPage<AplomoLlmToolDefinition>>;
  getLlmTool(toolId: string): Promise<AplomoLlmToolDefinition | null>;
}

export interface AplomoPersistenceAdapter {
  driver: AplomoPersistenceDriverKind;
  telemetry: AplomoTelemetryPersistencePort;
  governedEvents: AplomoGovernedEventRepositoryPort;
  operationalIntelligence: AplomoOperationalIntelligenceRepositoryPort;
  dataPlatform: AplomoDataPlatformRepositoryPort;
  health(): Promise<AplomoPersistenceHealth>;
}

const nowIso = (): string => new Date().toISOString();

const safeLimit = (limit: number | undefined): number => {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return 50;
  }

  return Math.max(1, Math.min(Math.floor(limit), 500));
};

const pageItems = <TItem>(
  items: TItem[],
  request: AplomoRepositoryPageRequest,
): AplomoRepositoryPage<TItem> => {
  const limit = safeLimit(request.limit);
  const start = Math.max(0, Number.parseInt(request.cursor ?? "0", 10) || 0);
  const end = start + limit;
  const hasMore = end < items.length;

  const page: AplomoRepositoryPage<TItem>["page"] = {
    limit,
    hasMore,
  };

  if (hasMore) {
    page.nextCursor = String(end);
  }

  return {
    items: items.slice(start, end),
    page,
  };
};

export class AplomoInMemoryTelemetryPersistencePort
  implements AplomoTelemetryPersistencePort
{
  constructor(private readonly store: AplomoInMemoryDeviceTelemetryStore) {}

  async getSnapshot(): Promise<AplomoInMemoryDeviceTelemetrySnapshot> {
    return this.store.snapshot();
  }

  async replaceSnapshot(snapshot: AplomoInMemoryDeviceTelemetrySnapshot): Promise<void> {
    this.store.clear();

    for (const device of snapshot.devices) {
      this.store.registerDevice({
        companyId: device.companyId,
        name: device.name,
        type: device.type,
        capabilities: device.capabilities,
        ...(typeof device.siteId === "string" ? { siteId: device.siteId } : {}),
        ...(typeof device.serialNumber === "string"
          ? { serialNumber: device.serialNumber }
          : {}),
        ...(typeof device.externalIdentifier === "string"
          ? { externalIdentifier: device.externalIdentifier }
          : {}),
        ...(device.metadata ? { metadata: device.metadata } : {}),
      });
    }
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

export class AplomoInMemoryGovernedEventRepository
  implements AplomoGovernedEventRepositoryPort
{
  private readonly events: AplomoPersistedGovernedTelemetryEvent[] = [];

  async append(
    event: AplomoGovernedTelemetryOutput,
  ): Promise<AplomoPersistedGovernedTelemetryEvent> {
    const persisted: AplomoPersistedGovernedTelemetryEvent = {
      event,
      persistedAt: nowIso(),
      tenantPartitionKey: event.event.companyId,
      version: 1,
    };

    this.events.push(persisted);

    return persisted;
  }

  async appendMany(
    events: AplomoGovernedTelemetryOutput[],
  ): Promise<AplomoPersistedGovernedTelemetryEvent[]> {
    const persisted: AplomoPersistedGovernedTelemetryEvent[] = [];

    for (const event of events) {
      persisted.push(await this.append(event));
    }

    return persisted;
  }

  async list(
    request: AplomoGovernedEventListRequest,
  ): Promise<AplomoRepositoryPage<AplomoPersistedGovernedTelemetryEvent>> {
    const items = this.events
      .filter((item) => !request.companyId || item.event.event.companyId === request.companyId)
      .filter((item) => !request.deviceId || item.event.event.deviceId === request.deviceId)
      .filter((item) => !request.eventName || item.event.envelope.eventName === request.eventName)
      .filter((item) => !request.fromOccurredAt || item.event.envelope.occurredAt >= request.fromOccurredAt)
      .filter((item) => !request.toOccurredAt || item.event.envelope.occurredAt <= request.toOccurredAt)
      .sort((a, b) => b.event.envelope.occurredAt.localeCompare(a.event.envelope.occurredAt));

    return pageItems(items, request);
  }

  async count(companyId?: string): Promise<number> {
    return this.events.filter((item) => !companyId || item.event.event.companyId === companyId).length;
  }

  async clear(): Promise<void> {
    this.events.length = 0;
  }
}

export class AplomoInMemoryOperationalIntelligenceRepository
  implements AplomoOperationalIntelligenceRepositoryPort
{
  private readonly alertsByCompany = new Map<string, AplomoOperationalAlert[]>();
  private readonly scoreSnapshotsByCompany = new Map<
    string,
    AplomoPersistedOperationalScoreSnapshot[]
  >();

  async saveAlerts(companyId: string, alerts: AplomoOperationalAlert[]): Promise<void> {
    this.alertsByCompany.set(companyId, alerts);
  }

  async listAlerts(companyId: string): Promise<AplomoOperationalAlert[]> {
    return this.alertsByCompany.get(companyId) ?? [];
  }

  async saveScoreSnapshot(
    snapshot: AplomoPersistedOperationalScoreSnapshot,
  ): Promise<void> {
    const current = this.scoreSnapshotsByCompany.get(snapshot.companyId) ?? [];
    this.scoreSnapshotsByCompany.set(snapshot.companyId, [snapshot, ...current].slice(0, 100));
  }

  async listScoreSnapshots(
    companyId: string,
  ): Promise<AplomoPersistedOperationalScoreSnapshot[]> {
    return this.scoreSnapshotsByCompany.get(companyId) ?? [];
  }

  async clear(): Promise<void> {
    this.alertsByCompany.clear();
    this.scoreSnapshotsByCompany.clear();
  }
}

export class AplomoInMemoryDataPlatformRepository
  implements AplomoDataPlatformRepositoryPort
{
  private readonly dataProducts = new Map<string, AplomoDataProductDefinition>();
  private readonly exportJobs = new Map<string, AplomoDataExportJob>();
  private readonly connectors = new Map<string, AplomoExternalConnectorDefinition>();
  private readonly llmTools = new Map<string, AplomoLlmToolDefinition>();

  constructor(seedDefaults = true) {
    if (seedDefaults) {
      for (const dataProduct of createAplomoDefaultDataProducts()) {
        this.dataProducts.set(dataProduct.id, dataProduct);
      }
    }
  }

  async upsertDataProduct(
    dataProduct: AplomoDataProductDefinition,
  ): Promise<AplomoDataProductDefinition> {
    this.dataProducts.set(dataProduct.id, dataProduct);

    return dataProduct;
  }

  async listDataProducts(
    request: AplomoDataProductListRequest,
  ): Promise<AplomoRepositoryPage<AplomoDataProductDefinition>> {
    const search = request.search?.trim().toLowerCase();

    const items = [...this.dataProducts.values()]
      .filter((item) => !request.companyId || !item.companyId || item.companyId === request.companyId)
      .filter((item) => !request.status || item.status === request.status)
      .filter((item) => !request.targetConsumer || item.targetConsumers.includes(request.targetConsumer))
      .filter((item) => {
        if (!search) {
          return true;
        }

        return (
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search) ||
          item.id.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return pageItems(items, request);
  }

  async getDataProduct(dataProductId: string): Promise<AplomoDataProductDefinition | null> {
    return this.dataProducts.get(dataProductId) ?? null;
  }

  async createExportJob(job: AplomoDataExportJob): Promise<AplomoDataExportJob> {
    this.exportJobs.set(job.id, job);

    return job;
  }

  async updateExportJob(job: AplomoDataExportJob): Promise<AplomoDataExportJob> {
    this.exportJobs.set(job.id, job);

    return job;
  }

  async listExportJobs(
    request: AplomoExportJobListRequest,
  ): Promise<AplomoRepositoryPage<AplomoDataExportJob>> {
    const items = [...this.exportJobs.values()]
      .filter((job) => job.companyId === request.companyId)
      .filter((job) => !request.dataProductId || job.dataProductId === request.dataProductId)
      .filter((job) => !request.status || job.status === request.status)
      .filter((job) => !request.target || job.target === request.target)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return pageItems(items, request);
  }

  async getExportJob(
    companyId: string,
    exportJobId: string,
  ): Promise<AplomoDataExportJob | null> {
    const job = this.exportJobs.get(exportJobId);

    if (!job || job.companyId !== companyId) {
      return null;
    }

    return job;
  }

  async upsertConnector(
    connector: AplomoExternalConnectorDefinition,
  ): Promise<AplomoExternalConnectorDefinition> {
    this.connectors.set(connector.id, connector);

    return connector;
  }

  async listConnectors(
    request: AplomoConnectorListRequest,
  ): Promise<AplomoRepositoryPage<AplomoExternalConnectorDefinition>> {
    const items = [...this.connectors.values()]
      .filter((connector) => connector.companyId === request.companyId)
      .filter((connector) => !request.status || connector.status === request.status)
      .filter((connector) => !request.target || connector.target === request.target)
      .sort((a, b) => a.name.localeCompare(b.name));

    return pageItems(items, request);
  }

  async getConnector(
    companyId: string,
    connectorId: string,
  ): Promise<AplomoExternalConnectorDefinition | null> {
    const connector = this.connectors.get(connectorId);

    if (!connector || connector.companyId !== companyId) {
      return null;
    }

    return connector;
  }

  async upsertLlmTool(tool: AplomoLlmToolDefinition): Promise<AplomoLlmToolDefinition> {
    this.llmTools.set(tool.id, tool);

    return tool;
  }

  async listLlmTools(
    request: AplomoLlmToolListRequest,
  ): Promise<AplomoRepositoryPage<AplomoLlmToolDefinition>> {
    const items = [...this.llmTools.values()]
      .filter((tool) => !request.companyId || !tool.companyId || tool.companyId === request.companyId)
      .filter((tool) => !request.providerFamily || tool.providerFamily === request.providerFamily)
      .filter((tool) => !request.status || tool.status === request.status)
      .sort((a, b) => a.name.localeCompare(b.name));

    return pageItems(items, request);
  }

  async getLlmTool(toolId: string): Promise<AplomoLlmToolDefinition | null> {
    return this.llmTools.get(toolId) ?? null;
  }
}

export class AplomoInMemoryPersistenceAdapter implements AplomoPersistenceAdapter {
  readonly driver = "memory" as const;
  readonly telemetry: AplomoTelemetryPersistencePort;
  readonly governedEvents: AplomoGovernedEventRepositoryPort;
  readonly operationalIntelligence: AplomoOperationalIntelligenceRepositoryPort;
  readonly dataPlatform: AplomoDataPlatformRepositoryPort;

  constructor(
    readonly telemetryStore = new AplomoInMemoryDeviceTelemetryStore(),
  ) {
    this.telemetry = new AplomoInMemoryTelemetryPersistencePort(telemetryStore);
    this.governedEvents = new AplomoInMemoryGovernedEventRepository();
    this.operationalIntelligence = new AplomoInMemoryOperationalIntelligenceRepository();
    this.dataPlatform = new AplomoInMemoryDataPlatformRepository(true);
  }

  async health(): Promise<AplomoPersistenceHealth> {
    const snapshot = await this.telemetry.getSnapshot();

    return {
      driver: this.driver,
      status: "ok",
      checkedAt: nowIso(),
      details: {
        devices: snapshot.devices.length,
        sessions: snapshot.sessions.length,
        connections: snapshot.connections.length,
        telemetryEvents: snapshot.telemetryEvents.length,
        latestPositions: snapshot.latestPositions.length,
      },
    };
  }
}

export const createAplomoInMemoryPersistenceAdapter = () => {
  return new AplomoInMemoryPersistenceAdapter();
};
