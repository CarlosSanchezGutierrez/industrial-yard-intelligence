import { useEffect, useMemo, useState } from "react";

interface AuditTimelineEvent {
    readonly id: string;
    readonly action: string;
    readonly entityType: string;
    readonly entityId: string;
    readonly actor: string;
    readonly occurredAt: string;
    readonly summary: string;
}

interface AuditTimelineMetrics {
    readonly total: number;
    readonly stockpileEvents: number;
    readonly statusUpdates: number;
    readonly createdEvents: number;
}

type LoadStatus = "idle" | "loading" | "ready" | "error";

function getApiBaseUrl(): string {
    const configuredBaseUrl = import.meta.env.VITE_IYI_API_BASE_URL;

    if (typeof configuredBaseUrl === "string" && configuredBaseUrl.trim().length > 0) {
        return configuredBaseUrl.trim().replace(/\/+$/u, "");
    }

    return "http://localhost:8788";
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unwrapData(value: unknown): unknown {
    if (isRecord(value) && "data" in value) {
        return value["data"];
    }

    return value;
}

function getString(value: unknown, fallback: string): string {
    if (typeof value === "string" && value.trim().length > 0) {
        return value;
    }

    if (typeof value === "number") {
        return String(value);
    }

    return fallback;
}

function getRecordString(record: Record<string, unknown>, keys: readonly string[], fallback: string): string {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "string" && value.trim().length > 0) {
            return value;
        }

        if (typeof value === "number") {
            return String(value);
        }
    }

    return fallback;
}

function formatAuditAction(action: string): string {
    if (action === "stockpile.created" || action === "stockpile_create" || action === "created") {
        return "Stockpile created";
    }

    if (
        action === "stockpile.status_updated" ||
        action === "stockpile_status_updated" ||
        action === "status_updated"
    ) {
        return "Status updated";
    }

    if (action === "stockpile.updated" || action === "updated") {
        return "Stockpile updated";
    }

    return action
        .replace(/[._-]+/gu, " ")
        .replace(/\b\w/gu, (match) => match.toUpperCase());
}

function formatTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function normalizeAuditEvent(rawEvent: unknown, index: number): AuditTimelineEvent | null {
    if (!isRecord(rawEvent)) {
        return null;
    }

    const id = getRecordString(rawEvent, ["id", "auditEntryId", "entryId"], `audit_event_${index + 1}`);
    const action = getRecordString(rawEvent, ["action", "eventType", "type", "mutationType"], "audit.event");
    const entityType = getRecordString(rawEvent, ["entityType", "resourceType", "subjectType"], "stockpile");
    const entityId = getRecordString(rawEvent, ["entityId", "stockpileId", "resourceId", "subjectId"], "unknown");
    const actor = getRecordString(rawEvent, ["actorId", "actor", "userId", "createdBy"], "system");
    const occurredAt = getRecordString(
        rawEvent,
        ["occurredAt", "createdAt", "timestamp", "recordedAt"],
        new Date().toISOString(),
    );
    const summary = getRecordString(
        rawEvent,
        ["summary", "description", "message"],
        `${formatAuditAction(action)} for ${entityType} ${entityId}`,
    );

    return {
        id,
        action,
        entityType,
        entityId,
        actor,
        occurredAt,
        summary,
    };
}

function extractAuditEvents(payload: unknown): readonly AuditTimelineEvent[] {
    const data = unwrapData(payload);

    if (Array.isArray(data)) {
        return data
            .map((item, index) => normalizeAuditEvent(item, index))
            .filter((item): item is AuditTimelineEvent => item !== null);
    }

    if (isRecord(data)) {
        const candidateArrays = [
            data["entries"],
            data["auditEntries"],
            data["mutations"],
            data["items"],
            data["records"],
            data["results"],
        ];

        for (const candidateArray of candidateArrays) {
            if (Array.isArray(candidateArray)) {
                return candidateArray
                    .map((item, index) => normalizeAuditEvent(item, index))
                    .filter((item): item is AuditTimelineEvent => item !== null);
            }
        }
    }

    return [];
}

function buildMetrics(events: readonly AuditTimelineEvent[]): AuditTimelineMetrics {
    return {
        total: events.length,
        stockpileEvents: events.filter((event) => event.entityType.toLowerCase().includes("stockpile")).length,
        statusUpdates: events.filter((event) => event.action.toLowerCase().includes("status")).length,
        createdEvents: events.filter((event) => event.action.toLowerCase().includes("created")).length,
    };
}

function getActionClasses(action: string): string {
    const normalizedAction = action.toLowerCase();

    if (normalizedAction.includes("created")) {
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
    }

    if (normalizedAction.includes("status")) {
        return "border-blue-200 bg-blue-50 text-blue-800";
    }

    if (normalizedAction.includes("updated")) {
        return "border-amber-200 bg-amber-50 text-amber-800";
    }

    return "border-slate-200 bg-slate-50 text-slate-700";
}

function MetricCard({
    label,
    value,
}: {
    readonly label: string;
    readonly value: number;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function AuditEventCard({
    event,
    index,
}: {
    readonly event: AuditTimelineEvent;
    readonly index: number;
}) {
    return (
        <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                    {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-base font-semibold text-slate-950">
                            {formatAuditAction(event.action)}
                        </h3>
                        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getActionClasses(event.action)}`}>
                            {event.entityType}
                        </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">{event.summary}</p>

                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Entity
                            </p>
                            <p className="mt-1 break-all text-sm font-semibold text-slate-950">{event.entityId}</p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Actor
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">{event.actor}</p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Time
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">{formatTime(event.occurredAt)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AuditTimelineStoryPanel() {
    const [status, setStatus] = useState<LoadStatus>("idle");
    const [events, setEvents] = useState<readonly AuditTimelineEvent[]>([]);
    const [message, setMessage] = useState("Load audit events to show the traceability story.");
    const [updatedAt, setUpdatedAt] = useState("Not loaded yet");

    const metrics = useMemo(() => buildMetrics(events), [events]);

    async function loadAuditTimeline() {
        try {
            setStatus("loading");
            setMessage("Loading mutation audit timeline...");

            const response = await fetch(`${getApiBaseUrl()}/audit/mutations`, {
                headers: {
                    accept: "application/json",
                    "x-request-id": "web-audit-timeline-story",
                },
            });

            if (!response.ok) {
                throw new Error(`Cloud API audit timeline failed with HTTP ${response.status}.`);
            }

            const body = (await response.json()) as unknown;
            const nextEvents = extractAuditEvents(body);

            setEvents(nextEvents);
            setStatus("ready");
            setUpdatedAt(new Date().toLocaleTimeString());
            setMessage(
                nextEvents.length > 0
                    ? "Audit timeline ready for demo."
                    : "No audit events yet. Create or update a stockpile first.",
            );
        } catch (error) {
            setStatus("error");
            setMessage(error instanceof Error ? error.message : "Could not load audit timeline.");
        }
    }

    useEffect(() => {
        void loadAuditTimeline();
    }, []);

    return (
        <section id="audit-story" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Audit timeline story
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                        Trazabilidad explicable para supervisores
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Convierte los eventos de auditoria en una narrativa clara: quien cambio que,
                        cuando ocurrio y sobre que stockpile o recurso operacional.
                    </p>
                </div>

                <button
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={status === "loading"}
                    onClick={() => {
                        void loadAuditTimeline();
                    }}
                    type="button"
                >
                    {status === "loading" ? "Loading..." : "Refresh audit timeline"}
                </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
                <MetricCard label="Events" value={metrics.total} />
                <MetricCard label="Stockpiles" value={metrics.stockpileEvents} />
                <MetricCard label="Status updates" value={metrics.statusUpdates} />
                <MetricCard label="Created" value={metrics.createdEvents} />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-slate-950">{message}</p>
                    <p className="text-sm text-slate-500">Last load: {updatedAt}</p>
                </div>
            </div>

            <div className="mt-5 grid gap-3">
                {events.slice(0, 6).map((event, index) => (
                    <AuditEventCard event={event} index={index} key={event.id} />
                ))}
            </div>

            {events.length > 6 ? (
                <p className="mt-4 text-sm text-slate-500">
                    Showing 6 of {events.length} audit events for demo readability.
                </p>
            ) : null}
        </section>
    );
}