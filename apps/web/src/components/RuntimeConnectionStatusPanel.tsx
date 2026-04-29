import { useEffect, useMemo, useState } from "react";

type RuntimeStatus = "checking" | "online" | "offline";

interface RuntimeProbe {
    readonly key: string;
    readonly label: string;
    readonly description: string;
    readonly url: string;
    readonly status: RuntimeStatus;
    readonly detail: string;
}

function getConfiguredBaseUrl(value: unknown, fallback: string): string {
    if (typeof value === "string" && value.trim().length > 0) {
        return value.trim().replace(/\/+$/u, "");
    }

    return fallback;
}

function getApiBaseUrl(): string {
    return getConfiguredBaseUrl(import.meta.env.VITE_IYI_API_BASE_URL, "http://localhost:8788");
}

function getEdgeBaseUrl(): string {
    return getConfiguredBaseUrl(import.meta.env.VITE_IYI_EDGE_BASE_URL, "http://localhost:8787");
}

function getStatusClasses(status: RuntimeStatus): string {
    if (status === "online") {
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
    }

    if (status === "offline") {
        return "border-rose-200 bg-rose-50 text-rose-800";
    }

    return "border-slate-200 bg-slate-50 text-slate-700";
}

function getStatusLabel(status: RuntimeStatus): string {
    if (status === "online") {
        return "Online";
    }

    if (status === "offline") {
        return "Offline";
    }

    return "Checking";
}

async function probeRuntime(url: string): Promise<{ readonly ok: boolean; readonly detail: string }> {
    try {
        const response = await fetch(url, {
            headers: {
                accept: "application/json",
                "x-request-id": "web-runtime-connection-status",
            },
        });

        if (!response.ok) {
            return {
                ok: false,
                detail: `HTTP ${response.status}`,
            };
        }

        return {
            ok: true,
            detail: "Responding",
        };
    } catch (error) {
        return {
            ok: false,
            detail: error instanceof Error ? error.message : "Request failed",
        };
    }
}

function RuntimeProbeCard({
    probe,
}: {
    readonly probe: RuntimeProbe;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {probe.key}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-950">{probe.label}</h3>
                </div>

                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(probe.status)}`}>
                    {getStatusLabel(probe.status)}
                </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">{probe.description}</p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="break-all text-xs font-medium text-slate-500">{probe.url}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{probe.detail}</p>
            </div>
        </div>
    );
}

export function RuntimeConnectionStatusPanel() {
    const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
    const edgeBaseUrl = useMemo(() => getEdgeBaseUrl(), []);

    const [probes, setProbes] = useState<readonly RuntimeProbe[]>([
        {
            key: "Cloud API",
            label: "Backend principal",
            description: "Valida que apps/api este vivo para stockpiles, auditoria y sync preview.",
            url: `${apiBaseUrl}/health`,
            status: "checking",
            detail: "Waiting for first check",
        },
        {
            key: "Edge",
            label: "Runtime local",
            description: "Valida que apps/edge este vivo para operacion local-first y export DB projection.",
            url: `${edgeBaseUrl}/health`,
            status: "checking",
            detail: "Waiting for first check",
        },
        {
            key: "Sync",
            label: "Cloud Edge sync",
            description: "Valida que el Cloud API exponga capacidades de sync antes de probar preview/ingest.",
            url: `${apiBaseUrl}/sync/status`,
            status: "checking",
            detail: "Waiting for first check",
        },
    ]);
    const [updatedAt, setUpdatedAt] = useState<string>("Not checked yet");
    const [isRefreshing, setIsRefreshing] = useState(false);

    async function refreshRuntimeStatus() {
        setIsRefreshing(true);

        const nextProbes = await Promise.all(
            probes.map(async (probe) => {
                const result = await probeRuntime(probe.url);

                return {
                    ...probe,
                    status: result.ok ? "online" : "offline",
                    detail: result.detail,
                } satisfies RuntimeProbe;
            }),
        );

        setProbes(nextProbes);
        setUpdatedAt(new Date().toLocaleTimeString());
        setIsRefreshing(false);
    }

    useEffect(() => {
        void refreshRuntimeStatus();
    }, []);

    const onlineCount = probes.filter((probe) => probe.status === "online").length;
    const totalCount = probes.length;

    return (
        <section data-iyi-section="runtime" id="runtime-status" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Runtime status
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                        Estado vivo del stack local
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Durante la demo, este panel confirma que Cloud API, Edge y Sync estan respondiendo.
                        Si algo aparece offline, primero levanta el stack con pnpm dev:stack:windows.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Online
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                            {onlineCount}/{totalCount} services
                        </p>
                    </div>

                    <button
                        className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        disabled={isRefreshing}
                        onClick={() => {
                            void refreshRuntimeStatus();
                        }}
                        type="button"
                    >
                        {isRefreshing ? "Checking..." : "Refresh status"}
                    </button>
                </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {probes.map((probe) => (
                    <RuntimeProbeCard key={probe.key} probe={probe} />
                ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Last check
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">{updatedAt}</p>
            </div>
        </section>
    );
}