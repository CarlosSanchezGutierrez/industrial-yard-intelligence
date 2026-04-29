import { useEffect, useMemo, useState } from "react";

import {
    loadCloudApiDashboardSnapshot,
    updateCloudApiStockpileStatus,
} from "../data/api-client.js";
import {
    loadCloudApiStockpileLifecycle,
    type StockpileLifecycleDashboardSnapshot,
} from "../data/stockpile-lifecycle-client.js";

type StockpileStatusPanelProps = {
    onRefresh?: () => Promise<void> | void;
    onStatusUpdated?: () => Promise<void> | void;
    [key: string]: unknown;
};

type StockpileOption = {
    id: string;
    name: string;
    status: string;
    materialName?: string;
    zoneName?: string;
};

const fallbackStatuses = [
    "draft",
    "operational",
    "pending_review",
    "validated",
    "archived",
] as const;

const statusLabels: Record<string, string> = {
    draft: "Draft",
    operational: "Operational",
    pending_review: "Pending review",
    validated: "Validated",
    archived: "Archived",
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(record: Record<string, unknown>, keys: readonly string[]): string | undefined {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "string" && value.trim().length > 0) {
            return value;
        }

        if (typeof value === "number") {
            return String(value);
        }
    }

    return undefined;
}

function toStockpileOption(value: unknown): StockpileOption | null {
    if (!isRecord(value)) {
        return null;
    }

    const id = getString(value, ["id", "stockpileId"]);
    const status = getString(value, ["status", "lifecycleStatus", "currentStatus"]);

    if (!id || !status) {
        return null;
    }

    const materialName = getString(value, ["materialName", "material", "commodity"]);
    const zoneName = getString(value, ["zoneName", "yardZoneName", "zone"]);

    return {
        id,
        name: getString(value, ["name", "label", "code", "id"]) ?? id,
        status,
        ...(materialName !== undefined ? { materialName } : {}),
        ...(zoneName !== undefined ? { zoneName } : {}),
    };
}
function findStockpileOptions(value: unknown, depth = 0): StockpileOption[] {
    if (depth > 4) {
        return [];
    }

    if (Array.isArray(value)) {
        const options = value
            .map((item) => toStockpileOption(item))
            .filter((item): item is StockpileOption => item !== null);

        if (options.length > 0) {
            return options;
        }

        for (const item of value) {
            const nestedOptions = findStockpileOptions(item, depth + 1);

            if (nestedOptions.length > 0) {
                return nestedOptions;
            }
        }

        return [];
    }

    if (!isRecord(value)) {
        return [];
    }

    const priorityKeys = [
        "stockpiles",
        "stockpileSummaries",
        "items",
        "data",
        "snapshot",
        "dashboard",
        "cloudApi",
        "cloud",
    ];

    for (const key of priorityKeys) {
        if (!(key in value)) {
            continue;
        }

        const options = findStockpileOptions(value[key], depth + 1);

        if (options.length > 0) {
            return options;
        }
    }

    for (const nestedValue of Object.values(value)) {
        const options = findStockpileOptions(nestedValue, depth + 1);

        if (options.length > 0) {
            return options;
        }
    }

    return [];
}

function getAllowedTransitions(
    lifecycle: StockpileLifecycleDashboardSnapshot | null,
    status: string,
): readonly string[] {
    if (!lifecycle) {
        return fallbackStatuses;
    }

    const transitionsByStatus = lifecycle.allowedTransitionsByStatus as Record<
        string,
        readonly string[] | undefined
    >;

    return transitionsByStatus[status] ?? fallbackStatuses;
}

function uniqueStatuses(statuses: readonly string[]): string[] {
    return Array.from(new Set(statuses));
}

export function StockpileStatusPanel(props: StockpileStatusPanelProps) {
    const [lifecycle, setLifecycle] = useState<StockpileLifecycleDashboardSnapshot | null>(null);
    const [stockpiles, setStockpiles] = useState<StockpileOption[]>([]);
    const [selectedStockpileId, setSelectedStockpileId] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function refreshPanelData() {
        const [nextLifecycle, nextDashboard] = await Promise.all([
            loadCloudApiStockpileLifecycle(),
            loadCloudApiDashboardSnapshot(),
        ]);

        setLifecycle(nextLifecycle);
        setStockpiles(findStockpileOptions(nextDashboard));
    }

    useEffect(() => {
        let isMounted = true;

        async function loadPanelData() {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                setMessage(null);

                const [nextLifecycle, nextDashboard] = await Promise.all([
                    loadCloudApiStockpileLifecycle(),
                    loadCloudApiDashboardSnapshot(),
                ]);

                if (isMounted) {
                    setLifecycle(nextLifecycle);
                    setStockpiles(findStockpileOptions(nextDashboard));
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error instanceof Error ? error.message : "Could not load stockpile data.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadPanelData();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (selectedStockpileId || stockpiles.length === 0) {
            return;
        }

        setSelectedStockpileId(stockpiles[0]?.id ?? "");
    }, [selectedStockpileId, stockpiles]);

    const selectedStockpile = useMemo(() => {
        return stockpiles.find((stockpile) => stockpile.id === selectedStockpileId) ?? null;
    }, [selectedStockpileId, stockpiles]);

    const selectableStatuses = useMemo(() => {
        if (!selectedStockpile) {
            return lifecycle?.statuses ? Array.from(lifecycle.statuses) : Array.from(fallbackStatuses);
        }

        return uniqueStatuses([
            selectedStockpile.status,
            ...getAllowedTransitions(lifecycle, selectedStockpile.status),
        ]);
    }, [lifecycle, selectedStockpile]);

    useEffect(() => {
        if (!selectedStockpile) {
            setSelectedStatus("");
            return;
        }

        setSelectedStatus(selectedStockpile.status);
    }, [selectedStockpile?.id, selectedStockpile?.status]);

    async function notifyExternalRefresh() {
        const callbacks = [props.onStatusUpdated, props.onRefresh];

        for (const callback of callbacks) {
            if (typeof callback === "function") {
                await callback();
            }
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedStockpile) {
            setErrorMessage("Select a stockpile before updating status.");
            return;
        }

        if (!selectedStatus) {
            setErrorMessage("Select a target status.");
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            setMessage(null);

            await (
                updateCloudApiStockpileStatus as unknown as (
                    stockpileId: string,
                    status: string,
                ) => Promise<unknown>
            )(selectedStockpile.id, selectedStatus);

            await refreshPanelData();
            await notifyExternalRefresh();

            setMessage(`Updated ${selectedStockpile.name} to ${statusLabels[selectedStatus] ?? selectedStatus}.`);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Could not update stockpile status.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section data-iyi-section="operations" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Stockpile lifecycle action
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-950">
                        Update stockpile status
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Status options are loaded from GET /stockpiles/lifecycle and filtered by
                        the selected stockpile current state.
                    </p>
                </div>

                <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                    {isLoading ? "Loading" : lifecycle ? "Domain-driven" : "Fallback"}
                </div>
            </div>

            {errorMessage ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            ) : null}

            {message ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {message}
                </div>
            ) : null}

            <form className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit}>
                <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Stockpile
                    </span>
                    <select
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        disabled={isLoading || isSubmitting || stockpiles.length === 0}
                        onChange={(event) => {
                            setSelectedStockpileId(event.target.value);
                        }}
                        value={selectedStockpileId}
                    >
                        {stockpiles.length === 0 ? (
                            <option value="">No stockpiles available</option>
                        ) : null}

                        {stockpiles.map((stockpile) => (
                            <option key={stockpile.id} value={stockpile.id}>
                                {stockpile.name} · {statusLabels[stockpile.status] ?? stockpile.status}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Target status
                    </span>
                    <select
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        disabled={isLoading || isSubmitting || !selectedStockpile}
                        onChange={(event) => {
                            setSelectedStatus(event.target.value);
                        }}
                        value={selectedStatus}
                    >
                        {selectableStatuses.map((status) => (
                            <option key={status} value={status}>
                                {statusLabels[status] ?? status}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="flex items-end">
                    <button
                        className="w-full rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 lg:w-auto"
                        disabled={isLoading || isSubmitting || !selectedStockpile || !selectedStatus}
                        type="submit"
                    >
                        {isSubmitting ? "Updating..." : "Update status"}
                    </button>
                </div>
            </form>

            {selectedStockpile ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <p>
                        Current status:{" "}
                        <span className="font-semibold text-slate-950">
                            {statusLabels[selectedStockpile.status] ?? selectedStockpile.status}
                        </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        {selectedStockpile.materialName ? `Material: ${selectedStockpile.materialName}` : ""}
                        {selectedStockpile.materialName && selectedStockpile.zoneName ? " · " : ""}
                        {selectedStockpile.zoneName ? `Zone: ${selectedStockpile.zoneName}` : ""}
                    </p>
                </div>
            ) : null}
        </section>
    );
}