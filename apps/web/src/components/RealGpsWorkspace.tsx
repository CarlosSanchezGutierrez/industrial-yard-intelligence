import { useEffect, useMemo, useRef, useState } from "react";
import L, { type LatLngExpression } from "leaflet";
import {
    Circle,
    MapContainer,
    Marker,
    Polygon,
    Polyline,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

type GpsState = "idle" | "requesting" | "tracking" | "granted" | "denied" | "unsupported" | "error";
type MapMode = "select-point" | "draw-perimeter";
type CaptureStatus = "Borrador" | "Listo para enviar" | "Sincronizado";
type AuditSeverity = "info" | "success" | "warning" | "danger";

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
    readonly address?: ReverseAddress | undefined;
};

type SearchResult = {
    readonly place_id: number;
    readonly display_name: string;
    readonly lat: string;
    readonly lon: string;
    readonly address?: ReverseAddress | undefined;
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

type GpsAuditEntry = {
    readonly id: string;
    readonly title: string;
    readonly detail: string;
    readonly createdAt: string;
    readonly material: string;
    readonly pointId: string;
    readonly severity: AuditSeverity;
};

const savedPointsStorageKey = "namiki:gps:saved-points:v3";
const perimeterStorageKey = "namiki:gps:perimeter:v3";
const auditStorageKey = "namiki:gps:audit:v1";
const captureStatusStorageKey = "namiki:gps:capture-status:v1";

const altamiraFallbackCenter: LatLngExpression = [22.4003, -97.9386];

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

const currentIcon = L.divIcon({
    className: "nmk-real-map-marker nmk-real-map-marker-current",
    html: "<span>Actual</span>",
    iconAnchor: [43, 18],
    iconSize: [86, 36],
});

const searchIcon = L.divIcon({
    className: "nmk-real-map-marker nmk-real-map-marker-search",
    html: "<span>Búsqueda</span>",
    iconAnchor: [48, 18],
    iconSize: [96, 36],
});

function createSavedIcon(index: number) {
    return L.divIcon({
        className: "nmk-real-map-marker nmk-real-map-marker-saved",
        html: `<span>${index}</span>`,
        iconAnchor: [16, 16],
        iconSize: [32, 32],
    });
}

function createPerimeterIcon(index: number) {
    return L.divIcon({
        className: "nmk-real-map-marker nmk-real-map-marker-vertex",
        html: `<span>${index}</span>`,
        iconAnchor: [15, 15],
        iconSize: [30, 30],
    });
}

function formatCoordinate(value: number) {
    return value.toFixed(6);
}

function formatAccuracy(value: number) {
    if (value <= 0) {
        return "Manual";
    }

    return `${Math.round(value)} m`;
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

    const fallbackFull = [street, neighborhood, city, state, country, postalCode]
        .filter((value) => value && value !== "—")
        .join(", ");

    const full =
        result.display_name ??
        (fallbackFull.length > 0 ? fallbackFull : "Dirección interpretada sin detalle suficiente");

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

async function searchPlaces(query: string): Promise<readonly SearchResult[]> {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 3) {
        return [];
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "5");
    url.searchParams.set("q", normalizedQuery);

    try {
        const response = await fetch(url.toString(), {
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            return [];
        }

        return (await response.json()) as readonly SearchResult[];
    } catch {
        return [];
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

function normalizePoint(item: unknown): GeoPoint | null {
    if (!item || typeof item !== "object") {
        return null;
    }

    const candidate = item as Partial<GeoPoint>;

    if (
        typeof candidate.id !== "string" ||
        typeof candidate.label !== "string" ||
        typeof candidate.latitude !== "number" ||
        typeof candidate.longitude !== "number" ||
        typeof candidate.accuracy !== "number"
    ) {
        return null;
    }

    return {
        id: candidate.id,
        label: candidate.label,
        material: typeof candidate.material === "string" ? candidate.material : "Sin material",
        evidenceType: typeof candidate.evidenceType === "string" ? candidate.evidenceType : "Punto",
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        accuracy: candidate.accuracy,
        capturedAt: typeof candidate.capturedAt === "string" ? candidate.capturedAt : "Sin fecha",
        source: typeof candidate.source === "string" ? candidate.source : "GPS",
        status: typeof candidate.status === "string" ? candidate.status : "Guardado",
        address: candidate.address ?? emptyAddressSummary("Sin dirección guardada"),
        fieldReference: typeof candidate.fieldReference === "string" ? candidate.fieldReference : "Sin referencia",
    };
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

        return parsed
            .map((item) => normalizePoint(item))
            .filter((item): item is GeoPoint => item !== null);
    } catch {
        return [];
    }
}

function safeParseAudit(value: string | null): readonly GpsAuditEntry[] {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value) as unknown;

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((item): item is GpsAuditEntry => {
            if (!item || typeof item !== "object") {
                return false;
            }

            const candidate = item as Partial<GpsAuditEntry>;

            return (
                typeof candidate.id === "string" &&
                typeof candidate.title === "string" &&
                typeof candidate.detail === "string" &&
                typeof candidate.createdAt === "string"
            );
        });
    } catch {
        return [];
    }
}

function safeParseCaptureStatus(value: string | null): CaptureStatus {
    if (value === "Listo para enviar" || value === "Sincronizado") {
        return value;
    }

    return "Borrador";
}

function buildGeoJson(points: readonly GeoPoint[], perimeterPoints: readonly GeoPoint[], currentPoint: GeoPoint | null) {
    const pointFeatures = points.map((point) => ({
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
            status: point.status,
        },
        geometry: {
            type: "Point",
            coordinates: [point.longitude, point.latitude],
        },
    }));

    const currentFeature = currentPoint
        ? [
              {
                  type: "Feature",
                  properties: {
                      id: currentPoint.id,
                      label: currentPoint.label,
                      material: currentPoint.material,
                      evidenceType: currentPoint.evidenceType,
                      accuracy: currentPoint.accuracy,
                      capturedAt: currentPoint.capturedAt,
                      address: currentPoint.address.full,
                      fieldReference: currentPoint.fieldReference,
                      status: currentPoint.status,
                  },
                  geometry: {
                      type: "Point",
                      coordinates: [currentPoint.longitude, currentPoint.latitude],
                  },
              },
          ]
        : [];

    const firstPerimeterPoint = perimeterPoints[0];

    const perimeterFeature =
        perimeterPoints.length >= 3 && firstPerimeterPoint
            ? [
                  {
                      type: "Feature",
                      properties: {
                          id: "PERIMETER-DEMO",
                          label: "Perímetro demo",
                          vertices: perimeterPoints.length,
                      },
                      geometry: {
                          type: "Polygon",
                          coordinates: [
                              [
                                  ...perimeterPoints.map((point) => [point.longitude, point.latitude]),
                                  [firstPerimeterPoint.longitude, firstPerimeterPoint.latitude],
                              ],
                          ],
                      },
                  },
              ]
            : [];

    return {
        type: "FeatureCollection",
        features: [...currentFeature, ...pointFeatures, ...perimeterFeature],
    };
}

function latLngForPoint(point: GeoPoint): LatLngExpression {
    return [point.latitude, point.longitude];
}

function MapClickCapture({
    onMapClick,
}: {
    readonly onMapClick: (latitude: number, longitude: number) => void;
}) {
    useMapEvents({
        click(event) {
            onMapClick(event.latlng.lat, event.latlng.lng);
        },
    });

    return null;
}

function MapController({
    center,
}: {
    readonly center: LatLngExpression;
}) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, Math.max(map.getZoom(), 16), {
            animate: true,
        });
    }, [center, map]);

    return null;
}

export function RealGpsWorkspace() {
    const watchIdRef = useRef<number | null>(null);

    const [gpsState, setGpsState] = useState<GpsState>("idle");
    const [mapMode, setMapMode] = useState<MapMode>("select-point");
    const [errorMessage, setErrorMessage] = useState("");
    const [currentPoint, setCurrentPoint] = useState<GeoPoint | null>(null);
    const [searchPoint, setSearchPoint] = useState<GeoPoint | null>(null);
    const [savedPoints, setSavedPoints] = useState<readonly GeoPoint[]>([]);
    const [perimeterPoints, setPerimeterPoints] = useState<readonly GeoPoint[]>([]);
    const [auditEntries, setAuditEntries] = useState<readonly GpsAuditEntry[]>([]);
    const [captureStatus, setCaptureStatus] = useState<CaptureStatus>("Borrador");
    const [pointLabel, setPointLabel] = useState<string>("Punto de evidencia");
    const [targetMaterial, setTargetMaterial] = useState<string>("Pet coke");
    const [evidenceType, setEvidenceType] = useState<string>("Punto de material");
    const [fieldReference, setFieldReference] = useState<string>("Entre calles / acceso / referencia visual pendiente");
    const [reverseStatus, setReverseStatus] = useState("Sin dirección");
    const [searchQuery, setSearchQuery] = useState("Puerto de Altamira, Tamaulipas");
    const [searchResults, setSearchResults] = useState<readonly SearchResult[]>([]);
    const [copyStatus, setCopyStatus] = useState("GeoJSON listo para copiar");

    const mapCenter = useMemo<LatLngExpression>(() => {
        if (currentPoint) {
            return latLngForPoint(currentPoint);
        }

        if (searchPoint) {
            return latLngForPoint(searchPoint);
        }

        return altamiraFallbackCenter;
    }, [currentPoint, searchPoint]);

    const perimeterPositions = useMemo<LatLngExpression[]>(
        () => perimeterPoints.map((point) => latLngForPoint(point)),
        [perimeterPoints],
    );

    const geoJsonPreview = useMemo(
        () => JSON.stringify(buildGeoJson(savedPoints, perimeterPoints, currentPoint), null, 2),
        [currentPoint, perimeterPoints, savedPoints],
    );

    const captureQuality = useMemo(() => {
        let score = 0;

        if (currentPoint) score += 18;
        if (currentPoint?.address.full && !currentPoint.address.full.includes("pendiente")) score += 16;
        if (currentPoint?.accuracy && currentPoint.accuracy > 0 && currentPoint.accuracy <= 25) score += 16;
        if (fieldReference.trim().length > 12 && !fieldReference.toLowerCase().includes("pendiente")) score += 12;
        if (savedPoints.length > 0) score += 14;
        if (perimeterPoints.length >= 3) score += 18;
        if (auditEntries.length > 0) score += 6;

        return Math.min(score, 100);
    }, [auditEntries.length, currentPoint, fieldReference, perimeterPoints.length, savedPoints.length]);

    const stateLabel = useMemo(() => {
        if (gpsState === "requesting") return "Solicitando ubicación";
        if (gpsState === "tracking") return "Rastreo activo";
        if (gpsState === "granted") return "Ubicación activa";
        if (gpsState === "denied") return "Permiso denegado";
        if (gpsState === "unsupported") return "GPS no soportado";
        if (gpsState === "error") return "Error de ubicación";

        return "Sin ubicación";
    }, [gpsState]);

    useEffect(() => {
        setSavedPoints(safeParsePoints(window.localStorage.getItem(savedPointsStorageKey)));
        setPerimeterPoints(safeParsePoints(window.localStorage.getItem(perimeterStorageKey)));
        setAuditEntries(safeParseAudit(window.localStorage.getItem(auditStorageKey)));
        setCaptureStatus(safeParseCaptureStatus(window.localStorage.getItem(captureStatusStorageKey)));
    }, []);

    useEffect(() => {
        window.localStorage.setItem(savedPointsStorageKey, JSON.stringify(savedPoints));
    }, [savedPoints]);

    useEffect(() => {
        window.localStorage.setItem(perimeterStorageKey, JSON.stringify(perimeterPoints));
    }, [perimeterPoints]);

    useEffect(() => {
        window.localStorage.setItem(auditStorageKey, JSON.stringify(auditEntries));
    }, [auditEntries]);

    useEffect(() => {
        window.localStorage.setItem(captureStatusStorageKey, captureStatus);
    }, [captureStatus]);

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null && "geolocation" in window.navigator) {
                window.navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    function addAudit(title: string, detail: string, severity: AuditSeverity = "info", point?: GeoPoint | null) {
        const nextEntry: GpsAuditEntry = {
            id: `AUD-GPS-${Date.now()}-${Math.round(Math.random() * 1000)}`,
            title,
            detail,
            createdAt: nowLabel(),
            material: point?.material ?? targetMaterial,
            pointId: point?.id ?? "—",
            severity,
        };

        setAuditEntries((current) => [nextEntry, ...current].slice(0, 80));
    }

    async function buildPoint(latitude: number, longitude: number, accuracy: number, label: string, status: string, source: string): Promise<GeoPoint> {
        setReverseStatus("Resolviendo dirección...");

        const address = await reverseGeocode(latitude, longitude);

        setReverseStatus(address.source);

        return {
            id: `GPS-${Date.now()}`,
            label,
            material: targetMaterial,
            evidenceType,
            latitude,
            longitude,
            accuracy,
            capturedAt: nowLabel(),
            source,
            status,
            address,
            fieldReference: fieldReference.trim() || "Referencia de campo pendiente",
        };
    }

    function requestLocation() {
        setErrorMessage("");
        addAudit("Solicitud de ubicación", "El operador solicitó ubicación GPS del dispositivo.", "info");

        if (!("geolocation" in window.navigator)) {
            setGpsState("unsupported");
            setErrorMessage("Este navegador no soporta geolocalización.");
            addAudit("GPS no soportado", "El navegador no soporta geolocalización.", "danger");
            return;
        }

        setGpsState("requesting");

        window.navigator.geolocation.getCurrentPosition(
            (position) => {
                void buildPoint(
                    position.coords.latitude,
                    position.coords.longitude,
                    position.coords.accuracy,
                    "Ubicación actual",
                    "Actual",
                    "GPS del dispositivo",
                ).then((nextPoint) => {
                    setCurrentPoint(nextPoint);
                    setGpsState("granted");
                    setCaptureStatus("Borrador");
                    addAudit("Ubicación obtenida", `Precisión aproximada: ${formatAccuracy(nextPoint.accuracy)}.`, "success", nextPoint);
                });
            },
            (error) => {
                setGpsState(error.code === error.PERMISSION_DENIED ? "denied" : "error");
                setErrorMessage(getErrorMessage(error));
                addAudit("Error al obtener GPS", getErrorMessage(error), "danger");
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
        addAudit("Rastreo iniciado", "Se activó seguimiento de ubicación en vivo.", "info");

        if (!("geolocation" in window.navigator)) {
            setGpsState("unsupported");
            setErrorMessage("Este navegador no soporta geolocalización.");
            addAudit("GPS no soportado", "El navegador no soporta geolocalización.", "danger");
            return;
        }

        if (watchIdRef.current !== null) {
            window.navigator.geolocation.clearWatch(watchIdRef.current);
        }

        setGpsState("tracking");

        watchIdRef.current = window.navigator.geolocation.watchPosition(
            (position) => {
                void buildPoint(
                    position.coords.latitude,
                    position.coords.longitude,
                    position.coords.accuracy,
                    "Ubicación en vivo",
                    "En vivo",
                    "GPS del dispositivo",
                ).then((nextPoint) => {
                    setCurrentPoint(nextPoint);
                    setGpsState("tracking");
                });
            },
            (error) => {
                setGpsState(error.code === error.PERMISSION_DENIED ? "denied" : "error");
                setErrorMessage(getErrorMessage(error));
                addAudit("Error en rastreo", getErrorMessage(error), "danger");
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
        addAudit("Rastreo detenido", "Se detuvo el seguimiento en vivo.", "warning", currentPoint);
    }

    function saveCurrentPoint() {
        if (!currentPoint) {
            return;
        }

        const pointToSave: GeoPoint = {
            ...currentPoint,
            id: `GPS-${Date.now()}`,
            label: pointLabel.trim() || "Punto de campo",
            material: targetMaterial,
            evidenceType,
            capturedAt: nowLabel(),
            status: "Guardado",
            fieldReference: fieldReference.trim() || "Referencia de campo pendiente",
        };

        setSavedPoints((current) => [pointToSave, ...current]);
        setPointLabel("Punto de evidencia");
        setCaptureStatus("Borrador");
        addAudit("Punto guardado", `${pointToSave.label} quedó asociado a ${pointToSave.material}.`, "success", pointToSave);
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
        setCaptureStatus("Borrador");
        addAudit("Vértice agregado", `${perimeterPoint.label} agregado al perímetro visual.`, "success", perimeterPoint);
    }

    function handleMapClick(latitude: number, longitude: number) {
        if (mapMode === "draw-perimeter") {
            void buildPoint(
                latitude,
                longitude,
                0,
                `Vértice ${perimeterPoints.length + 1}`,
                "Vértice",
                "Mapa / selección manual",
            ).then((point) => {
                setCurrentPoint(point);
                setPerimeterPoints((current) => [...current, point]);
                setCaptureStatus("Borrador");
                addAudit("Vértice desde mapa", `${point.label} capturado por click en mapa.`, "success", point);
            });

            return;
        }

        void buildPoint(
            latitude,
            longitude,
            0,
            "Punto seleccionado en mapa",
            "Seleccionado",
            "Mapa / selección manual",
        ).then((point) => {
            setCurrentPoint(point);
            setCaptureStatus("Borrador");
            addAudit("Punto seleccionado", "El operador seleccionó una ubicación directamente en el mapa.", "info", point);
        });
    }

    function clearPerimeter() {
        setPerimeterPoints([]);
        setCaptureStatus("Borrador");
        addAudit("Perímetro limpiado", "Se eliminaron los vértices del perímetro local.", "warning");
    }

    function clearSavedPoints() {
        setSavedPoints([]);
        setCaptureStatus("Borrador");
        addAudit("Puntos limpiados", "Se eliminaron los puntos guardados en el navegador.", "warning");
    }

    function clearAudit() {
        setAuditEntries([]);
    }

    async function runAddressSearch() {
        setSearchResults([]);
        setErrorMessage("");
        setReverseStatus("Buscando dirección...");
        addAudit("Búsqueda de dirección", `Consulta: ${searchQuery}`, "info");

        const results = await searchPlaces(searchQuery);

        setSearchResults(results);
        setReverseStatus(results.length > 0 ? "Resultados encontrados" : "Sin resultados");

        if (results.length === 0) {
            addAudit("Sin resultados", "La búsqueda de dirección no encontró coincidencias.", "warning");
        }
    }

    function useSearchResult(result: SearchResult) {
        const latitude = Number(result.lat);
        const longitude = Number(result.lon);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return;
        }

        const resultPayload: ReverseGeocodeResult = result.address
            ? {
                  display_name: result.display_name,
                  address: result.address,
              }
            : {
                  display_name: result.display_name,
              };

        const address = buildAddressSummary(resultPayload);

        const point: GeoPoint = {
            id: `SEARCH-${Date.now()}`,
            label: "Resultado de búsqueda",
            material: targetMaterial,
            evidenceType,
            latitude,
            longitude,
            accuracy: 0,
            capturedAt: nowLabel(),
            source: "Búsqueda de dirección",
            status: "Referencia",
            address,
            fieldReference: fieldReference.trim() || "Referencia buscada manualmente",
        };

        setSearchPoint(point);
        setCurrentPoint(point);
        setReverseStatus("Dirección seleccionada");
        setCaptureStatus("Borrador");
        addAudit("Dirección seleccionada", point.address.full, "success", point);
    }

    function gpsPackage() {
        return {
            packageId: `NAMIKI-GPS-${new Date().toISOString()}`,
            status: captureStatus,
            qualityScore: captureQuality,
            currentPoint,
            savedPoints,
            perimeterPoints,
            auditEntries,
            geoJson: buildGeoJson(savedPoints, perimeterPoints, currentPoint),
        };
    }

    async function copyGeoJson() {
        const payload = JSON.stringify(gpsPackage(), null, 2);

        if (!window.navigator.clipboard) {
            setCopyStatus("Clipboard no disponible. Usa el bloque GeoJSON visible.");
            addAudit("Exportación no copiada", "Clipboard no disponible en el navegador.", "warning");
            return;
        }

        await window.navigator.clipboard.writeText(payload);
        setCopyStatus("Paquete copiado");
        addAudit("Paquete copiado", "Se copió el paquete GPS con puntos, perímetro, auditoría y GeoJSON.", "success", currentPoint);
    }

    function markReadyToSync() {
        setCaptureStatus("Listo para enviar");
        addAudit("Paquete listo para enviar", "La captura GPS quedó marcada para revisión/sincronización.", "success", currentPoint);
    }

    function simulateSync() {
        setCaptureStatus("Sincronizado");
        addAudit("Sincronización simulada", "El paquete GPS fue marcado como sincronizado localmente.", "success", currentPoint);
    }

    return (
        <section className="nmk-gps-workspace nmk-gps-real-map nmk-gps-audit-mode">
            <div className="nmk-gps-header">
                <div>
                    <p>GPS avanzado</p>
                    <h2>Mapa, captura, auditoría y paquete de envío</h2>
                    <span>
                        Captura ubicación real, busca direcciones, dibuja perímetros, guarda puntos, audita eventos y prepara un paquete exportable.
                    </span>
                </div>

                <div className={`nmk-gps-status nmk-gps-status-${gpsState}`}>
                    <strong>{stateLabel}</strong>
                    <span>{reverseStatus}</span>
                </div>
            </div>

            <section className="nmk-gps-package-strip">
                <article>
                    <span>Estado del paquete</span>
                    <strong>{captureStatus}</strong>
                </article>
                <article>
                    <span>Calidad de captura</span>
                    <strong>{captureQuality}%</strong>
                </article>
                <article>
                    <span>Puntos</span>
                    <strong>{savedPoints.length}</strong>
                </article>
                <article>
                    <span>Vértices</span>
                    <strong>{perimeterPoints.length}</strong>
                </article>
                <article>
                    <span>Auditoría</span>
                    <strong>{auditEntries.length}</strong>
                </article>
            </section>

            <section className="nmk-gps-real-layout">
                <aside className="nmk-gps-control-panel nmk-gps-real-controls">
                    <div className="nmk-gps-actions nmk-gps-actions-premium">
                        <button onClick={requestLocation} type="button">Pedir ubicación</button>
                        <button onClick={startTracking} type="button">Rastrear en vivo</button>
                        <button onClick={stopTracking} type="button">Detener</button>
                        <button disabled={!currentPoint} onClick={saveCurrentPoint} type="button">Guardar punto</button>
                    </div>

                    <div className="nmk-gps-mode-toggle">
                        <button
                            className={mapMode === "select-point" ? "is-active" : ""}
                            onClick={() => setMapMode("select-point")}
                            type="button"
                        >
                            Click = punto
                        </button>
                        <button
                            className={mapMode === "draw-perimeter" ? "is-active" : ""}
                            onClick={() => setMapMode("draw-perimeter")}
                            type="button"
                        >
                            Click = vértice
                        </button>
                    </div>

                    <div className="nmk-gps-search-box">
                        <label className="nmk-field">
                            <span>Buscar lugar o dirección</span>
                            <input
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Ejemplo: Puerto de Altamira, Tamaulipas"
                                type="search"
                                value={searchQuery}
                            />
                        </label>
                        <button onClick={() => void runAddressSearch()} type="button">Buscar</button>
                    </div>

                    {searchResults.length > 0 ? (
                        <div className="nmk-gps-search-results">
                            {searchResults.map((result) => (
                                <button key={result.place_id} onClick={() => useSearchResult(result)} type="button">
                                    {result.display_name}
                                </button>
                            ))}
                        </div>
                    ) : null}

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
                </aside>

                <section className="nmk-real-leaflet-card">
                    <MapContainer center={mapCenter} className="nmk-real-leaflet-map" maxZoom={22} minZoom={3} scrollWheelZoom zoom={17}>
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            maxZoom={22}
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapController center={mapCenter} />
                        <MapClickCapture onMapClick={handleMapClick} />

                        {currentPoint ? (
                            <>
                                <Marker icon={currentIcon} position={latLngForPoint(currentPoint)}>
                                    <Popup>
                                        <strong>{currentPoint.label}</strong>
                                        <br />
                                        {currentPoint.address.full}
                                        <br />
                                        Precisión: {formatAccuracy(currentPoint.accuracy)}
                                    </Popup>
                                </Marker>
                                {currentPoint.accuracy > 0 ? (
                                    <Circle
                                        center={latLngForPoint(currentPoint)}
                                        pathOptions={{ color: "#38bdf8", fillColor: "#38bdf8", fillOpacity: 0.08, weight: 1 }}
                                        radius={Math.max(currentPoint.accuracy, 5)}
                                    />
                                ) : null}
                            </>
                        ) : null}

                        {searchPoint ? (
                            <Marker icon={searchIcon} position={latLngForPoint(searchPoint)}>
                                <Popup>{searchPoint.address.full}</Popup>
                            </Marker>
                        ) : null}

                        {savedPoints.map((point, index) => (
                            <Marker icon={createSavedIcon(index + 1)} key={point.id} position={latLngForPoint(point)}>
                                <Popup>
                                    <strong>{point.label}</strong>
                                    <br />
                                    {point.material} · {point.evidenceType}
                                    <br />
                                    {point.address.full}
                                </Popup>
                            </Marker>
                        ))}

                        {perimeterPoints.map((point, index) => (
                            <Marker icon={createPerimeterIcon(index + 1)} key={point.id} position={latLngForPoint(point)}>
                                <Popup>{point.label}</Popup>
                            </Marker>
                        ))}

                        {perimeterPositions.length >= 2 ? (
                            <Polyline pathOptions={{ color: "#fbbf24", dashArray: "6 6", weight: 2 }} positions={perimeterPositions} />
                        ) : null}

                        {perimeterPositions.length >= 3 ? (
                            <Polygon pathOptions={{ color: "#fbbf24", fillColor: "#fbbf24", fillOpacity: 0.12, weight: 2 }} positions={perimeterPositions} />
                        ) : null}
                    </MapContainer>

                    <div className="nmk-real-map-overlay">
                        <strong>{mapMode === "draw-perimeter" ? "Modo perímetro" : "Modo punto"}</strong>
                        <span>
                            {mapMode === "draw-perimeter"
                                ? "Haz click en el mapa para agregar vértices."
                                : "Haz click en el mapa para seleccionar una ubicación."}
                        </span>
                    </div>
                </section>
            </section>

            <section className="nmk-gps-address-card">
                <div className="nmk-gps-section-title">
                    <p>Ubicación interpretada</p>
                    <h3>Dirección aproximada</h3>
                </div>

                <div className="nmk-address-main">
                    <strong>{currentPoint?.address.full ?? "Pide ubicación, busca dirección o da click en el mapa"}</strong>
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

            <section className="nmk-gps-map-tools nmk-real-map-tools">
                <div className="nmk-gps-section-title">
                    <p>Herramientas de mapa</p>
                    <h3>Registro, perímetro, auditoría y exportación</h3>
                </div>

                <div className="nmk-gps-tool-actions">
                    <button disabled={!currentPoint} onClick={addCurrentPointToPerimeter} type="button">
                        Agregar ubicación actual como vértice
                    </button>
                    <button disabled={perimeterPoints.length === 0} onClick={clearPerimeter} type="button">
                        Limpiar perímetro
                    </button>
                    <button disabled={savedPoints.length === 0} onClick={clearSavedPoints} type="button">
                        Limpiar puntos guardados
                    </button>
                    <button onClick={markReadyToSync} type="button">
                        Marcar listo para enviar
                    </button>
                    <button onClick={simulateSync} type="button">
                        Simular sincronización
                    </button>
                    <button onClick={() => void copyGeoJson()} type="button">
                        Copiar paquete
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
                        <strong>{captureStatus}</strong>
                        <span>Estado</span>
                    </article>
                    <article>
                        <strong>{copyStatus}</strong>
                        <span>Exportación</span>
                    </article>
                </div>
            </section>

            <section className="nmk-gps-audit-grid">
                <div className="nmk-gps-audit-panel">
                    <div className="nmk-gps-section-title">
                        <p>Auditoría GPS</p>
                        <h3>Línea del tiempo de captura</h3>
                    </div>

                    <div className="nmk-gps-audit-actions">
                        <button disabled={auditEntries.length === 0} onClick={clearAudit} type="button">
                            Limpiar auditoría
                        </button>
                    </div>

                    <div className="nmk-gps-audit-list">
                        {auditEntries.length > 0 ? (
                            auditEntries.map((entry) => (
                                <article className={`nmk-audit-entry nmk-audit-entry-${entry.severity}`} key={entry.id}>
                                    <time>{entry.createdAt}</time>
                                    <div>
                                        <strong>{entry.title}</strong>
                                        <p>{entry.detail}</p>
                                        <span>{entry.material} · {entry.pointId}</span>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <article className="nmk-audit-entry nmk-audit-entry-info">
                                <time>—</time>
                                <div>
                                    <strong>Sin auditoría todavía</strong>
                                    <p>Solicita ubicación, busca dirección, guarda punto o dibuja perímetro para generar eventos.</p>
                                    <span>GPS · Captura</span>
                                </div>
                            </article>
                        )}
                    </div>
                </div>

                <div className="nmk-gps-quality-panel">
                    <div className="nmk-gps-section-title">
                        <p>Calidad</p>
                        <h3>Checklist de captura</h3>
                    </div>

                    <div className="nmk-quality-meter">
                        <span style={{ width: `${captureQuality}%` }} />
                    </div>

                    <div className="nmk-quality-list">
                        <article className={currentPoint ? "is-done" : ""}>
                            <strong>Ubicación actual</strong>
                            <span>{currentPoint ? "Completado" : "Pendiente"}</span>
                        </article>
                        <article className={currentPoint?.address.full && !currentPoint.address.full.includes("pendiente") ? "is-done" : ""}>
                            <strong>Dirección interpretada</strong>
                            <span>{currentPoint?.address.source ?? "Pendiente"}</span>
                        </article>
                        <article className={savedPoints.length > 0 ? "is-done" : ""}>
                            <strong>Punto guardado</strong>
                            <span>{savedPoints.length} registros</span>
                        </article>
                        <article className={perimeterPoints.length >= 3 ? "is-done" : ""}>
                            <strong>Perímetro</strong>
                            <span>{perimeterPoints.length >= 3 ? "Polígono listo" : `${perimeterPoints.length}/3 mínimo`}</span>
                        </article>
                        <article className={captureStatus !== "Borrador" ? "is-done" : ""}>
                            <strong>Paquete</strong>
                            <span>{captureStatus}</span>
                        </article>
                    </div>
                </div>
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
                                <span>Primero pide ubicación, busca un lugar o da click en el mapa.</span>
                            </div>
                            <p>El punto queda persistido en el navegador para que la demo se sienta registrada.</p>
                        </article>
                    )}
                </div>

                <div className="nmk-gps-next-actions">
                    <div className="nmk-gps-section-title">
                        <p>Objeto técnico preparado</p>
                        <h3>Paquete exportable</h3>
                    </div>

                    <pre className="nmk-gps-json">{geoJsonPreview}</pre>
                </div>
            </div>
        </section>
    );
}