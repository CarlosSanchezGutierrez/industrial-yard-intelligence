import { useMemo, useState } from "react";

type StepStatus = "idle" | "running" | "success" | "error";

interface SyncStepState {
    readonly status: StepStatus;
    readonly title: string;
    readonly description: string;
    readonly detail: string;
}

interface ExportedSyncPackageManifest {
    readonly packageId?: string;
    readonly packageKind?: string;
    readonly direction?: string;
    readonly schemaVersion?: string;
    readonly payloadHash?: string;
    readonly payloadRecordCount?: number;
}

interface ExportedSyncPackage {
    readonly manifest?: ExportedSyncPackageManifest;
    readonly payload?: unknown;
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

    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }

    return fallback;
}

function getNumber(value: unknown, fallback: number): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    return fallback;
}

function toManifest(value: unknown): ExportedSyncPackageManifest | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    return {
        packageId: getString(value["packageId"], ""),
        packageKind: getString(value["packageKind"], ""),
        direction: getString(value["direction"], ""),
        schemaVersion: getString(value["schemaVersion"], ""),
        payloadHash: getString(value["payloadHash"], ""),
        payloadRecordCount: getNumber(value["payloadRecordCount"], 0),
    };
}

function createExportedSyncPackage(
    manifestCandidate: unknown,
    payload: unknown,
): ExportedSyncPackage {
    const manifest = toManifest(manifestCandidate);

    return {
        ...(manifest !== undefined ? { manifest } : {}),
        payload,
    };
}

function toExportedSyncPackage(value: unknown): ExportedSyncPackage | null {
    const data = unwrapData(value);

    if (!isRecord(data)) {
        return null;
    }

    const packageCandidate = data["package"];

    if (isRecord(packageCandidate)) {
        return createExportedSyncPackage(
            packageCandidate["manifest"],
            packageCandidate["payload"],
        );
    }

    if ("manifest" in data || "payload" in data) {
        return createExportedSyncPackage(data["manifest"], data["payload"]);
    }

    return null;
}

function getStepClasses(status: StepStatus): string {
    if (status === "success") {
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
    }

    if (status === "error") {
        return "border-rose-200 bg-rose-50 text-rose-800";
    }

    if (status === "running") {
        return "border-amber-200 bg-amber-50 text-amber-800";
    }

    return "border-slate-200 bg-slate-50 text-slate-700";
}

function getStepLabel(status: StepStatus): string {
    if (status === "success") {
        return "OK";
    }

    if (status === "error") {
        return "Error";
    }

    if (status === "running") {
        return "Running";
    }

    return "Ready";
}

function createInitialStepState(): readonly SyncStepState[] {
    return [
        {
            status: "idle",
            title: "1. Cloud sync status",
            description: "Confirma que apps/api expone capacidades de sync.",
            detail: "GET /sync/status",
        },
        {
            status: "idle",
            title: "2. Edge package export",
            description: "Genera paquete db_projection_snapshot desde apps/edge.",
            detail: "GET /sync/packages/db-projection",
        },
        {
            status: "idle",
            title: "3. Cloud preview",
            description: "Valida el paquete en Cloud API sin aplicar cambios.",
            detail: "POST /sync/preview",
        },
        {
            status: "idle",
            title: "4. Apply blocked",
            description: "Demuestra que apply sigue bloqueado de forma segura.",
            detail: "POST /sync/ingest",
        },
    ];
}

function updateStep(
    steps: readonly SyncStepState[],
    index: number,
    status: StepStatus,
    detail: string,
): readonly SyncStepState[] {
    return steps.map((step, stepIndex) =>
        stepIndex === index
            ? {
                  ...step,
                  status,
                  detail,
              }
            : step,
    );
}

async function requestJson(url: string, init?: RequestInit): Promise<unknown> {
    const response = await fetch(url, {
        ...init,
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-request-id": "web-sync-demo-story",
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as unknown;
}

function SyncStepCard({
    step,
    index,
}: {
    readonly step: SyncStepState;
    readonly index: number;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                    {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-base font-semibold text-slate-950">{step.title}</h3>
                        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStepClasses(step.status)}`}>
                            {getStepLabel(step.status)}
                        </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                    <p className="mt-3 break-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-500">
                        {step.detail}
                    </p>
                </div>
            </div>
        </div>
    );
}

function SyncPackageSummary({
    syncPackage,
}: {
    readonly syncPackage: ExportedSyncPackage | null;
}) {
    const manifest = syncPackage?.manifest;

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Last exported package
            </p>

            {manifest ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Package
                        </p>
                        <p className="mt-1 break-all text-sm font-semibold text-slate-950">
                            {manifest.packageId}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Kind
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                            {manifest.packageKind}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Direction
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                            {manifest.direction}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Records
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                            {manifest.payloadRecordCount ?? 0}
                        </p>
                    </div>
                </div>
            ) : (
                <p className="mt-2 text-sm text-slate-600">
                    Run sync demo to export an Edge DB projection package.
                </p>
            )}
        </div>
    );
}

export function SyncDemoStoryPanel() {
    const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
    const edgeBaseUrl = useMemo(() => getEdgeBaseUrl(), []);
    const [steps, setSteps] = useState<readonly SyncStepState[]>(createInitialStepState());
    const [isRunning, setIsRunning] = useState(false);
    const [message, setMessage] = useState("Run the guided sync story to demonstrate safe edge-to-cloud flow.");
    const [syncPackage, setSyncPackage] = useState<ExportedSyncPackage | null>(null);

    async function runSyncStory() {
        const packageId = `sync_pkg_web_demo_${Date.now()}`;

        setIsRunning(true);
        setMessage("Running sync demo story...");
        setSteps(createInitialStepState());
        setSyncPackage(null);

        try {
            setSteps((currentSteps) => updateStep(currentSteps, 0, "running", "Checking /sync/status..."));
            const statusPayload = await requestJson(`${apiBaseUrl}/sync/status`);
            const statusData = unwrapData(statusPayload);
            const statusDetail = isRecord(statusData)
                ? `Cloud sync status loaded. ${Object.keys(statusData).length} fields returned.`
                : "Cloud sync status loaded.";
            setSteps((currentSteps) => updateStep(currentSteps, 0, "success", statusDetail));

            setSteps((currentSteps) => updateStep(currentSteps, 1, "running", "Exporting edge DB projection package..."));
            const exportPayload = await requestJson(
                `${edgeBaseUrl}/sync/packages/db-projection?packageId=${encodeURIComponent(packageId)}`,
            );
            const exportedPackage = toExportedSyncPackage(exportPayload);

            if (!exportedPackage?.manifest) {
                throw new Error("Edge export did not return a valid package manifest.");
            }

            setSyncPackage(exportedPackage);
            setSteps((currentSteps) =>
                updateStep(
                    currentSteps,
                    1,
                    "success",
                    `${exportedPackage.manifest?.packageKind ?? "package"} exported with ${
                        exportedPackage.manifest?.payloadRecordCount ?? 0
                    } records.`,
                ),
            );

            setSteps((currentSteps) => updateStep(currentSteps, 2, "running", "Sending package to /sync/preview..."));
            const previewPayload = await requestJson(`${apiBaseUrl}/sync/preview`, {
                method: "POST",
                body: JSON.stringify({
                    package: exportedPackage,
                    conflictPolicy: "manual_review",
                }),
            });
            const previewData = unwrapData(previewPayload);
            const acceptedPreview = isRecord(previewData) ? getString(previewData["accepted"], "unknown") : "unknown";
            setSteps((currentSteps) =>
                updateStep(currentSteps, 2, "success", `Preview completed. Accepted: ${acceptedPreview}.`),
            );

            setSteps((currentSteps) => updateStep(currentSteps, 3, "running", "Confirming apply mode stays blocked..."));
            const ingestPayload = await requestJson(`${apiBaseUrl}/sync/ingest`, {
                method: "POST",
                body: JSON.stringify({
                    package: exportedPackage,
                    ingestMode: "apply",
                    conflictPolicy: "reject",
                }),
            });
            const ingestData = unwrapData(ingestPayload);
            const acceptedIngest = isRecord(ingestData) ? getString(ingestData["accepted"], "unknown") : "unknown";
            const skippedRecords = isRecord(ingestData) ? getNumber(ingestData["skippedRecordCount"], 0) : 0;

            if (acceptedIngest !== "false") {
                throw new Error("Apply mode was expected to remain disabled.");
            }

            setSteps((currentSteps) =>
                updateStep(
                    currentSteps,
                    3,
                    "success",
                    `Apply blocked safely. Skipped records: ${skippedRecords}.`,
                ),
            );

            setMessage("Sync demo story completed: Edge exported, Cloud preview accepted, apply stayed safely blocked.");
        } catch (error) {
            setSteps((currentSteps) => {
                const runningIndex = currentSteps.findIndex((step) => step.status === "running");

                if (runningIndex < 0) {
                    return currentSteps;
                }

                return updateStep(
                    currentSteps,
                    runningIndex,
                    "error",
                    error instanceof Error ? error.message : "Sync demo failed.",
                );
            });
            setMessage(error instanceof Error ? error.message : "Sync demo failed.");
        } finally {
            setIsRunning(false);
        }
    }

    return (
        <section id="sync-story" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Sync demo story
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                        Edge export a Cloud preview sin riesgo operativo
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Este flujo demuestra la tesis de sincronizacion segura: Edge genera paquete,
                        Cloud lo valida y apply permanece bloqueado hasta que exista ingest productivo real.
                    </p>
                </div>

                <button
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={isRunning}
                    onClick={() => {
                        void runSyncStory();
                    }}
                    type="button"
                >
                    {isRunning ? "Running sync story..." : "Run sync demo story"}
                </button>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{message}</p>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-2">
                {steps.map((step, index) => (
                    <SyncStepCard index={index} key={step.title} step={step} />
                ))}
            </div>

            <div className="mt-5">
                <SyncPackageSummary syncPackage={syncPackage} />
            </div>
        </section>
    );
}