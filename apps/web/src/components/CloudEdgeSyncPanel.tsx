import { useEffect, useMemo, useState } from "react";

import type {
    CloudEdgeSyncIngestPayloadContract,
    CloudEdgeSyncPreviewPayloadContract,
    CloudEdgeSyncStatusPayloadContract,
} from "@iyi/api-contracts";

import {
    createDemoCloudEdgeSyncPackage,
    ingestCloudEdgeSyncPackagePreviewOnly,
    loadCloudEdgeSyncStatus,
    previewCloudEdgeSyncPackage,
} from "../data/cloud-edge-sync-client.js";

function joinValues(values: readonly string[]): string {
    return values.length > 0 ? values.join(", ") : "None";
}

function ResultBox({
    title,
    value,
}: {
    readonly title: string;
    readonly value: string;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {title}
            </p>
            <p className="mt-2 break-words text-sm text-slate-800">{value}</p>
        </div>
    );
}

export function CloudEdgeSyncPanel() {
    const [status, setStatus] = useState<CloudEdgeSyncStatusPayloadContract | null>(null);
    const [previewResult, setPreviewResult] = useState<CloudEdgeSyncPreviewPayloadContract | null>(null);
    const [ingestResult, setIngestResult] = useState<CloudEdgeSyncIngestPayloadContract | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isIngesting, setIsIngesting] = useState(false);

    const demoPreviewPackage = useMemo(() => {
        return createDemoCloudEdgeSyncPackage("sync_pkg_web_preview", 2);
    }, []);

    const demoIngestPackage = useMemo(() => {
        return createDemoCloudEdgeSyncPackage("sync_pkg_web_ingest", 3);
    }, []);

    async function refreshStatus() {
        const nextStatus = await loadCloudEdgeSyncStatus();

        setStatus(nextStatus);
    }

    useEffect(() => {
        let isMounted = true;

        async function loadStatus() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const nextStatus = await loadCloudEdgeSyncStatus();

                if (isMounted) {
                    setStatus(nextStatus);
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error instanceof Error ? error.message : "Could not load sync status.");
                    setStatus(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    async function handlePreview() {
        try {
            setIsPreviewing(true);
            setErrorMessage(null);

            const nextPreviewResult = await previewCloudEdgeSyncPackage(
                demoPreviewPackage,
                "manual_review",
            );

            setPreviewResult(nextPreviewResult);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Could not preview sync package.");
        } finally {
            setIsPreviewing(false);
        }
    }

    async function handleIngest() {
        try {
            setIsIngesting(true);
            setErrorMessage(null);

            const nextIngestResult = await ingestCloudEdgeSyncPackagePreviewOnly(
                demoIngestPackage,
                "reject",
            );

            setIngestResult(nextIngestResult);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Could not validate sync ingest.");
        } finally {
            setIsIngesting(false);
        }
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Cloud Edge sync
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-950">
                        Sync readiness cockpit
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Reads GET /sync/status and validates POST /sync/preview plus POST /sync/ingest.
                        Apply mode remains intentionally disabled until DB ingestion rules are ready.
                    </p>
                </div>

                <button
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={isLoading}
                    onClick={() => {
                        setIsLoading(true);
                        refreshStatus()
                            .then(() => {
                                setErrorMessage(null);
                            })
                            .catch((error: unknown) => {
                                setErrorMessage(error instanceof Error ? error.message : "Could not refresh sync status.");
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

            <div className="mt-5 grid gap-3 md:grid-cols-4">
                <ResultBox title="Enabled" value={status ? String(status.enabled) : "Unknown"} />
                <ResultBox
                    title="Package kinds"
                    value={status ? joinValues(status.supportedPackageKinds) : "Unknown"}
                />
                <ResultBox
                    title="Conflict policies"
                    value={status ? joinValues(status.supportedConflictPolicies) : "Unknown"}
                />
                <ResultBox
                    title="Directions"
                    value={status ? joinValues(status.supportedDirections) : "Unknown"}
                />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-950">Preview package</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Sends a demo db_projection_snapshot package with manual_review.
                            </p>
                        </div>

                        <button
                            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            disabled={isPreviewing}
                            onClick={handlePreview}
                            type="button"
                        >
                            {isPreviewing ? "Previewing..." : "Run preview"}
                        </button>
                    </div>

                    {previewResult ? (
                        <div className="mt-4 grid gap-2 text-sm text-slate-700">
                            <p>
                                Package: <span className="font-semibold">{previewResult.packageId}</span>
                            </p>
                            <p>
                                Accepted: <span className="font-semibold">{String(previewResult.accepted)}</span>
                            </p>
                            <p>
                                Records detected:{" "}
                                <span className="font-semibold">{previewResult.detectedRecordCount}</span>
                            </p>
                            <p>
                                Conflicts:{" "}
                                <span className="font-semibold">{previewResult.detectedConflictCount}</span>
                            </p>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-slate-500">No preview result yet.</p>
                    )}
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-950">Validate ingest</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Sends apply mode to confirm the API rejects real application safely.
                            </p>
                        </div>

                        <button
                            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            disabled={isIngesting}
                            onClick={handleIngest}
                            type="button"
                        >
                            {isIngesting ? "Validating..." : "Validate ingest"}
                        </button>
                    </div>

                    {ingestResult ? (
                        <div className="mt-4 grid gap-2 text-sm text-slate-700">
                            <p>
                                Package: <span className="font-semibold">{ingestResult.packageId}</span>
                            </p>
                            <p>
                                Accepted: <span className="font-semibold">{String(ingestResult.accepted)}</span>
                            </p>
                            <p>
                                Applied: <span className="font-semibold">{ingestResult.appliedRecordCount}</span>
                            </p>
                            <p>
                                Skipped: <span className="font-semibold">{ingestResult.skippedRecordCount}</span>
                            </p>
                            <p className="text-xs text-slate-500">{ingestResult.warnings.join(" ")}</p>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-slate-500">No ingest validation result yet.</p>
                    )}
                </div>
            </div>
        </section>
    );
}