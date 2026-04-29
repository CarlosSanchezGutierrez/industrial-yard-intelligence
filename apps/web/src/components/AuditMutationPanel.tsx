import { useEffect, useMemo, useState } from "react";

import type { CloudApiAuditMutationEntryContract } from "@iyi/api-contracts";

import {
    loadCloudApiAuditDashboardSnapshot,
    type CloudApiAuditDashboardSnapshot,
} from "../data/audit-client.js";

const mutationLabels: Record<string, string> = {
    "stockpile.created": "Stockpile created",
    "stockpile.status_updated": "Status updated",
};

function formatDateTime(value: string): string {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleString();
}

function getStockpileLabel(entry: CloudApiAuditMutationEntryContract): string {
    const mutation = entry.mutation;

    if (mutation.type === "stockpile.created") {
        return mutation.stockpileName;
    }

    if (mutation.type === "stockpile.status_updated") {
        return mutation.stockpileId;
    }

    return "Unknown stockpile";
}

function getMutationDescription(entry: CloudApiAuditMutationEntryContract): string {
    const mutation = entry.mutation;

    if (mutation.type === "stockpile.created") {
        return `Created as ${mutation.status}`;
    }

    if (mutation.type === "stockpile.status_updated") {
        return `${mutation.previousStatus} -> ${mutation.nextStatus}`;
    }

    return mutation.type;
}

export function AuditMutationPanel() {
    const [snapshot, setSnapshot] = useState<CloudApiAuditDashboardSnapshot | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function refreshAuditSnapshot() {
        const nextSnapshot = await loadCloudApiAuditDashboardSnapshot();

        setSnapshot(nextSnapshot);
    }

    useEffect(() => {
        let isMounted = true;

        async function loadAuditSnapshot() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const nextSnapshot = await loadCloudApiAuditDashboardSnapshot();

                if (isMounted) {
                    setSnapshot(nextSnapshot);
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error instanceof Error ? error.message : "Could not load audit mutations.");
                    setSnapshot(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadAuditSnapshot();

        return () => {
            isMounted = false;
        };
    }, []);

    const entries = useMemo(() => {
        return snapshot?.mutations.entries ?? [];
    }, [snapshot]);

    const latestEntries = useMemo(() => {
        return entries.slice(-5).reverse();
    }, [entries]);

    const createdCount = snapshot?.summary.mutationCountsByType["stockpile.created"] ?? 0;
    const statusUpdatedCount = snapshot?.summary.mutationCountsByType["stockpile.status_updated"] ?? 0;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Audit trail
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-950">
                        Cloud API mutation audit
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Runtime audit entries from GET /audit/summary and GET /audit/mutations.
                        This panel verifies that stockpile creation and status changes are becoming traceable.
                    </p>
                </div>

                <button
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={isLoading}
                    onClick={() => {
                        setIsLoading(true);
                        refreshAuditSnapshot()
                            .then(() => {
                                setErrorMessage(null);
                            })
                            .catch((error: unknown) => {
                                setErrorMessage(
                                    error instanceof Error ? error.message : "Could not refresh audit mutations.",
                                );
                            })
                            .finally(() => {
                                setIsLoading(false);
                            });
                    }}
                    type="button"
                >
                    {isLoading ? "Loading..." : "Refresh"}
                </button>
            </div>

            {errorMessage ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    {errorMessage}
                </div>
            ) : null}

            <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Audit entries
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                        {snapshot?.summary.auditEntryCount ?? 0}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Created
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">{createdCount}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Status updates
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">{statusUpdatedCount}</p>
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-950">Latest audit entries</h3>
                </div>

                {latestEntries.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                        {latestEntries.map((entry) => (
                            <article className="grid gap-2 px-4 py-3 md:grid-cols-[1.2fr_1fr_1fr]" key={entry.id}>
                                <div>
                                    <p className="text-sm font-semibold text-slate-950">
                                        {mutationLabels[entry.mutation.type] ?? entry.mutation.type}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">{entry.id}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-700">{getStockpileLabel(entry)}</p>
                                    <p className="mt-1 text-xs text-slate-500">{getMutationDescription(entry)}</p>
                                </div>

                                <div className="md:text-right">
                                    <p className="text-sm text-slate-700">
                                        {formatDateTime(entry.context.occurredAt)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {entry.context.actor.displayName ?? entry.context.actor.id ?? entry.context.actor.type}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-6 text-sm text-slate-500">
                        No audit entries yet. Create or update a stockpile to generate runtime audit records.
                    </div>
                )}
            </div>
        </section>
    );
}