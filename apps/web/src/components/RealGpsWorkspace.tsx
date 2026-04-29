import { useEffect, useMemo, useRef, useState } from "react";

type GpsState = "idle" | "requesting" | "tracking" | "granted" | "denied" | "unsupported" | "error";

type ReverseAddress = {
    readonly house_number?: string;
    readonly road?: string;
    readonly neighbourhood?: string;
    readonly suburb?: string;
    readonly quarter?: string;
    readonly city_district?: string;
    readonly city?: string;
    readonly town?: string;
    readonly village?: string;
    readonly municipality?: string;
    readonly county?: string;
    readonly state?: string;
    readonly country?: string;
    readonly postcode?: string;
};

type ReverseGeocodeResult = {
    readonly display_name?: string;
    readonly address?: ReverseAddress;
};

type AddressSummary = {
    readonly full: string;
    readonly country: string;
    readonly state: string;
    readonly city: string;
    readonly neighborhood: string;
    readonly street: string;
    readonly postalCode: string;
    readonly source: string;
};

type GeoPoint = {
    readonly id: string;
    readonly label: string;
    readonly material: string;
    readonly evidenceType: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly accuracy: number;
    readonly capturedAt: string;
    readonly source: string;
    readonly status: string;
    readonly address: AddressSummary;
    readonly fieldReference: string;
};

type ProjectedPoint = {
    readonly left: number;
    readonly top: number;
};

const savedPointsStorageKey = "namiki:gps:saved-points:v1";
const perimeterStorageKey = "namiki:gps:perimeter:v1";

const materialOptions = [
    "Pet coke",
    "Clinker",
    "Chatarra HMS",
    "Fluorita MT",
    "Mineral mixto",
    "Patio completo",
    "Zona de evidencia",
] as const;

const evidenceTypeOptions = [
    "Punto de material",
    "Evidencia fotográfica",
    "Medición",
    "Vuelo RTK",
    "Perímetro",
    "Observación",
] as const;

function formatCoordinate(value: number) {
    return value.toFixed(6);
}

function formatAccuracy(value: number) {
    return `${Math.round(value)} m`;
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function nowLabel() {
    return new Date().toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function emptyAddressSummary(source = "Pendiente"): AddressSummary {
    return {
        full: "Dirección pendiente de resolver",
        country: "—",
        state: "—",
        city: "—",
        neighborhood: "—",
        street: "—",
        postalCode: "—",
        source,
    };
}

function buildAddressSummary(result: ReverseGeocodeResult | null): AddressSummary {
    if (!result?.address) {
        return emptyAddressSummary("No disponible");
    }

    const address = result.address;
    const street = [address.road, address.house_number].filter(Boolean).join(" ");
    const city = address.city ?? address.town ?? address.village ?? address.municipality ?? address.county ?? "—";
    const neighborhood = address.neighbourhood ?? address.suburb ?? address.quarter ?? address.city_district ?? "—";
    const state = address.state ?? "—";
    const country = address.country ?? "—";
    const postalCode = address.postcode ?? "—";

    const full =
        result.display_name ??
        [street, neighborhood, city, state, country, postalCode]
            .filter((value) => value && value !== "—")
            .join(", ") ||
        "Dirección interpretada sin detalle suficiente";

    return {
        full,
        country,
        state,
        city,
        neighborhood,
        street: street || "—",
        postalCode,
        source: "Geocodificación inversa",
    };
}

async function reverseGeocode(latitude: number, longitude: number): Promise<AddressSummary> {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "18");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));

    try {
        const response = await fetch(url.toString(), {
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            return emptyAddressSummary("No se pudo resolver dirección");
        }

        const result = (await response.json()) as ReverseGeocodeResult;
        return buildAddressSummary(result);
    } catch {
        return emptyAddressSummary("Sin conexión a geocodificación");
    }
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

function safeParsePoints(value: string | null): readonly GeoPoint[] {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value) as unknown;

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((item): item is GeoPoint => {
            if (!item || typeof item !== "object") {
                return false;
            }

            const candidate = item as Partial<GeoPoint>;

            return (
                typeof candidate.id === "string" &&
                typeof candidate.label === "string" &&
                typeof candidate.latitude === "number" &&
                typeof candidate.longitude === "number" &&
                typeof candidate.accuracy === "number"
            );
        });
    } catch {
        return [];
    }
}

function projectPoint(point: GeoPoint, currentPoint: GeoPoint | null, index: number): ProjectedPoint {
    if (!currentPoint) {
        return {
            left: clamp(20 + index * 8, 8, 92),
            top: clamp(72 - index * 7, 10, 88),
        };
    }

    const longitudeOffset = (point.longitude - currentPoint.longitude) * 100000;
    const latitudeOffset = (point.latitude - currentPoint.latitude) * 100000;

    return {
        left: clamp(50 + longitudeOffset, 8, 92),
        top: clamp(50 - latitudeOffset, 10, 88),
    };
}

function polygonPoints(points: readonly GeoPoint[], currentPoint: GeoPoint | null) {
    return points
        .map((point, index) => {
            const projected = projectPoint(point, currentPoint, index);
            return `${projected.left},${projected.top}`;
        })
        .join(" ");
}

function buildGeoJsonFeature(point: GeoPoint) {
    return {
        type: "Feature",
        properties: {
            id: point.id,
            label: point.label,
            material: point.material,
            evidenceType: point.evidenceType,
            accuracy: point.accuracy,
            capturedAt: point.capturedAt,
            address: point.address.full,
            fieldReference: point.fieldReference,
        },
        geometry: {
            type: "Point",
            coordinates: [point.longitude, point.latitude],
        },
    };
}

export function RealGpsWorkspace() {
    const watchIdRef = useRef<number | null>(null);

    const [gpsState, setGpsState] = useState<GpsState>("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [currentPoint, setCurrentPoint] = useState<GeoPoint | null>(null);
    const [savedPoints, setSavedPoints] = useState<readonly GeoPoint[]>([]);
    const [perimeterPoints, setPerimeterPoints] = useState<readonly GeoPoint[]>([]);
    const [pointLabel, setPointLabel] = useState<string>("Punto de evidencia");
    const [targetMaterial, setTargetMaterial] = useState<string>("Pet coke");
    const [evidenceType, setEvidenceType] = useState<string>("Punto de material");
    const [fieldReference, setFieldReference] = useState<string>("Entre calles / acceso / referencia visual pendiente");
    const [reverseStatus, setReverseStatus] = useState("Sin dirección");

    const stateLabel = useMemo(() => {
        if (gpsState === "requesting") return "Solicitando ubicación";
        if (gpsState === "tracking") return "Rastreo activo";
        if (gpsState === "granted") return "Ubicación activa";
        if (gpsState === "denied") return "Permiso denegado";
        if (gpsState === "unsupported") return "GPS no soportado";
        if (gpsState === "error") return "Error de ubicación";

        return "Sin ubicación";
    }, [gpsState]);

    const geoJsonPreview = useMemo(() => {
        if (!currentPoint) {
            return "Sin punto actual";
        }

        return JSON.stringify(buildGeoJsonFeature(currentPoint), null, 2);
    }, [currentPoint]);

    const perimeterPreview = useMemo(() => polygonPoints(perimeterPoints, currentPoint), [perimeterPoints, currentPoint]);

    useEffect(() => {
        setSavedPoints(safeParsePoints(window.localStorage.getItem(savedPointsStorageKey)));
        setPerimeterPoints(safeParsePoints(window.localStorage.getItem(perimeterStorageKey)));
    }, []);

    useEffect(() => {
        window.localStorage.setItem(savedPointsStorageKey, JSON.stringify(savedPoints));
    }, [savedPoints]);

    useEffect(() => {
        window.localStorage.setItem(perimeterStorageKey, JSON.stringify(perimeterPoints));
    }, [perimeterPoints]);

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null && "geolocation" in window.navigator) {
                window.navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    async function buildPointFromPosition(position: GeolocationPosition, label: string, status: string): Promise<GeoPoint> {
        setReverseStatus("Resolviendo dirección...");

        const address = await reverseGeocode(position.coords.latitude, position.coords.longitude);

        setReverseStatus(address.source);

        return {
            id: `GPS-${Date.now()}`,
            label,
            material: targetMaterial,
            evidenceType,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            capturedAt: nowLabel(),
            source: "GPS del dispositivo",
            status,
            address,
            fieldReference: fieldReference.trim() || "Referencia de campo pendiente",
        };
    }

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
                void buildPointFromPosition(position, "Ubicación actual", "Actual").then((nextPoint) => {
                    setCurrentPoint(nextPoint);
                    setGpsState("granted");
                });
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

    function startTracking() {
        setErrorMessage("");

        if (!("geolocation" in window.navigator)) {
            setGpsState("unsupported");
            setErrorMessage("Este navegador no soporta geolocalización.");
            return;
        }

        if (watchIdRef.current !== null) {
            window.navigator.geolocation.clearWatch(watchIdRef.current);
        }

        setGpsState("tracking");

        watchIdRef.current = window.navigator.geolocation.watchPosition(
            (position) => {
                void buildPointFromPosition(position, "Ubicación en vivo", "En vivo").then((nextPoint) => {
                    setCurrentPoint(nextPoint);
                    setGpsState("tracking");
                });
            },
            (error) => {
                setGpsState(error.code === error.PERMISSION_DENIED ? "denied" : "error");
                setErrorMessage(getErrorMessage(error));
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 20000,
            },
        );
    }

    function stopTracking() {
        if (watchIdRef.current !== null && "geolocation" in window.navigator) {
            window.navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        setGpsState(currentPoint ? "granted" : "idle");
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
            material: targetMaterial,
            evidenceType,
            capturedAt: nowLabel(),
            status: "Guardado",
            fieldReference: fieldReference.trim() || "Referencia de campo pendiente",
        };

        setSavedPoints((current) => [pointToSave, ...current]);
        setPointLabel("Punto de evidencia");
    }

    function addCurrentPointToPerimeter() {
        if (!currentPoint) {
            return;
        }

        const perimeterPoint: GeoPoint = {
            ...currentPoint,
            id: `PER-${Date.now()}`,
            label: `Vértice ${perimeterPoints.length + 1}`,
            material: targetMaterial,
            evidenceType: "Perímetro",
            capturedAt: nowLabel(),
            status: "Vértice",
            fieldReference: fieldReference.trim() || "Vértice de perímetro",
        };

        setPerimeterPoints((current) => [...current, perimeterPoint]);
    }

    function clearPerimeter() {
        setPerimeterPoints([]);
    }

    function clearSavedPoints() {
        setSavedPoints([]);
    }

    return (
        <section className="nmk-gps-workspace nmk-gps-premium">
            <div className="nmk-gps-header">
                <div>
                    <p>GPS real</p>
                    <h2>Ubicación completa del dispositivo</h2>
                    <span>
                        Pide ubicación real, interpreta dirección, guarda puntos, asocia material/evidencia y prepara perímetros visuales.
                    </span>
                </div>

                <div className={`nmk-gps-status nmk-gps-status-${gpsState}`}>
                    <strong>{stateLabel}</strong>
                    <span>{reverseStatus}</span>
                </div>
            </div>

            <div className="nmk-gps-premium-grid">
                <section className="nmk-gps-control-panel">
                    <div className="nmk-gps-actions nmk-gps-actions-premium">
                        <button onClick={requestLocation} type="button">Pedir ubicación</button>
                        <button onClick={startTracking} type="button">Rastrear en vivo</button>
                        <button onClick={stopTracking} type="button">Detener rastreo</button>
                        <button disabled={!currentPoint} onClick={saveCurrentPoint} type="button">Guardar punto</button>
                    </div>

                    <div className="nmk-gps-form-grid">
                        <label className="nmk-field">
                            <span>Etiqueta</span>
                            <input
                                onChange={(event) => setPointLabel(event.target.value)}
                                placeholder="Ejemplo: esquina Patio A"
                                type="text"
                                value={pointLabel}
                            />
                        </label>

                        <label className="nmk-field">
                            <span>Material / zona</span>
                            <select onChange={(event) => setTargetMaterial(event.target.value)} value={targetMaterial}>
                                {materialOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>

                        <label className="nmk-field">
                            <span>Tipo</span>
                            <select onChange={(event) => setEvidenceType(event.target.value)} value={evidenceType}>
                                {evidenceTypeOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>

                        <label className="nmk-field nmk-field-wide">
                            <span>Entre calles / acceso / referencia de campo</span>
                            <input
                                onChange={(event) => setFieldReference(event.target.value)}
                                placeholder="Ejemplo: entre acceso norte y báscula 2, junto a bodega"
                                type="text"
                                value={fieldReference}
                            />
                        </label>
                    </div>

                    {errorMessage ? <div className="nmk-gps-error">{errorMessage}</div> : null}

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
                </section>

                <section className="nmk-gps-address-card">
                    <div className="nmk-gps-section-title">
                        <p>Ubicación interpretada</p>
                        <h3>Dirección aproximada</h3>
                    </div>

                    <div className="nmk-address-main">
                        <strong>{currentPoint?.address.full ?? "Pide ubicación para resolver dirección"}</strong>
                        <span>{currentPoint?.fieldReference ?? "Agrega referencia manual de acceso, entre calles o punto visual."}</span>
                    </div>

                    <div className="nmk-address-grid">
                        <article>
                            <span>País</span>
                            <strong>{currentPoint?.address.country ?? "—"}</strong>
                        </article>
                        <article>
                            <span>Estado</span>
                            <strong>{currentPoint?.address.state ?? "—"}</strong>
                        </article>
                        <article>
                            <span>Ciudad</span>
                            <strong>{currentPoint?.address.city ?? "—"}</strong>
                        </article>
                        <article>
                            <span>Colonia / zona</span>
                            <strong>{currentPoint?.address.neighborhood ?? "—"}</strong>
                        </article>
                        <article>
                            <span>Calle</span>
                            <strong>{currentPoint?.address.street ?? "—"}</strong>
                        </article>
                        <article>
                            <span>Código postal</span>
                            <strong>{currentPoint?.address.postalCode ?? "—"}</strong>
                        </article>
                    </div>
                </section>
            </div>

            <section className="nmk-gps-visual-panel">
                <div className="nmk-gps-map nmk-gps-premium-map">
                    <div className="nmk-gps-map-grid" />

                    <svg className="nmk-gps-svg" preserveAspectRatio="none" viewBox="0 0 100 100">
                        {perimeterPoints.length >= 3 ? (
                            <polygon className="nmk-gps-polygon-fill" points={perimeterPreview} />
                        ) : null}
                        {perimeterPoints.length >= 2 ? (
                            <polyline className="nmk-gps-polygon-line" points={perimeterPreview} />
                        ) : null}
                    </svg>

                    {savedPoints.slice(0, 16).map((point, index) => {
                        const projected = projectPoint(point, currentPoint, index);

                        return (
                            <span
                                className="nmk-gps-saved-marker"
                                key={point.id}
                                style={{ left: `${projected.left}%`, top: `${projected.top}%` }}
                                title={`${point.label} · ${point.address.full}`}
                            >
                                {index + 1}
                            </span>
                        );
                    })}

                    {perimeterPoints.map((point, index) => {
                        const projected = projectPoint(point, currentPoint, index);

                        return (
                            <span
                                className="nmk-gps-perimeter-marker"
                                key={point.id}
                                style={{ left: `${projected.left}%`, top: `${projected.top}%` }}
                                title={point.label}
                            >
                                {index + 1}
                            </span>
                        );
                    })}

                    <span className={currentPoint ? "nmk-gps-live-marker is-active" : "nmk-gps-live-marker"}>
                        {currentPoint ? "Actual" : "Sin GPS"}
                    </span>

                    <div className="nmk-gps-map-label">
                        <strong>Mapa visual de captura</strong>
                        <span>Marcador actual, puntos guardados, vértices y perímetro demo.</span>
                    </div>
                </div>

                <aside className="nmk-gps-map-tools">
                    <div className="nmk-gps-section-title">
                        <p>Perímetro</p>
                        <h3>Delimitación visual</h3>
                    </div>

                    <div className="nmk-gps-tool-actions">
                        <button disabled={!currentPoint} onClick={addCurrentPointToPerimeter} type="button">
                            Agregar vértice actual
                        </button>
                        <button disabled={perimeterPoints.length === 0} onClick={clearPerimeter} type="button">
                            Limpiar perímetro
                        </button>
                        <button disabled={savedPoints.length === 0} onClick={clearSavedPoints} type="button">
                            Limpiar puntos
                        </button>
                    </div>

                    <div className="nmk-gps-map-stats">
                        <article>
                            <strong>{perimeterPoints.length}</strong>
                            <span>Vértices</span>
                        </article>
                        <article>
                            <strong>{perimeterPoints.length >= 3 ? "Listo" : "Pendiente"}</strong>
                            <span>Polígono</span>
                        </article>
                        <article>
                            <strong>{targetMaterial}</strong>
                            <span>Asociación</span>
                        </article>
                    </div>
                </aside>
            </section>

            <div className="nmk-gps-bottom-grid">
                <div className="nmk-gps-saved-list">
                    <div className="nmk-gps-section-title">
                        <p>Puntos guardados</p>
                        <h3>Registro de campo persistente</h3>
                    </div>

                    {savedPoints.length > 0 ? (
                        savedPoints.map((point) => (
                            <article key={point.id}>
                                <div>
                                    <strong>{point.label}</strong>
                                    <span>{point.material} · {point.evidenceType}</span>
                                </div>
                                <p>{point.address.full}</p>
                                <p>{formatCoordinate(point.latitude)}, {formatCoordinate(point.longitude)} · precisión {formatAccuracy(point.accuracy)}</p>
                                <footer>{point.fieldReference} · {point.capturedAt}</footer>
                            </article>
                        ))
                    ) : (
                        <article>
                            <div>
                                <strong>Sin puntos guardados</strong>
                                <span>Primero pide ubicación y después guarda un punto.</span>
                            </div>
                            <p>El punto queda persistido en el navegador para que la demo se sienta registrada.</p>
                        </article>
                    )}
                </div>

                <div className="nmk-gps-next-actions">
                    <div className="nmk-gps-section-title">
                        <p>Objeto técnico preparado</p>
                        <h3>GeoJSON del punto actual</h3>
                    </div>

                    <pre className="nmk-gps-json">{geoJsonPreview}</pre>
                </div>
            </div>
        </section>
    );
}