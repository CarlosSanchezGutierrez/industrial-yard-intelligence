import { useMemo, useState } from "react";

type GpsState = "idle" | "requesting" | "granted" | "denied" | "unsupported" | "error";

type GeoPoint = {
    readonly id: string;
    readonly label: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly accuracy: number;
    readonly capturedAt: string;
    readonly source: string;
    readonly status: string;
};

function formatCoordinate(value: number) {
    return value.toFixed(6);
}

function formatAccuracy(value: number) {
    return `${Math.round(value)} m`;
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function projectPoint(point: GeoPoint, currentPoint: GeoPoint | null, index: number) {
    if (!currentPoint) {
        return {
            left: `${18 + index * 9}%`,
            top: `${72 - index * 8}%`,
        };
    }

    const longitudeOffset = (point.longitude - currentPoint.longitude) * 100000;
    const latitudeOffset = (point.latitude - currentPoint.latitude) * 100000;

    return {
        left: `${clamp(50 + longitudeOffset, 8, 92)}%`,
        top: `${clamp(50 - latitudeOffset, 10, 88)}%`,
    };
}

function getErrorMessage(error: GeolocationPositionError) {
    if (error.code === error.PERMISSION_DENIED) {
        return "Permiso de ubicación denegado. Activa la ubicación del navegador para probar GPS.";
    }

    if (error.code === error.POSITION_UNAVAILABLE) {
        return "La ubicación no está disponible en este dispositivo o red.";
    }

    if (error.code === error.TIMEOUT) {
        return "La solicitud de ubicación tardó demasiado. Inténtalo otra vez al aire libre o con mejor señal.";
    }

    return error.message || "No se pudo obtener ubicación.";
}

export function RealGpsWorkspace() {
    const [gpsState, setGpsState] = useState<GpsState>("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [currentPoint, setCurrentPoint] = useState<GeoPoint | null>(null);
    const [savedPoints, setSavedPoints] = useState<readonly GeoPoint[]>([]);
    const [pointLabel, setPointLabel] = useState<string>("Punto de evidencia");

    const stateLabel = useMemo(() => {
        if (gpsState === "requesting") return "Solicitando ubicación";
        if (gpsState === "granted") return "Ubicación activa";
        if (gpsState === "denied") return "Permiso denegado";
        if (gpsState === "unsupported") return "GPS no soportado";
        if (gpsState === "error") return "Error de ubicación";

        return "Sin ubicación";
    }, [gpsState]);

    function requestLocation() {
        setErrorMessage("");

        if (!("geolocation" in window.navigator)) {
            setGpsState("unsupported");
            setErrorMessage("Este navegador no soporta geolocalización.");
            return;
        }

        setGpsState("requesting");

        window.navigator.geolocation.getCurrentPosition(
            (position) => {
                const capturedAt = new Date().toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                });

                const nextPoint: GeoPoint = {
                    id: `GPS-${Date.now()}`,
                    label: "Ubicación actual",
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    capturedAt,
                    source: "GPS del dispositivo",
                    status: "Actual",
                };

                setCurrentPoint(nextPoint);
                setGpsState("granted");
            },
            (error) => {
                setGpsState(error.code === error.PERMISSION_DENIED ? "denied" : "error");
                setErrorMessage(getErrorMessage(error));
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 15000,
            },
        );
    }

    function saveCurrentPoint() {
        if (!currentPoint) {
            return;
        }

        const label = pointLabel.trim() || "Punto de campo";

        const pointToSave: GeoPoint = {
            ...currentPoint,
            id: `GPS-${Date.now()}`,
            label,
            capturedAt: new Date().toLocaleString("es-MX", {
                dateStyle: "medium",
                timeStyle: "short",
            }),
            status: "Guardado",
        };

        setSavedPoints((current) => [pointToSave, ...current]);
        setPointLabel("Punto de evidencia");
    }

    return (
        <section className="nmk-gps-workspace">
            <div className="nmk-gps-header">
                <div>
                    <p>GPS real</p>
                    <h2>Ubicación del dispositivo</h2>
                    <span>
                        Pide permiso de ubicación, muestra coordenadas reales y guarda puntos de campo para material, evidencia o zona.
                    </span>
                </div>

                <div className={`nmk-gps-status nmk-gps-status-${gpsState}`}>
                    <strong>{stateLabel}</strong>
                    <span>Funciona en localhost o HTTPS</span>
                </div>
            </div>

            <div className="nmk-gps-grid">
                <div className="nmk-gps-control-panel">
                    <div className="nmk-gps-actions">
                        <button onClick={requestLocation} type="button">
                            Pedir ubicación
                        </button>
                        <button disabled={!currentPoint} onClick={saveCurrentPoint} type="button">
                            Guardar punto
                        </button>
                    </div>

                    <label className="nmk-field">
                        <span>Etiqueta del punto</span>
                        <input
                            onChange={(event) => setPointLabel(event.target.value)}
                            placeholder="Ejemplo: esquina Patio A, evidencia clinker..."
                            type="text"
                            value={pointLabel}
                        />
                    </label>

                    {errorMessage ? (
                        <div className="nmk-gps-error">
                            {errorMessage}
                        </div>
                    ) : null}

                    <div className="nmk-gps-data-grid">
                        <article>
                            <span>Latitud</span>
                            <strong>{currentPoint ? formatCoordinate(currentPoint.latitude) : "—"}</strong>
                        </article>
                        <article>
                            <span>Longitud</span>
                            <strong>{currentPoint ? formatCoordinate(currentPoint.longitude) : "—"}</strong>
                        </article>
                        <article>
                            <span>Precisión</span>
                            <strong>{currentPoint ? formatAccuracy(currentPoint.accuracy) : "—"}</strong>
                        </article>
                        <article>
                            <span>Guardados</span>
                            <strong>{savedPoints.length}</strong>
                        </article>
                    </div>
                </div>

                <div className="nmk-gps-map">
                    <div className="nmk-gps-map-grid" />

                    {savedPoints.slice(0, 10).map((point, index) => (
                        <span
                            className="nmk-gps-saved-marker"
                            key={point.id}
                            style={projectPoint(point, currentPoint, index)}
                            title={point.label}
                        >
                            {index + 1}
                        </span>
                    ))}

                    <span className={currentPoint ? "nmk-gps-live-marker is-active" : "nmk-gps-live-marker"}>
                        {currentPoint ? "Actual" : "Sin GPS"}
                    </span>

                    <div className="nmk-gps-perimeter-preview">
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className="nmk-gps-map-label">
                        <strong>Vista de captura</strong>
                        <span>Marcador actual + puntos guardados + preparación para perímetro</span>
                    </div>
                </div>
            </div>

            <div className="nmk-gps-bottom-grid">
                <div className="nmk-gps-saved-list">
                    <div className="nmk-gps-section-title">
                        <p>Puntos guardados</p>
                        <h3>Registro de campo</h3>
                    </div>

                    {savedPoints.length > 0 ? (
                        savedPoints.map((point) => (
                            <article key={point.id}>
                                <div>
                                    <strong>{point.label}</strong>
                                    <span>{point.source} · {point.status}</span>
                                </div>
                                <p>
                                    {formatCoordinate(point.latitude)}, {formatCoordinate(point.longitude)} · precisión {formatAccuracy(point.accuracy)}
                                </p>
                                <footer>{point.capturedAt}</footer>
                            </article>
                        ))
                    ) : (
                        <article>
                            <div>
                                <strong>Sin puntos guardados</strong>
                                <span>Primero pide ubicación y después guarda un punto.</span>
                            </div>
                            <p>El siguiente paso será asociar estos puntos a materiales, evidencias y perímetros.</p>
                        </article>
                    )}
                </div>

                <div className="nmk-gps-next-actions">
                    <div className="nmk-gps-section-title">
                        <p>Siguiente nivel</p>
                        <h3>Perímetros y zonas</h3>
                    </div>

                    <div className="nmk-gps-next-list">
                        <article>
                            <strong>1. Guardar punto</strong>
                            <span>Ubicación exacta de material, equipo o evidencia.</span>
                        </article>
                        <article>
                            <strong>2. Dibujar perímetro</strong>
                            <span>Delimitar pila, patio completo o zona restringida.</span>
                        </article>
                        <article>
                            <strong>3. Asociar evidencia</strong>
                            <span>Fotos, notas, drones RTK o medición topográfica.</span>
                        </article>
                    </div>
                </div>
            </div>
        </section>
    );
}