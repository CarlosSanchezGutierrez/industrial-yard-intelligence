import { useEffect, useMemo, useState } from "react";

type StockpileStatus = "draft" | "operational" | "pending_review" | "validated" | "archived" | string;

interface StockpileSummary {
    readonly id: string;
    readonly name: string;
    readonly materialName: string;
    readonly status: StockpileStatus;
    readonly zoneName: string;
    readonly estimatedQuantity: string;
}

interface StockpileMetrics {
    readonly total: number;
    readonly operational: number;
    readonly pendingReview: number;
    readonly validated: number;
    readonly archived: number;
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

function getNestedString(record: Record<string, unknown>, keys: readonly string[], fallback: string): string {
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

function normalizeStockpile(rawStockpile: unknown, index: number): StockpileSummary | null {
    if (!isRecord(rawStockpile)) {
        return null;
    }

    const id = getNestedString(rawStockpile, ["id", "stockpileId"], `stockpile_${index + 1}`);
    const name = getNestedString(rawStockpile, ["name", "displayName", "label"], `Stockpile ${index + 1}`);
    const materialName = getNestedString(
        rawStockpile,
        ["materialName", "material", "productName", "commodity"],
        "Material a granel",
    );
    const status = getNestedString(rawStockpile, ["status", "lifecycleStatus"], "draft");
    const zoneName = getNestedString(rawStockpile, ["zoneName", "yardZoneName", "yardZoneId", "zoneId"], "Patio demo");
    const quantity = getNestedString(
        rawStockpile,
        ["estimatedQuantity", "quantity", "volume", "tonnage", "amount"],
        "Pendiente",
    );
    const unit = getNestedString(rawStockpile, ["unit", "quantityUnit", "uom"], "");

    return {
        id,
        name,
        materialName,
        status,
        zoneName,
        estimatedQuantity: unit.length > 0 && quantity !== "Pendiente" ? `${quantity} ${unit}` : quantity,
    };
}

function extractStockpiles(payload: unknown): readonly StockpileSummary[] {
    const data = unwrapData(payload);

    if (Array.isArray(data)) {
        return data
            .map((item, index) => normalizeStockpile(item, index))
            .filter((item): item is StockpileSummary => item !== null);
    }

    if (isRecord(data)) {
        const candidateArrays = [
            data["stockpiles"],
            data["items"],
            data["records"],
            data["results"],
        ];

        for (const candidateArray of candidateArrays) {
            if (Array.isArray(candidateArray)) {
                return candidateArray
                    .map((item, index) => normalizeStockpile(item, index))
                    .filter((item): item is StockpileSummary => item !== null);
            }
        }
    }

    return [];
}

function buildMetrics(stockpiles: readonly StockpileSummary[]): StockpileMetrics {
    return {
        total: stockpiles.length,
        operational: stockpiles.filter((stockpile) => stockpile.status === "operational").length,
        pendingReview: stockpiles.filter((stockpile) => stockpile.status === "pending_review").length,
        validated: stockpiles.filter((stockpile) => stockpile.status === "validated").length,
        archived: stockpiles.filter((stockpile) => stockpile.status === "archived").length,
    };
}

function getStatusLabel(status: StockpileStatus): string {
    if (status === "draft") {
        return "Draft";
    }

    if (status === "operational") {
        return "Operational";
    }

    if (status === "pending_review") {
        return "Pending review";
    }

    if (status === "validated") {
        return "Validated";
    }

    if (status === "archived") {
        return "Archived";
    }

    return getString(status, "Unknown");
}

function getStatusClasses(status: StockpileStatus): string {
    if (status === "operational") {
        return "border-blue-200 bg-blue-50 text-blue-800";
    }

    if (status === "pending_review") {
        return "border-amber-200 bg-amber-50 text-amber-800";
    }

    if (status === "validated") {
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
    }

    if (status === "archived") {
        return "border-slate-200 bg-slate-100 text-slate-700";
    }

    return "border-violet-200 bg-violet-50 text-violet-800";
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

function StockpileCard({
    stockpile,
}: {
    readonly stockpile: StockpileSummary;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold text-slate-950">{stockpile.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{stockpile.materialName}</p>
                </div>

                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(stockpile.status)}`}>
                    {getStatusLabel(stockpile.status)}
                </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Yard zone
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{stockpile.zoneName}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Quantity
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{stockpile.estimatedQuantity}</p>
                </div>
            </div>

            <p className="mt-3 break-all text-xs text-slate-400">{stockpile.id}</p>
        </div>
    );
}

export function StockpileDemoSummaryPanel() {
    const [status, setStatus] = useState<LoadStatus>("idle");
    const [stockpiles, setStockpiles] = useState<readonly StockpileSummary[]>([]);
    const [message, setMessage] = useState("Load Cloud API stockpiles to show the current yard inventory.");
    const [updatedAt, setUpdatedAt] = useState("Not loaded yet");

    const metrics = useMemo(() => buildMetrics(stockpiles), [stockpiles]);

    async function loadStockpiles() {
        try {
            setStatus("loading");
            setMessage("Loading stockpiles from Cloud API...");

            const response = await fetch(`${getApiBaseUrl()}/stockpiles`, {
                headers: {
                    accept: "application/json",
                    "x-request-id": "web-stockpile-demo-summary",
                },
            });

            if (!response.ok) {
                throw new Error(`Cloud API stockpiles failed with HTTP ${response.status}.`);
            }

            const body = (await response.json()) as unknown;
            const nextStockpiles = extractStockpiles(body);

            setStockpiles(nextStockpiles);
            setStatus("ready");
            setUpdatedAt(new Date().toLocaleTimeString());
            setMessage(
                nextStockpiles.length > 0
                    ? "Stockpile inventory ready for demo."
                    : "No stockpiles returned. Use the create panel or reset demo data.",
            );
        } catch (error) {
            setStatus("error");
            setMessage(error instanceof Error ? error.message : "Could not load stockpiles.");
        }
    }

    useEffect(() => {
        void loadStockpiles();
    }, []);

    return (
        <section data-iyi-section="operations" id="stockpile-summary" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Stockpile demo summary
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                        Inventario operacional visible
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Muestra los stockpiles actuales como activos operacionales: material, zona, cantidad y
                        lifecycle para explicar rapidamente que esta pasando en patio.
                    </p>
                </div>

                <button
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={status === "loading"}
                    onClick={() => {
                        void loadStockpiles();
                    }}
                    type="button"
                >
                    {status === "loading" ? "Loading..." : "Refresh stockpiles"}
                </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-5">
                <MetricCard label="Total" value={metrics.total} />
                <MetricCard label="Operational" value={metrics.operational} />
                <MetricCard label="Review" value={metrics.pendingReview} />
                <MetricCard label="Validated" value={metrics.validated} />
                <MetricCard label="Archived" value={metrics.archived} />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-slate-950">{message}</p>
                    <p className="text-sm text-slate-500">Last load: {updatedAt}</p>
                </div>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-2">
                {stockpiles.slice(0, 6).map((stockpile) => (
                    <StockpileCard key={stockpile.id} stockpile={stockpile} />
                ))}
            </div>

            {stockpiles.length > 6 ? (
                <p className="mt-4 text-sm text-slate-500">
                    Showing 6 of {stockpiles.length} stockpiles for demo readability.
                </p>
            ) : null}
        </section>
    );
}