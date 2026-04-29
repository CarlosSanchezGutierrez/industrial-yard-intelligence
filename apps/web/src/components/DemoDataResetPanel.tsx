import { useState } from "react";

type ResetStatus = "idle" | "resetting" | "success" | "error";

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

function unwrapPayload(value: unknown): unknown {
    if (isRecord(value) && "data" in value) {
        return value["data"];
    }

    return value;
}

function getNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    return null;
}

function summarizeResetPayload(payload: unknown): string {
    const unwrappedPayload = unwrapPayload(payload);

    if (!isRecord(unwrappedPayload)) {
        return "Cloud API reset completed.";
    }

    const stockpileCount =
        getNumber(unwrappedPayload["stockpileCount"]) ??
        getNumber(unwrappedPayload["stockpiles"]) ??
        null;
    const tenantCount =
        getNumber(unwrappedPayload["tenantCount"]) ??
        getNumber(unwrappedPayload["tenants"]) ??
        null;

    if (stockpileCount !== null && tenantCount !== null) {
        return `Cloud API demo data reset completed. Tenants: ${tenantCount}. Stockpiles: ${stockpileCount}.`;
    }

    if (stockpileCount !== null) {
        return `Cloud API demo data reset completed. Stockpiles: ${stockpileCount}.`;
    }

    return "Cloud API demo data reset completed.";
}

async function resetCloudApiDemoData(): Promise<string> {
    const response = await fetch(`${getApiBaseUrl()}/admin/db/reset`, {
        method: "POST",
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-request-id": "web-demo-data-reset",
        },
    });

    if (!response.ok) {
        throw new Error(`Cloud API reset failed with HTTP ${response.status}.`);
    }

    const body = (await response.json()) as unknown;

    return summarizeResetPayload(body);
}

function getStatusClasses(status: ResetStatus): string {
    if (status === "success") {
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
    }

    if (status === "error") {
        return "border-rose-200 bg-rose-50 text-rose-800";
    }

    if (status === "resetting") {
        return "border-amber-200 bg-amber-50 text-amber-800";
    }

    return "border-slate-200 bg-slate-50 text-slate-700";
}

function getStatusLabel(status: ResetStatus): string {
    if (status === "success") {
        return "Ready";
    }

    if (status === "error") {
        return "Needs attention";
    }

    if (status === "resetting") {
        return "Resetting";
    }

    return "Idle";
}

export function DemoDataResetPanel() {
    const [status, setStatus] = useState<ResetStatus>("idle");
    const [message, setMessage] = useState("Use this before a live demo to return Cloud API data to the seed baseline.");
    const [lastResetAt, setLastResetAt] = useState("Not reset in this session");

    async function handleReset() {
        try {
            setStatus("resetting");
            setMessage("Resetting Cloud API demo data...");

            const nextMessage = await resetCloudApiDemoData();

            setStatus("success");
            setMessage(`${nextMessage} Refresh the cockpit panels if stale data remains visible.`);
            setLastResetAt(new Date().toLocaleTimeString());
        } catch (error) {
            setStatus("error");
            setMessage(error instanceof Error ? error.message : "Cloud API reset failed.");
        }
    }

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Demo data control
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                        Reset rapido para presentacion
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Antes de mostrar el flujo operador, regresa el Cloud API a datos seed para evitar
                        resultados inconsistentes durante la demo.
                    </p>
                </div>

                <button
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={status === "resetting"}
                    onClick={() => {
                        void handleReset();
                    }}
                    type="button"
                >
                    {status === "resetting" ? "Resetting..." : "Reset Cloud API demo data"}
                </button>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_2fr_1fr]">
                <div className={`rounded-2xl border px-4 py-3 ${getStatusClasses(status)}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">Status</p>
                    <p className="mt-1 text-sm font-semibold">{getStatusLabel(status)}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Result
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{message}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Last reset
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{lastResetAt}</p>
                </div>
            </div>
        </section>
    );
}