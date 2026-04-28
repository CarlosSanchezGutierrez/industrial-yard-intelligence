export const serviceStatuses = [
  "ok",
  "degraded",
  "unavailable"
] as const;

export type ServiceStatus = (typeof serviceStatuses)[number];

export interface HealthCheckResponse {
  readonly service: string;
  readonly status: ServiceStatus;
  readonly timestamp: string;
  readonly version?: string;
}

export function createHealthCheckResponse(input: {
  readonly service: string;
  readonly status: ServiceStatus;
  readonly timestamp: string;
  readonly version?: string;
}): HealthCheckResponse {
  return {
    service: input.service,
    status: input.status,
    timestamp: input.timestamp,
    ...(input.version !== undefined ? { version: input.version } : {})
  };
}