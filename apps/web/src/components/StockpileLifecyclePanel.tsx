import { useEffect, useMemo, useState } from "react";

import {
    loadCloudApiStockpileLifecycle,
    type StockpileLifecycleDashboardSnapshot,
} from "../data/stockpile-lifecycle-client.js";

const statusLabels: Record<string, string> = {
    draft: "Draft",
    operational: "Operational",
    pending_review: "Pending review",
    validated: "Validated",
    archived: "Archived",
};

const fallbackStatuses = [
    "draft",
    "operational",
    "pending_review",
    "validated",
    "archived",
] as const;

export function StockpileLifecyclePanel() {
    const [snapshot, setSnapshot] = useState<StockpileLifecycleDashboardSnapshot | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadLifecycle() {
            try {
                setIsLoading(true);
                const nextSnapshot = await loadCloudApiStockpileLifecycle();

                if (isMounted) {
                    setSnapshot(nextSnapshot);
                    setErrorMessage(null);
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error instanceof Error ? error.message : "Could not load lifecycle.");
                    setSnapshot(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadLifecycle();

        return () => {
            isMounted = false;
        };
    }, []);

    const statuses = useMemo(() => {
        return snapshot?.statuses ?? fallbackStatuses;
    }, [snapshot]);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Domain lifecycle
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-950">
                        Stockpile status model
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Loaded from Cloud API GET /stockpiles/lifecycle. This keeps the cockpit aligned
                        with the shared domain rules instead of duplicating state transitions in the UI.
                    </p>
                </div>

                <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                    {isLoading ? "Loading" : snapshot ? "Live API" : "Fallback"}
                </div>
            </div>

            {errorMessage ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    {errorMessage}
                </div>
            ) : null}

            <div className="mt-4 grid gap-3 md:grid-cols-5">
                {statuses.map((status) => {
                    const allowedTransitions = snapshot?.allowedTransitionsByStatus[status] ?? [];

                    return (
                        <article
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                            key={status}
                        >
                            <h3 className="text-sm font-semibold text-slate-950">
                                {statusLabels[status] ?? status}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">{status}</p>

                            <div className="mt-3">
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                    Next
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {allowedTransitions.length > 0 ? (
                                        allowedTransitions.map((transition) => (
                                            <span
                                                className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                                                key={`${status}-${transition}`}
                                            >
                                                {statusLabels[transition] ?? transition}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500">
                                            Final state
                                        </span>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}