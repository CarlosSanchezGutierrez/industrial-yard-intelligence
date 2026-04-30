export type AplomoApiSuccess<T> = {
  ok: true;
  data: T;
  requestId?: string;
};

export type AplomoApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId?: string;
};

export type AplomoApiResult<T> = AplomoApiSuccess<T> | AplomoApiFailure;

export type AplomoPageRequest = {
  limit?: number;
  cursor?: string;
};

export type AplomoPageInfo = {
  limit: number;
  nextCursor?: string;
  hasMore: boolean;
};

export type AplomoPagedResult<T> = {
  items: T[];
  page: AplomoPageInfo;
};

export type AplomoApiActor = {
  companyId: string;
  profileId?: string;
  role?: string;
};

export type AplomoApiAuditContext = {
  requestId?: string;
  actor?: AplomoApiActor;
  ipAddress?: string;
  userAgent?: string;
  source?: "web" | "mobile" | "gateway" | "api" | "simulation" | "unknown";
};
