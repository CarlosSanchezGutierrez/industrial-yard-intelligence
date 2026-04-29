import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { AuditTimelineStoryPanel } from "./AuditTimelineStoryPanel.js";
import { DemoDataResetPanel } from "./DemoDataResetPanel.js";
import { OperatorWorkflowProgressPanel } from "./OperatorWorkflowProgressPanel.js";
import { PremiumGpsPreviewPanel } from "./PremiumGpsPreviewPanel.js";
import { RuntimeConnectionStatusPanel } from "./RuntimeConnectionStatusPanel.js";
import { StockpileDemoSummaryPanel } from "./StockpileDemoSummaryPanel.js";
import { SyncDemoStoryPanel } from "./SyncDemoStoryPanel.js";
import { YardOperationsMapPanel } from "./YardOperationsMapPanel.js";

const views = [
    { id: "inicio", label: "Inicio", short: "Centro", description: "Estado general del patio." },
    { id: "patio", label: "Patio", short: "Mapa", description: "Mapa operativo, zonas y objetos." },
    { id: "materiales", label: "Materiales", short: "Pilas", description: "Inventario, estados y responsables." },
    { id: "captura", label: "Captura", short: "Campo", description: "GPS, evidencia, medición y RTK." },
    { id: "equipo", label: "Equipo", short: "Recursos", description: "Maquinaria, cuadrillas y herramientas." },
    { id: "historial", label: "Historial", short: "Eventos", description: "Trazabilidad y filtros." },
    { id: "analisis", label: "Análisis", short: "Datos", description: "Comparación, demanda y alertas." },
    { id: "envios", label: "Envíos", short: "Sync", description: "Trabajo local y sincronización." },
    { id: "interno", label: "Interno", short: "Admin", description: "Validación técnica escondida." },
] as const;

type ViewId = (typeof views)[number]["id"];

type LiveSummary = {
    readonly stockpileCount: number;
    readonly auditCount: number;
    readonly syncStatus: string;
    readonly apiStatus: "online" | "offline" | "checking";
};

const materialRows = [
    { name: "Pet coke", zone: "Patio A", tons: 12400, status: "Operativo", priority: "Normal", owner: "Supervisor patio", updated: "08:20" },
    { name: "Clinker", zone: "Patio B", tons: 8600, status: "Revisión", priority: "Alta", owner: "Calidad", updated: "09:05" },
    { name: "Chatarra HMS", zone: "Zona acero", tons: 3200, status: "Operativo", priority: "Normal", owner: "Operación", updated: "09:45" },
    { name: "Fluorita MT", zone: "Patio C", tons: 5400, status: "Validado", priority: "Baja", owner: "Supervisor turno", updated: "10:10" },
    { name: "Mineral mixto", zone: "Revisión", tons: 2100, status: "Pendiente", priority: "Media", owner: "Laboratorio", updated: "10:30" },
] as const;

const eventRows = [
    { type: "Material", time: "08:20", title: "Descarga registrada", text: "Pet coke quedó asociado a Patio A.", priority: "Normal" },
    { type: "Material", time: "09:05", title: "Clinker pasó a revisión", text: "Requiere validación por diferencia estimada.", priority: "Alta" },
    { type: "Medición", time: "09:45", title: "Referencia espacial agregada", text: "Fluorita MT marcada para revisión de volumen.", priority: "Normal" },
    { type: "Alerta", time: "10:10", title: "Validación requerida", text: "Se recomienda revisión de supervisor.", priority: "Alta" },
    { type: "Equipo", time: "10:25", title: "Payloader disponible", text: "Equipo móvil listo para movimiento.", priority: "Media" },
    { type: "Envío", time: "10:40", title: "Paquete listo", text: "Cambios preparados para sincronización.", priority: "Normal" },
] as const;

const captureTools = [
    { title: "GPS del dispositivo", text: "Pedir ubicación desde celular o laptop." },
    { title: "Perímetros", text: "Dibujar patio, zona o pila sobre el mapa." },
    { title: "Evidencia", text: "Fotos, notas y validaciones de campo." },
    { title: "Drones RTK", text: "Drones con RTK (Real Time Kinematic) para captura superior." },
    { title: "Bastones topográficos con trípode", text: "Referencia física para medición y control de volumen." },
    { title: "Medición de volumen", text: "Base para comparar estimación, evidencia y estado." },
] as const;

const evidenceRows = [
    {
        id: "EV-001",
        material: "Pet coke",
        type: "Foto",
        source: "Celular",
        status: "Guardada",
        note: "Vista lateral de pila en Patio A.",
        time: "08:32",
    },
    {
        id: "EV-002",
        material: "Clinker",
        type: "Medición",
        source: "Bastones topográficos con trípode",
        status: "Revisión",
        note: "Diferencia estimada en geometría de pila.",
        time: "09:18",
    },
    {
        id: "EV-003",
        material: "Fluorita MT",
        type: "Vuelo RTK",
        source: "Drones RTK",
        status: "Validada",
        note: "Captura superior para estimación espacial.",
        time: "10:14",
    },
    {
        id: "EV-004",
        material: "Mineral mixto",
        type: "Nota",
        source: "Supervisor",
        status: "Pendiente",
        note: "Requiere confirmar zona exacta.",
        time: "10:36",
    },
] as const;

const equipmentRows = [
    { title: "Payloader", text: "Movimiento y acomodo de material.", status: "Disponible" },
    { title: "Grúas", text: "Descarga y maniobras pesadas.", status: "Operativo" },
    { title: "Básculas", text: "Peso de entrada, salida y validación.", status: "Revisión diaria" },
    { title: "Drones RTK", text: "Captura aérea con precisión geoespacial.", status: "Planeado" },
    { title: "Bastones topográficos con trípode", text: "Medición física de referencia.", status: "Planeado" },
    { title: "Cuadrillas", text: "Operadores, supervisores y apoyo.", status: "Activo" },
] as const;

const demandSignals = [
    { label: "Saturación", value: "Media", text: "Patio B requiere revisión antes de nuevo material." },
    { label: "Demanda", value: "+28%", text: "Más movimientos contra el turno anterior." },
    { label: "Riesgo", value: "4 eventos", text: "Pendientes por validar o cerrar." },
    { label: "Confianza", value: "Alta", text: "Datos suficientes para demo operativa." },
] as const;

function isViewId(value: unknown): value is ViewId {
    return typeof value === "string" && views.some((view) => view.id === value);
}

function getInitialView(): ViewId {
    const hash = window.location.hash.replace("#/", "").replace("#", "");

    if (isViewId(hash)) {
        return hash;
    }

    return "inicio";
}

async function fetchJsonWithTimeout(uri: string, timeoutMs = 1800): Promise<unknown> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(uri, {
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } finally {
        window.clearTimeout(timeout);
    }
}

function normalizeCount(value: unknown): number {
    if (Array.isArray(value)) {
        return value.length;
    }

    if (value && typeof value === "object") {
        const objectValue = value as Record<string, unknown>;

        for (const key of ["items", "data", "stockpiles", "mutations", "events", "entries"]) {
            if (Array.isArray(objectValue[key])) {
                return objectValue[key].length;
            }
        }

        if (typeof objectValue.count === "number") {
            return objectValue.count;
        }

        if (typeof objectValue.total === "number") {
            return objectValue.total;
        }
    }

    return 0;
}

function PageTitle({
    eyebrow,
    title,
    subtitle,
}: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
}) {
    return (
        <div className="nmk-title-block">
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{subtitle}</span>
        </div>
    );
}

function MetricCard({
    label,
    value,
    text,
    tone = "default",
}: {
    readonly label: string;
    readonly value: string;
    readonly text: string;
    readonly tone?: "default" | "good" | "warn" | "info";
}) {
    return (
        <article className={`nmk-metric nmk-tone-${tone}`}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{text}</span>
        </article>
    );
}

function ProductCard({
    title,
    text,
    meta,
}: {
    readonly title: string;
    readonly text: string;
    readonly meta?: string;
}) {
    return (
        <article className="nmk-card">
            <div>
                <h3>{title}</h3>
                <p>{text}</p>
            </div>
            {meta ? <span>{meta}</span> : null}
        </article>
    );
}

function Drawer({
    title,
    text,
    children,
}: {
    readonly title: string;
    readonly text: string;
    readonly children: ReactNode;
}) {
    return (
        <details className="nmk-drawer">
            <summary>
                <div>
                    <strong>{title}</strong>
                    <span>{text}</span>
                </div>
                <em>Abrir</em>
            </summary>
            <div className="nmk-drawer-body">{children}</div>
        </details>
    );
}

function MiniBarChart({
    rows,
}: {
    readonly rows: ReadonlyArray<{ readonly label: string; readonly value: number }>;
}) {
    const max = Math.max(...rows.map((row) => row.value), 1);

    return (
        <div className="nmk-bars">
            {rows.map((row) => (
                <div className="nmk-bar-row" key={row.label}>
                    <span>{row.label}</span>
                    <div>
                        <i style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }} />
                    </div>
                    <strong>{row.value.toLocaleString("es-MX")}</strong>
                </div>
            ))}
        </div>
    );
}

function StatusPill({ value }: { readonly value: string }) {
    const lower = value.toLowerCase();
    const tone = lower.includes("alta") || lower.includes("revisión") || lower.includes("pendiente") ? "warn" : "good";

    return <span className={`nmk-pill nmk-pill-${tone}`}>{value}</span>;
}

function OperationalMap() {
    const mapLayers = [
        { id: "zones", label: "Zonas" },
        { id: "routes", label: "Rutas" },
        { id: "materials", label: "Materiales" },
        { id: "equipment", label: "Equipo" },
    ] as const;

    type MapLayerId = (typeof mapLayers)[number]["id"];

    const [layers, setLayers] = useState<Record<MapLayerId, boolean>>({
        zones: true,
        routes: true,
        materials: true,
        equipment: true,
    });

    function toggleLayer(layerId: MapLayerId) {
        setLayers((current) => ({
            ...current,
            [layerId]: !current[layerId],
        }));
    }

    return (
        <div className="nmk-map-shell">
            <aside className="nmk-layer-panel">
                <div>
                    <p>Capas del mapa</p>
                    <h3>Vista operativa</h3>
                    <span>Activa o apaga elementos para explicar el patio sin saturar la vista.</span>
                </div>

                <div className="nmk-layer-list">
                    {mapLayers.map((layer) => (
                        <button
                            className={layers[layer.id] ? "is-active" : ""}
                            key={layer.id}
                            onClick={() => toggleLayer(layer.id)}
                            type="button"
                        >
                            <span />
                            {layer.label}
                        </button>
                    ))}
                </div>

                <div className="nmk-map-status-grid">
                    <article>
                        <strong>5</strong>
                        <span>Zonas</span>
                    </article>
                    <article>
                        <strong>4</strong>
                        <span>Pilas</span>
                    </article>
                    <article>
                        <strong>3</strong>
                        <span>Equipos</span>
                    </article>
                    <article>
                        <strong>2</strong>
                        <span>Rutas</span>
                    </article>
                </div>
            </aside>

            <div className="nmk-map">
                <div className="nmk-water">Frente de agua / descarga</div>

                {layers.routes ? (
                    <>
                        <div className="nmk-rail" />
                        <div className="nmk-belt">Sistema de bandas</div>
                    </>
                ) : null}

                {layers.zones ? (
                    <>
                        <div className="nmk-tag nmk-tag-arthur">Arthur</div>
                        <div className="nmk-tag nmk-tag-sharon">Sharon</div>
                        <div className="nmk-tag nmk-tag-mr2">MR2</div>
                        <div className="nmk-dock nmk-dock-1">Muelle 1</div>
                        <div className="nmk-dock nmk-dock-2">Muelle 2</div>
                    </>
                ) : null}

                {layers.materials ? (
                    <>
                        <div className="nmk-pile nmk-pile-a">Pet coke</div>
                        <div className="nmk-pile nmk-pile-b">Clinker</div>
                        <div className="nmk-pile nmk-pile-c">Chatarra HMS</div>
                        <div className="nmk-pile nmk-pile-d">Fluorita MT</div>
                    </>
                ) : null}

                {layers.equipment ? (
                    <>
                        <div className="nmk-equipment nmk-bodega">Bodega</div>
                        <div className="nmk-equipment nmk-bascula">Básculas</div>
                        <div className="nmk-equipment nmk-telestacker">Telestacker</div>
                    </>
                ) : null}

                <div className="nmk-map-legend">
                    <span>Material</span>
                    <span>Equipo</span>
                    <span>Ruta</span>
                    <span>Zona</span>
                </div>
            </div>
        </div>
    );
}

function MaterialTable() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("Todos");
    const [selectedName, setSelectedName] = useState<string>(materialRows[0]?.name ?? "");

    const statusOptions = useMemo(
        () => ["Todos", ...Array.from(new Set(materialRows.map((row) => row.status)))],
        [],
    );

    const filteredRows = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return materialRows.filter((row) => {
            const matchesStatus = status === "Todos" || row.status === status;
            const matchesQuery =
                normalizedQuery.length === 0 ||
                row.name.toLowerCase().includes(normalizedQuery) ||
                row.zone.toLowerCase().includes(normalizedQuery) ||
                row.owner.toLowerCase().includes(normalizedQuery) ||
                row.priority.toLowerCase().includes(normalizedQuery);

            return matchesStatus && matchesQuery;
        });
    }, [query, status]);

    const selectedMaterial =
        materialRows.find((row) => row.name === selectedName) ??
        filteredRows[0] ??
        materialRows[0];

    const relatedEvents = useMemo(() => {
        if (!selectedMaterial) {
            return [];
        }

        const materialName = selectedMaterial.name.toLowerCase();
        const zoneName = selectedMaterial.zone.toLowerCase();

        return eventRows.filter((event) => {
            const eventText = `${event.title} ${event.text}`.toLowerCase();

            return eventText.includes(materialName) || eventText.includes(zoneName);
        });
    }, [selectedMaterial]);

    const relatedEvidence = useMemo(() => {
        if (!selectedMaterial) {
            return [];
        }

        return evidenceRows.filter((evidence) => evidence.material === selectedMaterial.name);
    }, [selectedMaterial]);

    if (!selectedMaterial) {
        return (
            <div className="nmk-empty-state">
                <h3>Sin materiales</h3>
                <p>No hay materiales disponibles para mostrar.</p>
            </div>
        );
    }

    return (
        <div className="nmk-material-workspace">
            <div className="nmk-material-controls">
                <label className="nmk-field">
                    <span>Buscar</span>
                    <input
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Material, zona, responsable..."
                        type="search"
                        value={query}
                    />
                </label>

                <label className="nmk-field">
                    <span>Estado</span>
                    <select
                        onChange={(event) => setStatus(event.target.value)}
                        value={status}
                    >
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="nmk-material-layout">
                <div className="nmk-table-wrap">
                    <table className="nmk-table">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Zona</th>
                                <th>Toneladas</th>
                                <th>Estado</th>
                                <th>Prioridad</th>
                                <th>Responsable</th>
                                <th>Hora</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((row) => (
                                <tr className={row.name === selectedMaterial.name ? "is-selected" : ""} key={row.name}>
                                    <td>{row.name}</td>
                                    <td>{row.zone}</td>
                                    <td>{row.tons.toLocaleString("es-MX")} t</td>
                                    <td><StatusPill value={row.status} /></td>
                                    <td>{row.priority}</td>
                                    <td>{row.owner}</td>
                                    <td>{row.updated}</td>
                                    <td>
                                        <button
                                            className="nmk-link-button"
                                            onClick={() => setSelectedName(row.name)}
                                            type="button"
                                        >
                                            Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <aside className="nmk-material-detail">
                    <p>Detalle del material</p>
                    <h3>{selectedMaterial.name}</h3>

                    <div className="nmk-detail-grid">
                        <span>Zona</span>
                        <strong>{selectedMaterial.zone}</strong>

                        <span>Toneladas</span>
                        <strong>{selectedMaterial.tons.toLocaleString("es-MX")} t</strong>

                        <span>Estado</span>
                        <strong>{selectedMaterial.status}</strong>

                        <span>Prioridad</span>
                        <strong>{selectedMaterial.priority}</strong>

                        <span>Responsable</span>
                        <strong>{selectedMaterial.owner}</strong>

                        <span>Actualizado</span>
                        <strong>{selectedMaterial.updated}</strong>
                    </div>

                    <div className="nmk-connected-panel">
                        <div className="nmk-connected-head">
                            <strong>Historial relacionado</strong>
                            <span>{relatedEvents.length} eventos</span>
                        </div>

                        <div className="nmk-mini-list">
                            {relatedEvents.length > 0 ? (
                                relatedEvents.map((event) => (
                                    <article key={`${event.time}-${event.title}`}>
                                        <time>{event.time}</time>
                                        <div>
                                            <strong>{event.title}</strong>
                                            <span>{event.text}</span>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <article>
                                    <time>—</time>
                                    <div>
                                        <strong>Sin eventos directos</strong>
                                        <span>Este material aún no tiene eventos filtrados por nombre o zona.</span>
                                    </div>
                                </article>
                            )}
                        </div>
                    </div>

                    <div className="nmk-connected-panel">
                        <div className="nmk-connected-head">
                            <strong>Evidencia ligada</strong>
                            <span>{relatedEvidence.length} registros</span>
                        </div>

                        <div className="nmk-mini-list">
                            {relatedEvidence.length > 0 ? (
                                relatedEvidence.map((evidence) => (
                                    <article key={evidence.id}>
                                        <time>{evidence.time}</time>
                                        <div>
                                            <strong>{evidence.type} · {evidence.source}</strong>
                                            <span>{evidence.note}</span>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <article>
                                    <time>—</time>
                                    <div>
                                        <strong>Sin evidencia directa</strong>
                                        <span>Registra foto, nota, medición, GPS o captura RTK desde Captura.</span>
                                    </div>
                                </article>
                            )}
                        </div>
                    </div>

                    <div className="nmk-detail-actions">
                        <button type="button">Registrar evidencia</button>
                        <button type="button">Ver historial completo</button>
                        <button type="button">Enviar a revisión</button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function TimelineBoard() {
    const [filter, setFilter] = useState("Todos");
    const [priority, setPriority] = useState("Todas");
    const [query, setQuery] = useState("");

    const eventTypes = ["Todos", "Material", "Medición", "Alerta", "Equipo", "Envío"] as const;
    const priorityTypes = ["Todas", "Alta", "Media", "Normal"] as const;

    const visibleEvents = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return eventRows.filter((event) => {
            const matchesType = filter === "Todos" || event.type === filter;
            const matchesPriority = priority === "Todas" || event.priority === priority;
            const matchesQuery =
                normalizedQuery.length === 0 ||
                event.title.toLowerCase().includes(normalizedQuery) ||
                event.text.toLowerCase().includes(normalizedQuery) ||
                event.type.toLowerCase().includes(normalizedQuery) ||
                event.priority.toLowerCase().includes(normalizedQuery);

            return matchesType && matchesPriority && matchesQuery;
        });
    }, [filter, priority, query]);

    return (
        <div className="nmk-timeline">
            <div className="nmk-timeline-controls">
                <label className="nmk-field">
                    <span>Buscar evento</span>
                    <input
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Material, alerta, envío, medición..."
                        type="search"
                        value={query}
                    />
                </label>

                <label className="nmk-field">
                    <span>Prioridad</span>
                    <select
                        onChange={(event) => setPriority(event.target.value)}
                        value={priority}
                    >
                        {priorityTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="nmk-filter-row">
                {eventTypes.map((type) => (
                    <button
                        className={type === filter ? "is-active" : ""}
                        key={type}
                        onClick={() => setFilter(type)}
                        type="button"
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="nmk-timeline-summary">
                <article>
                    <strong>{visibleEvents.length}</strong>
                    <span>Eventos visibles</span>
                </article>
                <article>
                    <strong>{eventRows.filter((event) => event.priority === "Alta").length}</strong>
                    <span>Alta prioridad</span>
                </article>
                <article>
                    <strong>{eventRows.filter((event) => event.type === "Medición").length}</strong>
                    <span>Mediciones</span>
                </article>
            </div>

            <div className="nmk-timeline-list">
                {visibleEvents.length > 0 ? (
                    visibleEvents.map((event) => (
                        <article className="nmk-event" key={`${event.time}-${event.title}`}>
                            <time>{event.time}</time>
                            <div>
                                <div className="nmk-event-head">
                                    <h3>{event.title}</h3>
                                    <StatusPill value={event.priority} />
                                </div>
                                <p>{event.text}</p>
                                <span>{event.type}</span>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="nmk-empty-state">
                        <h3>Sin eventos para estos filtros</h3>
                        <p>Cambia la búsqueda, tipo o prioridad para ver más registros.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ExperienceCommandDeck({
    goToView,
}: {
    readonly goToView: (view: ViewId) => void;
}) {
    const cards: ReadonlyArray<{
        readonly title: string;
        readonly text: string;
        readonly target: ViewId;
        readonly meta: string;
    }> = [
        {
            title: "Patio operativo",
            text: "Mapa, muelles, vías, bandas, zonas, materiales y equipo.",
            target: "patio",
            meta: "Mapa",
        },
        {
            title: "Materiales",
            text: "Inventario, toneladas, estado, prioridad y responsable.",
            target: "materiales",
            meta: "Control",
        },
        {
            title: "Captura en campo",
            text: "GPS, evidencia, perímetros, drones RTK y medición.",
            target: "captura",
            meta: "Campo",
        },
        {
            title: "Análisis",
            text: "Comparación, demanda, saturación y recomendaciones.",
            target: "analisis",
            meta: "Decisión",
        },
    ];

    return (
        <section className="nmk-command-deck">
            {cards.map((card) => (
                <button
                    className="nmk-command-card"
                    key={card.title}
                    onClick={() => goToView(card.target)}
                    type="button"
                >
                    <span>{card.meta}</span>
                    <strong>{card.title}</strong>
                    <p>{card.text}</p>
                </button>
            ))}
        </section>
    );
}
function ExecutiveDashboard({
    liveSummary,
    goToView,
}: {
    readonly liveSummary: LiveSummary;
    readonly goToView: (view: ViewId) => void;
}) {
    const totalTons = materialRows.reduce((total, row) => total + row.tons, 0);

    return (
        <div className="nmk-dashboard">
            <section className="nmk-hero">
                <PageTitle
                    eyebrow="Modelo Namiki"
                    title="Centro operativo del patio"
                    subtitle="Una consola para ver materiales, zonas, captura, equipo, historial, análisis y envíos sin exponer complejidad técnica."
                />

                <div className="nmk-actions">
                    <button onClick={() => goToView("patio")} type="button">Abrir mapa</button>
                    <button onClick={() => goToView("materiales")} type="button">Ver materiales</button>
                    <button onClick={() => goToView("historial")} type="button">Revisar historial</button>
                    <button onClick={() => goToView("analisis")} type="button">Ver análisis</button>
                </div>
            </section>

            <ExperienceCommandDeck goToView={goToView} />

            <section className="nmk-metric-grid">
                <MetricCard label="Materiales visibles" value={String(Math.max(liveSummary.stockpileCount, materialRows.length))} text="Pilas y registros operativos." tone="info" />
                <MetricCard label="Toneladas demo" value={`${totalTons.toLocaleString("es-MX")} t`} text="Volumen de referencia." tone="good" />
                <MetricCard label="Eventos" value={String(Math.max(liveSummary.auditCount, eventRows.length))} text="Movimientos y validaciones." tone="info" />
                <MetricCard label="Sistema" value={liveSummary.apiStatus === "online" ? "Activo" : "Local"} text={liveSummary.syncStatus} tone={liveSummary.apiStatus === "online" ? "good" : "warn"} />
            </section>

            <section className="nmk-two-col">
                <div className="nmk-panel">
                    <div className="nmk-panel-head">
                        <div>
                            <p>Distribución</p>
                            <h2>Toneladas por material</h2>
                        </div>
                        <span>Demo data</span>
                    </div>
                    <MiniBarChart rows={materialRows.map((row) => ({ label: row.name, value: row.tons }))} />
                </div>

                <div className="nmk-panel">
                    <div className="nmk-panel-head">
                        <div>
                            <p>Prioridad</p>
                            <h2>Atención recomendada</h2>
                        </div>
                        <span>Turno actual</span>
                    </div>
                    <div className="nmk-card-stack">
                        <ProductCard title="Clinker en revisión" text="Priorizar validación antes de mover o mezclar material." meta="Alta" />
                        <ProductCard title="GPS y perímetros" text="Siguiente paso para cerrar la propuesta de valor en campo." meta="P1" />
                        <ProductCard title="Historial filtrable" text="Ya visible para explicar trazabilidad a supervisores." meta="P0" />
                    </div>
                </div>
            </section>
        </div>
    );
}

function PatioView() {
    return (
        <div className="nmk-view-grid">
            <section className="nmk-panel nmk-span-2">
                <div className="nmk-panel-head">
                    <div>
                        <p>Patio</p>
                        <h2>Mapa operativo construido</h2>
                    </div>
                    <span>Muelles · vías · bandas · pilas · equipos</span>
                </div>
                <OperationalMap />
            </section>

            <section className="nmk-panel">
                <div className="nmk-panel-head">
                    <div>
                        <p>Capas</p>
                        <h2>Objetos visibles</h2>
                    </div>
                </div>
                <div className="nmk-card-stack">
                    <ProductCard title="Patios y zonas" text="Patio A, Patio B, bodega, básculas y zonas de revisión." />
                    <ProductCard title="Rutas internas" text="Vía férrea, muelles y sistema de bandas." />
                    <ProductCard title="Materiales" text="Pilas ubicadas dentro del universo operativo." />
                    <ProductCard title="Equipo" text="Básculas, bodega, telestacker y recursos móviles." />
                </div>
            </section>

            <section className="nmk-panel">
                <div className="nmk-panel-head">
                    <div>
                        <p>Arquitectura visible</p>
                        <h2>Vista heredada</h2>
                    </div>
                </div>
                <Drawer title="Abrir mapa anterior" text="Se conserva como referencia del componente construido anteriormente.">
                    <YardOperationsMapPanel />
                </Drawer>
            </section>
        </div>
    );
}

function MaterialesView() {
    return (
        <div className="nmk-view-grid">
            <section className="nmk-panel nmk-span-2">
                <div className="nmk-panel-head">
                    <div>
                        <p>Materiales</p>
                        <h2>Inventario operativo</h2>
                    </div>
                    <span>Zona · estado · toneladas · responsable</span>
                </div>
                <MaterialTable />
            </section>

            <section className="nmk-panel">
                <div className="nmk-panel-head">
                    <div>
                        <p>Estados</p>
                        <h2>Distribución</h2>
                    </div>
                </div>
                <MiniBarChart rows={[
                    { label: "Operativo", value: 2 },
                    { label: "Revisión", value: 1 },
                    { label: "Validado", value: 1 },
                    { label: "Pendiente", value: 1 },
                ]} />
            </section>

            <section className="nmk-panel">
                <div className="nmk-panel-head">
                    <div>
                        <p>Flujo</p>
                        <h2>Operación del material</h2>
                    </div>
                </div>
                <div className="nmk-card-stack">
                    <ProductCard title="Registrar" text="Crear material o pila nueva con zona, cantidad y estado." />
                    <ProductCard title="Actualizar" text="Cambiar estado, prioridad o responsable." />
                    <ProductCard title="Validar" text="Cerrar revisión con evidencia y supervisor." />
                </div>
            </section>

            <section className="nmk-panel nmk-span-2">
                <Drawer title="Panel real de stockpiles" text="Abre el componente conectado al resumen construido en la arquitectura.">
                    <StockpileDemoSummaryPanel />
                </Drawer>
                <Drawer title="Flujo guiado de operación" text="Abre el panel de avance operador/supervisor.">
                    <OperatorWorkflowProgressPanel />
                </Drawer>
            </section>
        </div>
    );
}

function EvidenceWorkspace() {
    const [targetMaterial, setTargetMaterial] = useState(materialRows[0]?.name ?? "Pet coke");
    const [evidenceType, setEvidenceType] = useState("Foto");
    const [note, setNote] = useState("");
    const [queuedItems, setQueuedItems] = useState(evidenceRows);

    function addEvidenceItem() {
        const trimmedNote = note.trim();

        const nextItem = {
            id: `EV-${String(queuedItems.length + 1).padStart(3, "0")}`,
            material: targetMaterial,
            type: evidenceType,
            source:
                evidenceType === "Vuelo RTK"
                    ? "Drones RTK"
                    : evidenceType === "Medición"
                      ? "Bastones topográficos con trípode"
                      : evidenceType === "GPS"
                        ? "GPS del dispositivo"
                        : "Celular",
            status: "Pendiente",
            note: trimmedNote.length > 0 ? trimmedNote : "Evidencia capturada en campo pendiente de validación.",
            time: "Ahora",
        };

        setQueuedItems((current) => [nextItem, ...current]);
        setNote("");
    }

    return (
        <div className="nmk-evidence-workspace">
            <section className="nmk-evidence-form">
                <div className="nmk-panel-head">
                    <div>
                        <p>Workspace de evidencia</p>
                        <h2>Captura operativa</h2>
                    </div>
                    <span>Campo · revisión · validación</span>
                </div>

                <div className="nmk-evidence-fields">
                    <label className="nmk-field">
                        <span>Material</span>
                        <select
                            onChange={(event) => setTargetMaterial(event.target.value)}
                            value={targetMaterial}
                        >
                            {materialRows.map((material) => (
                                <option key={material.name} value={material.name}>
                                    {material.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="nmk-field">
                        <span>Tipo de evidencia</span>
                        <select
                            onChange={(event) => setEvidenceType(event.target.value)}
                            value={evidenceType}
                        >
                            <option>Foto</option>
                            <option>GPS</option>
                            <option>Medición</option>
                            <option>Vuelo RTK</option>
                            <option>Nota</option>
                        </select>
                    </label>

                    <label className="nmk-field nmk-field-wide">
                        <span>Nota de campo</span>
                        <textarea
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Ejemplo: pila con pendiente irregular, requiere validación de volumen..."
                            value={note}
                        />
                    </label>
                </div>

                <div className="nmk-evidence-preview">
                    <div>
                        <p>Fuente sugerida</p>
                        <strong>
                            {evidenceType === "Vuelo RTK"
                                ? "Drones RTK (Real Time Kinematic)"
                                : evidenceType === "Medición"
                                  ? "Bastones topográficos con trípode"
                                  : evidenceType === "GPS"
                                    ? "GPS del dispositivo"
                                    : "Celular / supervisor"}
                        </strong>
                        <span>La evidencia queda ligada al material seleccionado y preparada para historial.</span>
                    </div>

                    <button onClick={addEvidenceItem} type="button">
                        Agregar evidencia demo
                    </button>
                </div>
            </section>

            <section className="nmk-evidence-queue">
                <div className="nmk-panel-head">
                    <div>
                        <p>Cola de evidencia</p>
                        <h2>Registros recientes</h2>
                    </div>
                    <span>{queuedItems.length} items</span>
                </div>

                <div className="nmk-evidence-list">
                    {queuedItems.map((item) => (
                        <article key={`${item.id}-${item.time}-${item.material}`}>
                            <div>
                                <strong>{item.material}</strong>
                                <span>{item.type} · {item.source}</span>
                            </div>
                            <p>{item.note}</p>
                            <footer>
                                <span>{item.id}</span>
                                <span>{item.status}</span>
                                <span>{item.time}</span>
                            </footer>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

function CapturaView() {
    return (
        <div className="nmk-view-grid">
            <section className="nmk-panel nmk-span-2">
                <div className="nmk-panel-head">
                    <div>
                        <p>Captura</p>
                        <h2>Herramientas de campo</h2>
                    </div>
                    <span>GPS · evidencia · medición · RTK</span>
                </div>
                <div className="nmk-card-grid">
                    {captureTools.map((tool) => (
                        <ProductCard key={tool.title} title={tool.title} text={tool.text} />
                    ))}
                </div>
            </section>

            <section className="nmk-panel nmk-span-2">
                <EvidenceWorkspace />
            </section>

            <section className="nmk-panel">
                <div className="nmk-panel-head">
                    <div>
                        <p>Secuencia</p>
                        <h2>Captura recomendada</h2>
                    </div>
                </div>
                <div className="nmk-card-stack">
                    <ProductCard title="1. Ubicación" text="Pedir permiso y obtener coordenadas." />
                    <ProductCard title="2. Punto" text="Marcar material, equipo o evidencia." />
                    <ProductCard title="3. Perímetro" text="Dibujar pila, patio o zona." />
                    <ProductCard title="4. Evidencia" text="Guardar foto, nota y responsable." />
                </div>
            </section>

            <section className="nmk-panel">
                <Drawer title="Preparación GPS actual" text="Abre el panel visual existente del módulo GPS.">
                    <PremiumGpsPreviewPanel />
                </Drawer>
            </section>
        </div>
    );
}

function EquipoView() {
    return (
        <div className="nmk-view-grid">
            <section className="nmk-panel nmk-span-2">
                <div className="nmk-panel-head">
                    <div>
                        <p>Equipo</p>
                        <h2>Recursos operativos</h2>
                    </div>
                    <span>Maquinaria · medición · cuadrillas · RTK</span>
                </div>
                <div className="nmk-card-grid">
                    {equipmentRows.map((row) => (
                        <ProductCard key={row.title} title={row.title} text={row.text} meta={row.status} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function HistorialView() {
    return (
        <div className="nmk-view-grid">
            <section className="nmk-panel nmk-span-2">
                <div className="nmk-panel-head">
                    <div>
                        <p>Historial</p>
                        <h2>Línea del tiempo filtrable</h2>
                    </div>
                    <span>Eventos · prioridad · responsable · tipo</span>
                </div>
                <TimelineBoard />
            </section>

            <section className="nmk-panel nmk-span-2">
                <Drawer title="Timeline real de auditoría" text="Abre el componente de trazabilidad construido anteriormente.">
                    <AuditTimelineStoryPanel />
                </Drawer>
            </section>
        </div>
    );
}

function AnalisisView() {
    return (
        <div className="nmk-view-grid">
            <section className="nmk-panel nmk-span-2">
                <div className="nmk-panel-head">
                    <div>
                        <p>Análisis</p>
                        <h2>Comparación y demanda</h2>
                    </div>
                    <span>Turno actual · riesgo · saturación</span>
                </div>

                <div className="nmk-metric-grid">
                    {demandSignals.map((signal) => (
                        <MetricCard key={signal.label} label={signal.label} value={signal.value} text={signal.text} tone={signal.label === "Riesgo" ? "warn" : "info"} />
                    ))}
                </div>
            </section>

            <section className="nmk-panel">
                <div className="nmk-panel-head">
                    <div>
                        <p>Movimiento</p>
                        <h2>Hoy vs ayer</h2>
                    </div>
                </div>
                <MiniBarChart rows={[
                    { label: "Ayer", value: 14 },
                    { label: "Hoy", value: 18 },
                    { label: "Pendientes", value: 4 },
                    { label: "Validados", value: 11 },
                ]} />
            </section>

            <section className="nmk-panel">
                <div className="nmk-panel-head">
                    <div>
                        <p>Recomendaciones</p>
                        <h2>Decisiones sugeridas</h2>
                    </div>
                </div>
                <div className="nmk-card-stack">
                    <ProductCard title="Priorizar Clinker" text="Tiene estado en revisión y prioridad alta." />
                    <ProductCard title="Usar dron RTK" text="Validar geometría de material antes de mover." />
                    <ProductCard title="Preparar báscula" text="Evita diferencias al cerrar turno." />
                </div>
            </section>
        </div>
    );
}

function EnviosView() {
    return (
        <div className="nmk-view-grid">
            <section className="nmk-panel">
                <div className="nmk-panel-head">
                    <div>
                        <p>Envíos</p>
                        <h2>Trabajo local</h2>
                    </div>
                </div>
                <div className="nmk-metric-grid nmk-metric-grid-compact">
                    <MetricCard label="Campo" value="Local" text="Captura primero." tone="info" />
                    <MetricCard label="Revisión" value="Preview" text="Validar antes de aplicar." tone="warn" />
                    <MetricCard label="Riesgo" value="Controlado" text="Sin cambios ciegos." tone="good" />
                </div>
            </section>

            <section className="nmk-panel nmk-span-2">
                <Drawer title="Panel real de sincronización" text="Abre el flujo construido de edge, exportación y revisión.">
                    <SyncDemoStoryPanel />
                </Drawer>
            </section>
        </div>
    );
}

function InternoView() {
    return (
        <div className="nmk-view-grid">
            <section className="nmk-panel">
                <div className="nmk-panel-head">
                    <div>
                        <p>Interno</p>
                        <h2>Validación técnica</h2>
                    </div>
                    <span>No mostrar como operación diaria</span>
                </div>
                <div className="nmk-card-stack">
                    <ProductCard title="Servicios" text="Validar que la demo responda." />
                    <ProductCard title="Reset" text="Regresar datos a estado controlado." />
                    <ProductCard title="Pruebas" text="Herramientas para desarrollo." />
                </div>
            </section>

            <section className="nmk-panel nmk-span-2">
                <Drawer title="Estado interno" text="Health, runtime y conexión local.">
                    <RuntimeConnectionStatusPanel />
                </Drawer>
                <Drawer title="Reset de demo" text="Solo para pruebas o antes de una presentación.">
                    <DemoDataResetPanel />
                </Drawer>
            </section>
        </div>
    );
}

function renderView(view: ViewId, liveSummary: LiveSummary, goToView: (view: ViewId) => void) {
    if (view === "inicio") return <ExecutiveDashboard liveSummary={liveSummary} goToView={goToView} />;
    if (view === "patio") return <PatioView />;
    if (view === "materiales") return <MaterialesView />;
    if (view === "captura") return <CapturaView />;
    if (view === "equipo") return <EquipoView />;
    if (view === "historial") return <HistorialView />;
    if (view === "analisis") return <AnalisisView />;
    if (view === "envios") return <EnviosView />;

    return <InternoView />;
}

export function NamikiExperienceShell() {
    const [activeView, setActiveView] = useState<ViewId>(() => getInitialView());
    const [menuOpen, setMenuOpen] = useState(false);
    const [liveSummary, setLiveSummary] = useState<LiveSummary>({
        stockpileCount: materialRows.length,
        auditCount: eventRows.length,
        syncStatus: "Modo local preparado",
        apiStatus: "checking",
    });

    const activeViewData = useMemo(
        () => views.find((view) => view.id === activeView) ?? views[0],
        [activeView],
    );

    function goToView(view: ViewId) {
        setActiveView(view);
        setMenuOpen(false);
        window.history.replaceState(null, "", `#/${view}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    useEffect(() => {
        let cancelled = false;
        const apiBase = String(import.meta.env.VITE_IYI_API_BASE_URL || "http://localhost:8788").replace(/\/$/u, "");

        async function loadSummary() {
            try {
                const [stockpiles, audits, syncStatus] = await Promise.allSettled([
                    fetchJsonWithTimeout(`${apiBase}/stockpiles`),
                    fetchJsonWithTimeout(`${apiBase}/audit/mutations`),
                    fetchJsonWithTimeout(`${apiBase}/sync/status`),
                ]);

                if (cancelled) {
                    return;
                }

                setLiveSummary({
                    stockpileCount: stockpiles.status === "fulfilled" ? Math.max(normalizeCount(stockpiles.value), materialRows.length) : materialRows.length,
                    auditCount: audits.status === "fulfilled" ? Math.max(normalizeCount(audits.value), eventRows.length) : eventRows.length,
                    syncStatus: syncStatus.status === "fulfilled" ? "Sincronización consultada" : "Modo local preparado",
                    apiStatus: stockpiles.status === "fulfilled" ? "online" : "offline",
                });
            } catch {
                if (!cancelled) {
                    setLiveSummary((current) => ({
                        ...current,
                        apiStatus: "offline",
                        syncStatus: "Modo local preparado",
                    }));
                }
            }
        }

        void loadSummary();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="namiki-experience-shell" aria-label="Modelo Namiki">
            <header className="nmk-topbar">
                <div className="nmk-brand">
                    <span />
                    <div>
                        <strong>Modelo Namiki</strong>
                        <p>Consola operativa de patio industrial</p>
                    </div>
                </div>

                <div className="nmk-topbar-actions">
                    <span className={`nmk-live nmk-live-${liveSummary.apiStatus}`}>
                        {liveSummary.apiStatus === "online" ? "Conectado" : liveSummary.apiStatus === "checking" ? "Revisando" : "Modo local"}
                    </span>
                    <button onClick={() => setMenuOpen((value) => !value)} type="button">
                        Menú
                    </button>
                </div>
            </header>

            {menuOpen ? (
                <nav className="nmk-menu" aria-label="Secciones">
                    {views.map((view) => (
                        <button
                            className={view.id === activeView ? "is-active" : ""}
                            key={view.id}
                            onClick={() => goToView(view.id)}
                            type="button"
                        >
                            <span>{view.label}</span>
                            <small>{view.description}</small>
                        </button>
                    ))}
                </nav>
            ) : null}

            <section className="nmk-current">
                <div>
                    <p>Sección actual</p>
                    <h2>{activeViewData.label}</h2>
                    <span>{activeViewData.description}</span>
                </div>

                <div className="nmk-view-tabs">
                    {views.slice(0, 8).map((view) => (
                        <button
                            className={view.id === activeView ? "is-active" : ""}
                            key={view.id}
                            onClick={() => goToView(view.id)}
                            type="button"
                        >
                            {view.short}
                        </button>
                    ))}
                </div>
            </section>

            <div className="nmk-surface">
                {renderView(activeView, liveSummary, goToView)}
            </div>
        </section>
    );
}