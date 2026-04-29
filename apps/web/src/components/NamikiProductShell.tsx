import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { AuditTimelineStoryPanel } from "./AuditTimelineStoryPanel.js";
import { DemoDataResetPanel } from "./DemoDataResetPanel.js";
import { OperatorWorkflowProgressPanel } from "./OperatorWorkflowProgressPanel.js";
import { PremiumGpsPreviewPanel } from "./PremiumGpsPreviewPanel.js";
import { RuntimeConnectionStatusPanel } from "./RuntimeConnectionStatusPanel.js";
import { StockpileDemoSummaryPanel } from "./StockpileDemoSummaryPanel.js";
import { SyncDemoStoryPanel } from "./SyncDemoStoryPanel.js";
import { YardOperationsMapPanel } from "./YardOperationsMapPanel.js";

const pages = [
    {
        id: "inicio",
        label: "Inicio",
        title: "Centro operativo del patio",
        subtitle: "Vista principal para patio, materiales, captura, equipo, historial, análisis y envíos.",
        description: "Resumen general.",
    },
    {
        id: "patio",
        label: "Patio",
        title: "Mapa operativo del patio",
        subtitle: "Muelles, patios, vías, básculas, bodega, bandas, equipos y materiales en una vista visual.",
        description: "Mapa visual del universo operativo.",
    },
    {
        id: "materiales",
        label: "Materiales",
        title: "Materiales, pilas y registros",
        subtitle: "Inventario visible por zona, cantidad, estado, prioridad, responsable y última actualización.",
        description: "Materiales y stockpiles.",
    },
    {
        id: "captura",
        label: "Captura",
        title: "Captura en campo",
        subtitle: "GPS, perímetros, evidencia, drones, palos topográficos, notas y mediciones.",
        description: "Herramientas de levantamiento.",
    },
    {
        id: "equipo",
        label: "Equipo",
        title: "Equipo, recursos y maquinaria",
        subtitle: "Máquinas, básculas, drones, sensores, operadores y herramientas de medición.",
        description: "Recursos físicos del patio.",
    },
    {
        id: "historial",
        label: "Historial",
        title: "Línea del tiempo operativa",
        subtitle: "Filtros por material, tipo de evento, responsable, prioridad y periodo.",
        description: "Eventos y trazabilidad.",
    },
    {
        id: "analisis",
        label: "Análisis",
        title: "Comparación, demanda y planeación",
        subtitle: "Comparar periodos, demanda, volumen estimado, capacidad y alertas operativas.",
        description: "Lectura ejecutiva de datos.",
    },
    {
        id: "envios",
        label: "Envíos",
        title: "Trabajo local y sincronización",
        subtitle: "Captura local, revisión, paquete de envío y sincronización controlada.",
        description: "Campo a oficina.",
    },
    {
        id: "interno",
        label: "Interno",
        title: "Modo interno técnico",
        subtitle: "Solo para validar servicios, pruebas y reset. No es para operación diaria.",
        description: "Área técnica escondida.",
    },
] as const;

type ProductPageId = (typeof pages)[number]["id"];

const materialCards = [
    {
        name: "Pet coke",
        zone: "Patio A",
        status: "Operativo",
        amount: "12,400 t",
        priority: "Normal",
        owner: "Supervisor patio",
        updatedAt: "08:20",
        confidence: "Alta",
    },
    {
        name: "Clinker",
        zone: "Patio B",
        status: "Revisión",
        amount: "8,600 t",
        priority: "Alta",
        owner: "Calidad",
        updatedAt: "09:05",
        confidence: "Media",
    },
    {
        name: "Chatarra HMS",
        zone: "Zona acero",
        status: "Operativo",
        amount: "3,200 t",
        priority: "Normal",
        owner: "Operación",
        updatedAt: "09:45",
        confidence: "Alta",
    },
    {
        name: "Fluorita MT",
        zone: "Patio C",
        status: "Validado",
        amount: "5,400 t",
        priority: "Baja",
        owner: "Supervisor turno",
        updatedAt: "10:10",
        confidence: "Alta",
    },
    {
        name: "Mineral mixto",
        zone: "Zona revisión",
        status: "Pendiente",
        amount: "2,100 t",
        priority: "Media",
        owner: "Laboratorio",
        updatedAt: "10:30",
        confidence: "Pendiente",
    },
] as const;

const yardAreas = [
    { title: "Muelle 1", text: "Entrada principal de material por embarcación." },
    { title: "Muelle 2", text: "Descarga alterna y apoyo operativo." },
    { title: "Vía férrea", text: "Referencia logística para acceso y movimiento." },
    { title: "Sistema de bandas", text: "Ruta simulada de transferencia interna." },
    { title: "Patio A", text: "Almacenamiento principal de granel." },
    { title: "Patio B", text: "Zona para material en revisión." },
    { title: "Básculas", text: "Control de peso, entrada y salida." },
    { title: "Bodega", text: "Carga general, resguardo o zona auxiliar." },
] as const;

const captureTools = [
    { title: "GPS del celular", text: "Ubicar operador, material o evidencia en el patio." },
    { title: "Dibujo de perímetros", text: "Marcar pilas, zonas de descarga o áreas restringidas." },
    { title: "Fotos de evidencia", text: "Guardar estado físico del material." },
    { title: "Palos topográficos", text: "Apoyar mediciones físicas de volumen y forma." },
    { title: "Drones", text: "Vista superior para validar pilas, rutas y áreas." },
    { title: "Notas de campo", text: "Observaciones rápidas del operador o supervisor." },
] as const;

const equipmentCards = [
    { title: "Payloader", text: "Movimiento y acomodo de material." },
    { title: "Grúas", text: "Descarga y maniobras pesadas." },
    { title: "Básculas", text: "Peso de entrada, salida y validación." },
    { title: "Drones", text: "Inspección visual y ortomosaico futuro." },
    { title: "Palos topográficos", text: "Medición física de referencia." },
    { title: "Cuadrillas", text: "Operadores, supervisores y apoyo de patio." },
    { title: "Sensores futuros", text: "Base para integración IoT posterior." },
    { title: "Camiones internos", text: "Traslado y movimiento dentro del patio." },
] as const;

const workflowCards = [
    { title: "1. Descargar", text: "El material entra por muelle, camión o traslado interno." },
    { title: "2. Registrar", text: "Se captura tipo, zona, cantidad, responsable y evidencia." },
    { title: "3. Medir", text: "Se valida volumen con GPS, medición física, dron o referencia topográfica." },
    { title: "4. Revisar", text: "Supervisor aprueba, observa o marca pendiente." },
    { title: "5. Mover", text: "Se actualiza ubicación, zona o estado cuando cambia." },
    { title: "6. Consultar", text: "El historial queda listo para revisión y reporte." },
] as const;

const timelineFilters = [
    { id: "todos", label: "Todos" },
    { id: "material", label: "Material" },
    { id: "medicion", label: "Medición" },
    { id: "equipo", label: "Equipo" },
    { id: "alerta", label: "Alertas" },
    { id: "envio", label: "Envíos" },
] as const;

type TimelineFilterId = (typeof timelineFilters)[number]["id"];

const timelineEvents = [
    {
        type: "material",
        time: "08:20",
        title: "Descarga vinculada a Sharon",
        text: "Pet coke registrado en Patio A con cantidad inicial.",
        owner: "Operador patio",
        priority: "Normal",
    },
    {
        type: "material",
        time: "09:05",
        title: "Nueva pila operativa registrada",
        text: "Clinker creado como stockpile en zona de revisión.",
        owner: "Supervisor turno A",
        priority: "Alta",
    },
    {
        type: "medicion",
        time: "09:45",
        title: "Medición georreferenciada agregada",
        text: "Fluorita MT marcada para revisión con referencia espacial.",
        owner: "Captura móvil",
        priority: "Normal",
    },
    {
        type: "alerta",
        time: "10:10",
        title: "Validación requerida",
        text: "Clinker requiere revisión por diferencia de geometría estimada.",
        owner: "Regla operativa",
        priority: "Alta",
    },
    {
        type: "equipo",
        time: "10:25",
        title: "Payloader asignado",
        text: "Equipo móvil disponible para movimiento de material.",
        owner: "Patio",
        priority: "Media",
    },
    {
        type: "envio",
        time: "10:40",
        title: "Paquete preparado para envío",
        text: "Cambios listos para revisión antes de sincronizar.",
        owner: "Sistema local",
        priority: "Normal",
    },
] as const;

const comparisonCards = [
    { label: "Hoy", value: "18 movimientos", text: "Eventos registrados en turno actual." },
    { label: "Ayer", value: "14 movimientos", text: "Menor actividad contra hoy." },
    { label: "Variación", value: "+28%", text: "Mayor demanda de patio." },
    { label: "Pendientes", value: "4 eventos", text: "Requieren revisión o evidencia." },
] as const;

const demandCards = [
    { title: "Alta saturación", text: "Si llegan mineral y acero juntos, aumenta congestión de patio." },
    { title: "Priorizar Clinker", text: "Por estado en revisión y ubicación cerca de maniobra." },
    { title: "Preparar báscula", text: "Validar peso antes de mover material sensible." },
    { title: "Dron recomendado", text: "Usar vista superior para comparar forma y volumen." },
] as const;

function isProductPageId(value: unknown): value is ProductPageId {
    return typeof value === "string" && pages.some((page) => page.id === value);
}

function getInitialPage(): ProductPageId {
    const hash = window.location.hash.replace("#/", "").replace("#", "");

    if (isProductPageId(hash)) {
        return hash;
    }

    return "inicio";
}

function PageHeader({
    eyebrow,
    title,
    subtitle,
}: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
}) {
    return (
        <div className="namiki-page-header">
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{subtitle}</span>
        </div>
    );
}

function ProductCard({
    title,
    text,
}: {
    readonly title: string;
    readonly text: string;
}) {
    return (
        <article className="namiki-product-card">
            <h3>{title}</h3>
            <p>{text}</p>
        </article>
    );
}

function StatCard({
    label,
    value,
    text,
}: {
    readonly label: string;
    readonly value: string;
    readonly text: string;
}) {
    return (
        <article className="namiki-stat-card">
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{text}</span>
        </article>
    );
}

function ProductDrawer({
    title,
    description,
    children,
}: {
    readonly title: string;
    readonly description: string;
    readonly children: ReactNode;
}) {
    return (
        <details className="namiki-product-drawer">
            <summary>
                <div>
                    <strong>{title}</strong>
                    <span>{description}</span>
                </div>
                <em>Abrir</em>
            </summary>

            <div className="namiki-drawer-content">{children}</div>
        </details>
    );
}

function OperationalYardMap() {
    return (
        <div className="namiki-operational-map">
            <div className="namiki-water-zone">Muelle / frente de agua</div>
            <div className="namiki-rail-line" />
            <div className="namiki-conveyor-line">Sistema de bandas</div>

            <div className="namiki-yard-label namiki-label-arthur">Arthur</div>
            <div className="namiki-yard-label namiki-label-sharon">Sharon</div>
            <div className="namiki-yard-label namiki-label-mr2">MR2</div>

            <div className="namiki-yard-dock namiki-dock-one">Muelle 1</div>
            <div className="namiki-yard-dock namiki-dock-two">Muelle 2</div>

            <div className="namiki-stockpile namiki-stockpile-petcoke">Pet coke</div>
            <div className="namiki-stockpile namiki-stockpile-clinker">Clinker</div>
            <div className="namiki-stockpile namiki-stockpile-hms">Chatarra HMS</div>
            <div className="namiki-stockpile namiki-stockpile-fluorita">Fluorita MT</div>

            <div className="namiki-yard-equipment namiki-equipment-bodega">Bodega</div>
            <div className="namiki-yard-equipment namiki-equipment-bascula">Básculas</div>
            <div className="namiki-yard-equipment namiki-equipment-telestacker">Telestacker</div>

            <div className="namiki-map-legend">
                <span>Material</span>
                <span>Equipo</span>
                <span>Ruta</span>
                <span>Zona</span>
            </div>
        </div>
    );
}

function MaterialBoard() {
    return (
        <div className="namiki-material-grid">
            {materialCards.map((material) => (
                <article className="namiki-material-card" key={material.name}>
                    <div>
                        <h3>{material.name}</h3>
                        <p>{material.zone}</p>
                    </div>
                    <strong>{material.amount}</strong>
                    <span>{material.status}</span>
                    <p>Prioridad: {material.priority}</p>
                    <p>Responsable: {material.owner}</p>
                    <p>Actualizado: {material.updatedAt}</p>
                    <p>Confianza: {material.confidence}</p>
                </article>
            ))}
        </div>
    );
}

function TimelineBoard() {
    const [activeFilter, setActiveFilter] = useState<TimelineFilterId>("todos");

    const visibleEvents = useMemo(
        () =>
            activeFilter === "todos"
                ? timelineEvents
                : timelineEvents.filter((event) => event.type === activeFilter),
        [activeFilter],
    );

    return (
        <div className="namiki-timeline-board">
            <div className="namiki-filter-row">
                {timelineFilters.map((filter) => (
                    <button
                        className={filter.id === activeFilter ? "is-active" : ""}
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        type="button"
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <div className="namiki-timeline-grid">
                {visibleEvents.map((event) => (
                    <article className="namiki-timeline-card" key={`${event.time}-${event.title}`}>
                        <div className="namiki-timeline-time">{event.time}</div>
                        <div>
                            <h3>{event.title}</h3>
                            <p>{event.text}</p>
                            <div className="namiki-chip-row">
                                <span>{event.owner}</span>
                                <span>{event.priority}</span>
                                <span>{event.type}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

function InicioPage({
    goToPage,
}: {
    readonly goToPage: (pageId: ProductPageId) => void;
}) {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel namiki-span-2">
                <PageHeader
                    eyebrow="Modelo Namiki"
                    title="Sistema visual para operar el patio."
                    subtitle="Patio, materiales, equipo, captura, historial, análisis y envíos en un solo producto operativo."
                />

                <div className="namiki-action-row">
                    <button onClick={() => goToPage("patio")} type="button">Mapa del patio</button>
                    <button onClick={() => goToPage("materiales")} type="button">Materiales</button>
                    <button onClick={() => goToPage("captura")} type="button">Captura GPS</button>
                    <button onClick={() => goToPage("analisis")} type="button">Análisis</button>
                </div>
            </section>

            <section className="namiki-wide-panel">
                <div className="namiki-stat-grid">
                    <StatCard label="Materiales" value="7" text="Pilas visibles para demo." />
                    <StatCard label="Zonas" value="5" text="Áreas base del patio." />
                    <StatCard label="Herramientas" value="GPS + dron" text="Preparado para campo." />
                    <StatCard label="Historial" value="Activo" text="Eventos filtrables." />
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Capacidades del sistema</h2>
                <div className="namiki-card-stack">
                    <ProductCard title="Mapa operativo" text="Muelles, vías, patios, básculas, bodega, bandas y materiales." />
                    <ProductCard title="Materiales y pilas" text="Cantidad, zona, estado, prioridad y responsable." />
                    <ProductCard title="Captura en campo" text="GPS, evidencia, drones, perímetros y medición." />
                    <ProductCard title="Historial y análisis" text="Filtros, línea del tiempo, comparación y demanda." />
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Flujo de trabajo</h2>
                <div className="namiki-card-stack">
                    {workflowCards.slice(0, 4).map((card) => (
                        <ProductCard key={card.title} title={card.title} text={card.text} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function PatioPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel namiki-span-2">
                <PageHeader
                    eyebrow="Patio"
                    title="Mapa operativo construido."
                    subtitle="Vista conceptual completa del patio: muelles, vías, bandas, equipos, materiales y zonas de operación."
                />

                <OperationalYardMap />
            </section>

            <section className="namiki-side-panel">
                <h2>Áreas configurables</h2>
                <div className="namiki-card-stack">
                    {yardAreas.map((area) => (
                        <ProductCard key={area.title} title={area.title} text={area.text} />
                    ))}
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Objetos dentro del patio</h2>
                <div className="namiki-card-stack">
                    <ProductCard title="Materiales" text="Pilas de granel, acero, mineral o carga general." />
                    <ProductCard title="Equipos" text="Payloader, báscula, grúa, banda, dron o sensor." />
                    <ProductCard title="Rutas" text="Movimiento desde muelle hacia zona de patio." />
                    <ProductCard title="Puntos de evidencia" text="Fotos, notas, mediciones o incidencias." />
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer title="Mapa anterior del proyecto" description="Se conserva como referencia técnica, pero la vista principal ahora es el mapa visual construido arriba.">
                    <YardOperationsMapPanel />
                </ProductDrawer>
            </section>
        </div>
    );
}

function MaterialesPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel namiki-span-2">
                <PageHeader
                    eyebrow="Materiales"
                    title="Materiales, pilas y registros."
                    subtitle="Inventario visible por zona, cantidad, estado, prioridad, responsable, actualización y confianza."
                />

                <MaterialBoard />
            </section>

            <section className="namiki-side-panel">
                <h2>Flujo operativo</h2>
                <div className="namiki-card-stack">
                    {workflowCards.map((card) => (
                        <ProductCard key={card.title} title={card.title} text={card.text} />
                    ))}
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer title="Resumen real de stockpiles" description="Abre el panel construido para materiales, estados y resumen operativo.">
                    <StockpileDemoSummaryPanel />
                </ProductDrawer>

                <ProductDrawer title="Avance operativo guiado" description="Abre el flujo ya construido para operador y supervisor.">
                    <OperatorWorkflowProgressPanel />
                </ProductDrawer>
            </section>
        </div>
    );
}

function CapturaPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel">
                <PageHeader
                    eyebrow="Captura"
                    title="Herramientas de campo."
                    subtitle="El sistema debe capturar ubicación, evidencia, medición, notas y perímetros desde celular o laptop."
                />

                <div className="namiki-card-grid">
                    {captureTools.map((tool) => (
                        <ProductCard key={tool.title} title={tool.title} text={tool.text} />
                    ))}
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Orden de captura</h2>
                <div className="namiki-card-stack">
                    <ProductCard title="1. Pedir ubicación" text="Obtener posición del dispositivo." />
                    <ProductCard title="2. Marcar punto" text="Registrar ubicación de material o evidencia." />
                    <ProductCard title="3. Dibujar perímetro" text="Delimitar pila, zona o patio completo." />
                    <ProductCard title="4. Guardar evidencia" text="Fotos, notas y mediciones quedan asociadas." />
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer title="Panel de preparación GPS" description="Abre la vista del siguiente módulo GPS y perímetros.">
                    <PremiumGpsPreviewPanel />
                </ProductDrawer>
            </section>
        </div>
    );
}

function EquipoPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel namiki-span-2">
                <PageHeader
                    eyebrow="Equipo"
                    title="Equipo, recursos y herramientas."
                    subtitle="El patio no solo tiene materiales; también participan máquinas, medición, cuadrillas y herramientas de captura."
                />

                <div className="namiki-card-grid">
                    {equipmentCards.map((equipment) => (
                        <ProductCard key={equipment.title} title={equipment.title} text={equipment.text} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function HistorialPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel namiki-span-2">
                <PageHeader
                    eyebrow="Historial"
                    title="Línea del tiempo con filtros."
                    subtitle="Filtra eventos por material, medición, equipo, alerta o envío para revisar la operación sin leer registros técnicos."
                />

                <TimelineBoard />
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer title="Timeline real de auditoría" description="Abre el componente construido para auditoría y trazabilidad.">
                    <AuditTimelineStoryPanel />
                </ProductDrawer>
            </section>
        </div>
    );
}

function AnalisisPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel namiki-span-2">
                <PageHeader
                    eyebrow="Análisis"
                    title="Comparación, demanda y planeación."
                    subtitle="Vista para comparar periodos, detectar saturación, priorizar revisión y anticipar demanda de patio."
                />

                <div className="namiki-stat-grid">
                    {comparisonCards.map((card) => (
                        <StatCard key={card.label} label={card.label} value={card.value} text={card.text} />
                    ))}
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Demanda y alertas</h2>
                <div className="namiki-card-stack">
                    {demandCards.map((card) => (
                        <ProductCard key={card.title} title={card.title} text={card.text} />
                    ))}
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Filtros planeados</h2>
                <div className="namiki-card-stack">
                    <ProductCard title="Por tiempo" text="Hoy, ayer, semana, mes o rango personalizado." />
                    <ProductCard title="Por material" text="Pet coke, clinker, chatarra, mineral o carga general." />
                    <ProductCard title="Por zona" text="Muelle, Patio A, Patio B, báscula o bodega." />
                    <ProductCard title="Por prioridad" text="Alta, media, baja, pendiente o validado." />
                </div>
            </section>
        </div>
    );
}

function EnviosPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel">
                <PageHeader
                    eyebrow="Envíos"
                    title="Trabajo local y envío controlado."
                    subtitle="Captura primero en campo. Revisa después. Envía cuando esté listo."
                />

                <div className="namiki-stat-grid">
                    <StatCard label="Campo" value="Local" text="Captura aunque no haya internet estable." />
                    <StatCard label="Revisión" value="Preview" text="Se revisa antes de aplicar cambios." />
                    <StatCard label="Riesgo" value="Controlado" text="Evita cambios ciegos o duplicados." />
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer title="Panel real de sincronización" description="Abre el flujo existente de exportación, revisión y envío.">
                    <SyncDemoStoryPanel />
                </ProductDrawer>
            </section>
        </div>
    );
}

function InternoPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel">
                <PageHeader
                    eyebrow="Interno"
                    title="Modo técnico escondido."
                    subtitle="Esta sección no se presenta como operación. Sirve para validar servicios, reset y pruebas."
                />

                <div className="namiki-card-stack">
                    <ProductCard title="Estado de servicios" text="Verifica que el sistema local esté activo." />
                    <ProductCard title="Reset de demo" text="Regresa datos de prueba a estado limpio." />
                    <ProductCard title="Pruebas internas" text="Apoyo para desarrollo y validación." />
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer title="Estado interno del sistema" description="Solo para pruebas internas.">
                    <RuntimeConnectionStatusPanel />
                </ProductDrawer>

                <ProductDrawer title="Reset interno de demo" description="Solo usar antes de una demostración controlada.">
                    <DemoDataResetPanel />
                </ProductDrawer>
            </section>
        </div>
    );
}

function renderPage(pageId: ProductPageId, goToPage: (pageId: ProductPageId) => void) {
    if (pageId === "inicio") {
        return <InicioPage goToPage={goToPage} />;
    }

    if (pageId === "patio") {
        return <PatioPage />;
    }

    if (pageId === "materiales") {
        return <MaterialesPage />;
    }

    if (pageId === "captura") {
        return <CapturaPage />;
    }

    if (pageId === "equipo") {
        return <EquipoPage />;
    }

    if (pageId === "historial") {
        return <HistorialPage />;
    }

    if (pageId === "analisis") {
        return <AnalisisPage />;
    }

    if (pageId === "envios") {
        return <EnviosPage />;
    }

    return <InternoPage />;
}

export function NamikiProductShell() {
    const [activePage, setActivePage] = useState<ProductPageId>(() => getInitialPage());
    const [menuOpen, setMenuOpen] = useState(false);
    const activePageData = useMemo(
        () => pages.find((page) => page.id === activePage) ?? pages[0],
        [activePage],
    );

    function goToPage(pageId: ProductPageId) {
        setActivePage(pageId);
        setMenuOpen(false);
        window.history.replaceState(null, "", `#/${pageId}`);
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    return (
        <section className="namiki-product-shell" aria-label="Modelo Namiki">
            <header className="namiki-topbar">
                <div className="namiki-brand">
                    <span />
                    <div>
                        <strong>Modelo Namiki</strong>
                        <p>Control de patio industrial</p>
                    </div>
                </div>

                <button
                    aria-expanded={menuOpen}
                    className="namiki-menu-button"
                    onClick={() => setMenuOpen((value) => !value)}
                    type="button"
                >
                    Menú
                </button>
            </header>

            {menuOpen ? (
                <nav className="namiki-menu" aria-label="Secciones">
                    {pages.map((page) => (
                        <button
                            className={page.id === activePage ? "is-active" : ""}
                            key={page.id}
                            onClick={() => goToPage(page.id)}
                            type="button"
                        >
                            <span>{page.label}</span>
                            <small>{page.description}</small>
                        </button>
                    ))}
                </nav>
            ) : null}

            <section className="namiki-current-page">
                <p>Sección actual</p>
                <h2>{activePageData.title}</h2>
                <span>{activePageData.subtitle}</span>
            </section>

            <div className="namiki-page-surface">
                {renderPage(activePage, goToPage)}
            </div>
        </section>
    );
}