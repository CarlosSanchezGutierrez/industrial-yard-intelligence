import { useMemo, useState } from "react";

type JsonRecord = Record<string, unknown>;

type BackendSyncStatus = "Sin conectar" | "Consultando" | "Guardando" | "Guardado" | "Error";

type BackendGpsCaptureSummary = {
    readonly id: string;
    readonly packageId: string;
    readonly status: string;
    readonly qualityScore: number;
    readonly pointCount: number;
    readonly vertexCount: number;
    readonly auditCount: number;
    readonly createdAt: string;
    readonly updatedAt: string;
};

type BackendListResponse = {
    readonly items?: readonly unknown[];
};

type BackendCreateResponse = {
    readonly item?: unknown;
};

type LocalGpsSnapshot = {
    readonly savedPoints: readonly JsonRecord[];
    readonly perimeterPoints: readonly JsonRecord[];
    readonly auditEntries: readonly JsonRecord[];
    readonly captureStatus: string;
    readonly qualityScore: number;
};

const savedPointKeys = [
    "namiki:gps:saved-points:v3",
    "namiki:gps:saved-points:v2",
    "namiki:gps:saved-points:v1",
] as const;

const perimeterKeys = [
    "namiki:gps:perimeter:v3",
    "namiki:gps:perimeter:v2",
    "namiki:gps:perimeter:v1",
] as const;

const auditKeys = [
    "namiki:gps:audit:v1",
] as const;

function isRecord(value: unknown): value is JsonRecord {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, fallback: string) {
    return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function readNumber(value: unknown, fallback: number) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readStoredArray(keys: readonly string[]): readonly JsonRecord[] {
    for (const key of keys) {
        const raw = window.localStorage.getItem(key);

        if (!raw) {
            continue;
        }

        try {
            const parsed = JSON.parse(raw) as unknown;

            if (Array.isArray(parsed)) {
                return parsed.filter((item): item is JsonRecord => isRecord(item));
            }
        } catch {
            continue;
        }
    }

    return [];
}

function getApiBaseUrl() {
    const value = String(import.meta.env.VITE_IYI_API_BASE_URL || "http://localhost:8788");
    return value.replace(/\/$/u, "");
}

function createPackageId() {
    return "NAMIKI-GPS-" + new Date().toISOString();
}

function coordinatesFromPoint(point: JsonRecord): [number, number] | null {
    const latitude = readNumber(point.latitude, Number.NaN);
    const longitude = readNumber(point.longitude, Number.NaN);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
    }

    return [longitude, latitude];
}

function buildGeoJson(savedPoints: readonly JsonRecord[], perimeterPoints: readonly JsonRecord[]) {
    const pointFeatures = savedPoints
        .map((point) => {
            const coordinates = coordinatesFromPoint(point);

            if (!coordinates) {
                return null;
            }

            return {
                type: "Feature",
                properties: {
                    label: readString(point.label, "Punto GPS"),
                    material: readString(point.material, "Sin material"),
                    evidenceType: readString(point.evidenceType, "Punto"),
                    status: readString(point.status, "Guardado"),
                    capturedAt: readString(point.capturedAt, "Sin fecha"),
                },
                geometry: {
                    type: "Point",
                    coordinates,
                },
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    const perimeterCoordinates = perimeterPoints
        .map((point) => coordinatesFromPoint(point))
        .filter((item): item is [number, number] => item !== null);

    const firstCoordinate = perimeterCoordinates[0];

    const polygonFeatures =
        perimeterCoordinates.length >= 3 && firstCoordinate
            ? [
                  {
                      type: "Feature",
                      properties: {
                          label: "Perímetro GPS",
                          vertices: perimeterCoordinates.length,
                      },
                      geometry: {
                          type: "Polygon",
                          coordinates: [[...perimeterCoordinates, firstCoordinate]],
                      },
                  },
              ]
            : [];

    return {
        type: "FeatureCollection",
        features: [...pointFeatures, ...polygonFeatures],
    };
}

function calculateQuality(savedPoints: readonly JsonRecord[], perimeterPoints: readonly JsonRecord[], auditEntries: readonly JsonRecord[], captureStatus: string) {
    let score = 0;

    if (savedPoints.length > 0) score += 28;
    if (perimeterPoints.length >= 3) score += 28;
    if (auditEntries.length > 0) score += 18;
    if (captureStatus === "Listo para enviar") score += 12;
    if (captureStatus === "Sincronizado") score += 18;

    return Math.min(score, 100);
}

function buildLocalSnapshot(): LocalGpsSnapshot {
    const savedPoints = readStoredArray(savedPointKeys);
    const perimeterPoints = readStoredArray(perimeterKeys);
    const auditEntries = readStoredArray(auditKeys);
    const captureStatus = window.localStorage.getItem("namiki:gps:capture-status:v1") || "Borrador";

    return {
        savedPoints,
        perimeterPoints,
        auditEntries,
        captureStatus,
        qualityScore: calculateQuality(savedPoints, perimeterPoints, auditEntries, captureStatus),
    };
}

function buildBackendPackage(snapshot: LocalGpsSnapshot) {
    return {
        packageId: createPackageId(),
        status: snapshot.captureStatus,
        qualityScore: snapshot.qualityScore,
        savedPoints: snapshot.savedPoints,
        perimeterPoints: snapshot.perimeterPoints,
        auditEntries: snapshot.auditEntries,
        geoJson: buildGeoJson(snapshot.savedPoints, snapshot.perimeterPoints),
    };
}

function normalizeCapture(value: unknown): BackendGpsCaptureSummary | null {
    if (!isRecord(value)) {
        return null;
    }

    const id = readString(value.id, "");
    const packageId = readString(value.packageId, "");

    if (!id || !packageId) {
        return null;
    }

    return {
        id,
        packageId,
        status: readString(value.status, "Recibido"),
        qualityScore: readNumber(value.qualityScore, 0),
        pointCount: readNumber(value.pointCount, 0),
        vertexCount: readNumber(value.vertexCount, 0),
        auditCount: readNumber(value.auditCount, 0),
        createdAt: readString(value.createdAt, "Sin fecha"),
        updatedAt: readString(value.updatedAt, "Sin fecha"),
    };
}

function normalizeCaptureList(value: unknown): readonly BackendGpsCaptureSummary[] {
    if (!isRecord(value)) {
        return [];
    }

    const response = value as BackendListResponse;

    if (!Array.isArray(response.items)) {
        return [];
    }

    return response.items
        .map((item) => normalizeCapture(item))
        .filter((item): item is BackendGpsCaptureSummary => item !== null);
}

async function getBackendCaptures(): Promise<readonly BackendGpsCaptureSummary[]> {
    const response = await fetch(getApiBaseUrl() + "/gps/captures", {
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("GET /gps/captures falló con HTTP " + response.status);
    }

    return normalizeCaptureList(await response.json());
}

async function postBackendCapture(payload: unknown): Promise<BackendGpsCaptureSummary> {
    const response = await fetch(getApiBaseUrl() + "/gps/captures", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("POST /gps/captures falló con HTTP " + response.status);
    }

    const json = (await response.json()) as BackendCreateResponse;
    const item = normalizeCapture(json.item);

    if (!item) {
        throw new Error("El backend no regresó una captura GPS válida.");
    }

    return item;
}

async function getBackendExport() {
    const response = await fetch(getApiBaseUrl() + "/gps/captures/export", {
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("GET /gps/captures/export falló con HTTP " + response.status);
    }

    return response.json() as Promise<unknown>;
}

function statusClass(value: BackendSyncStatus) {
    return value.toLowerCase().replace(/\s+/gu, "-");
}

export function GpsBackendSyncPanel() {
    const [snapshot, setSnapshot] = useState<LocalGpsSnapshot>(() => buildLocalSnapshot());
    const [backendStatus, setBackendStatus] = useState<BackendSyncStatus>("Sin conectar");
    const [backendMessage, setBackendMessage] = useState("Listo para conectar con /gps/captures.");
    const [backendCaptures, setBackendCaptures] = useState<readonly BackendGpsCaptureSummary[]>([]);
    const [lastSaved, setLastSaved] = useState<BackendGpsCaptureSummary | null>(null);

    const packagePreview = useMemo(() => buildBackendPackage(snapshot), [snapshot]);

    function refreshLocal() {
        const nextSnapshot = buildLocalSnapshot();
        setSnapshot(nextSnapshot);
        setBackendMessage("Datos locales actualizados desde el navegador.");
    }

    async function syncToBackend() {
        const nextSnapshot = buildLocalSnapshot();
        const payload = buildBackendPackage(nextSnapshot);

        setSnapshot(nextSnapshot);
        setBackendStatus("Guardando");
        setBackendMessage("Enviando paquete GPS al backend...");

        try {
            const saved = await postBackendCapture(payload);

            setLastSaved(saved);
            setBackendCaptures((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
            setBackendStatus("Guardado");
            setBackendMessage("Paquete guardado en backend: " + saved.packageId);
            window.localStorage.setItem("namiki:gps:capture-status:v1", "Sincronizado");
            setSnapshot(buildLocalSnapshot());
        } catch (error) {
            setBackendStatus("Error");
            setBackendMessage(error instanceof Error ? error.message : "No se pudo guardar el paquete GPS.");
        }
    }

    async function refreshBackend() {
        setBackendStatus("Consultando");
        setBackendMessage("Consultando capturas GPS guardadas...");

        try {
            const captures = await getBackendCaptures();

            setBackendCaptures(captures);
            setBackendStatus("Guardado");
            setBackendMessage(String(captures.length) + " capturas disponibles en backend.");
        } catch (error) {
            setBackendStatus("Error");
            setBackendMessage(error instanceof Error ? error.message : "No se pudo consultar backend GPS.");
        }
    }

    async function copyBackendExport() {
        setBackendStatus("Consultando");
        setBackendMessage("Preparando exportación backend...");

        try {
            const exported = await getBackendExport();
            const payload = JSON.stringify(exported, null, 2);

            if (!window.navigator.clipboard) {
                setBackendStatus("Error");
                setBackendMessage("Clipboard no disponible. El export fue consultado, pero no copiado.");
                return;
            }

            await window.navigator.clipboard.writeText(payload);
            setBackendStatus("Guardado");
            setBackendMessage("Exportación backend copiada al portapapeles.");
        } catch (error) {
            setBackendStatus("Error");
            setBackendMessage(error instanceof Error ? error.message : "No se pudo copiar export backend.");
        }
    }

    async function copyLocalPackage() {
        const payload = JSON.stringify(packagePreview, null, 2);

        if (!window.navigator.clipboard) {
            setBackendStatus("Error");
            setBackendMessage("Clipboard no disponible. No se pudo copiar el paquete local.");
            return;
        }

        await window.navigator.clipboard.writeText(payload);
        setBackendMessage("Paquete local copiado al portapapeles.");
    }

    return (
        <section className="nmk-gps-backend-sync-panel">
            <div className="nmk-gps-section-title">
                <p>Persistencia real</p>
                <h3>Sincronización GPS con backend</h3>
            </div>

            <div className={"nmk-backend-status nmk-backend-status-" + statusClass(backendStatus)}>
                <strong>{backendStatus}</strong>
                <span>{backendMessage}</span>
            </div>

            <div className="nmk-backend-summary-grid">
                <article>
                    <span>API</span>
                    <strong>{getApiBaseUrl()}</strong>
                </article>
                <article>
                    <span>Estado local</span>
                    <strong>{snapshot.captureStatus}</strong>
                </article>
                <article>
                    <span>Último guardado</span>
                    <strong>{lastSaved?.packageId ?? "—"}</strong>
                </article>
                <article>
                    <span>Calidad</span>
                    <strong>{snapshot.qualityScore}%</strong>
                </article>
            </div>

            <div className="nmk-backend-action-row">
                <button onClick={refreshLocal} type="button">Actualizar local</button>
                <button onClick={() => void syncToBackend()} type="button">Enviar al backend</button>
                <button onClick={() => void refreshBackend()} type="button">Consultar backend</button>
                <button onClick={() => void copyBackendExport()} type="button">Copiar export backend</button>
                <button onClick={() => void copyLocalPackage()} type="button">Copiar paquete local</button>
            </div>

            <div className="nmk-backend-package-grid">
                <article>
                    <span>Puntos locales</span>
                    <strong>{snapshot.savedPoints.length}</strong>
                </article>
                <article>
                    <span>Vértices locales</span>
                    <strong>{snapshot.perimeterPoints.length}</strong>
                </article>
                <article>
                    <span>Auditoría local</span>
                    <strong>{snapshot.auditEntries.length}</strong>
                </article>
                <article>
                    <span>Capturas backend</span>
                    <strong>{backendCaptures.length}</strong>
                </article>
            </div>

            <div className="nmk-backend-capture-list">
                {backendCaptures.length > 0 ? (
                    backendCaptures.slice(0, 8).map((capture) => (
                        <article key={capture.id}>
                            <div>
                                <strong>{capture.packageId}</strong>
                                <span>{capture.status} · calidad {capture.qualityScore}%</span>
                            </div>
                            <p>{capture.pointCount} puntos · {capture.vertexCount} vértices · {capture.auditCount} eventos</p>
                            <footer>{capture.createdAt}</footer>
                        </article>
                    ))
                ) : (
                    <article>
                        <div>
                            <strong>Sin capturas consultadas</strong>
                            <span>Envía o consulta el backend.</span>
                        </div>
                        <p>Cuando el API esté activo, aquí aparecerán los paquetes guardados en /gps/captures.</p>
                    </article>
                )}
            </div>
        </section>
    );
}