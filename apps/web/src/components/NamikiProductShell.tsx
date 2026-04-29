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
        title: "Control operativo del patio",
        subtitle: "Materiales, zonas, equipos, evidencias y movimientos en una interfaz oscura y ordenada.",
        description: "Vista general para presentar el sistema.",
    },
    {
        id: "patio",
        label: "Patio",
        title: "Universo del patio industrial",
        subtitle: "Define áreas, rutas, zonas de descarga, básculas, bodegas y espacios de almacenamiento.",
        description: "Mapa conceptual y áreas de trabajo.",
    },
    {
        id: "materiales",
        label: "Materiales",
        title: "Materiales y pilas",
        subtitle: "Consulta material, zona, estado, cantidad, prioridad y responsable.",
        description: "Inventario operativo del patio.",
    },
    {
        id: "captura",
        label: "Captura",
        title: "Captura en campo",
        subtitle: "GPS, evidencia fotográfica, medición, drones, palos topográficos y observaciones.",
        description: "Herramientas para levantar información.",
    },
    {
        id: "equipo",
        label: "Equipo",
        title: "Equipo y recursos",
        subtitle: "Maquinaria, básculas, drones, cuadrillas, sensores y herramientas de medición.",
        description: "Recursos físicos de operación.",
    },
    {
        id: "historial",
        label: "Historial",
        title: "Historial operativo",
        subtitle: "Cambios, validaciones, movimientos, evidencias y responsables.",
        description: "Trazabilidad entendible.",
    },
    {
        id: "envios",
        label: "Envíos",
        title: "Envíos y trabajo sin internet",
        subtitle: "Captura local, revisión y envío controlado cuando haya conexión.",
        description: "Flujo campo → oficina.",
    },
    {
        id: "interno",
        label: "Modo interno",
        title: "Validación interna del sistema",
        subtitle: "Herramientas técnicas escondidas para no confundir a operadores ni supervisores.",
        description: "Solo para desarrollo y pruebas.",
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
    },
    {
        name: "Clinker",
        zone: "Patio B",
        status: "Revisión",
        amount: "8,600 t",
        priority: "Alta",
        owner: "Calidad",
    },
    {
        name: "Chatarra HMS",
        zone: "Zona acero",
        status: "Operativo",
        amount: "3,200 t",
        priority: "Normal",
        owner: "Operación",
    },
    {
        name: "Fluorita MT",
        zone: "Patio C",
        status: "Validado",
        amount: "5,400 t",
        priority: "Baja",
        owner: "Supervisor turno",
    },
] as const;

const yardAreas = [
    {
        title: "Muelle 1",
        text: "Entrada de material desde embarcación.",
    },
    {
        title: "Muelle 2",
        text: "Descarga alterna y apoyo operativo.",
    },
    {
        title: "Patio A",
        text: "Almacenamiento principal de granel.",
    },
    {
        title: "Patio B",
        text: "Zona para material en revisión.",
    },
    {
        title: "Básculas",
        text: "Control de peso y validación.",
    },
    {
        title: "Bodega",
        text: "Resguardo y carga general.",
    },
] as const;

const captureTools = [
    {
        title: "GPS del celular",
        text: "Ubicar al operador y registrar puntos del patio.",
    },
    {
        title: "Dibujo de perímetros",
        text: "Marcar áreas de descarga, almacenamiento o restricción.",
    },
    {
        title: "Fotos de evidencia",
        text: "Guardar imágenes del estado del material.",
    },
    {
        title: "Palos topográficos",
        text: "Apoyar mediciones físicas de volumen y forma.",
    },
    {
        title: "Drones",
        text: "Capturar vista superior para validar pilas y áreas.",
    },
    {
        title: "Notas de campo",
        text: "Agregar observaciones rápidas del operador.",
    },
] as const;

const equipmentCards = [
    {
        title: "Payloader",
        text: "Movimiento y acomodo de material.",
    },
    {
        title: "Grúas",
        text: "Apoyo en descarga y maniobras.",
    },
    {
        title: "Básculas",
        text: "Peso de entrada, salida y validación.",
    },
    {
        title: "Drones",
        text: "Inspección visual y ortomosaico futuro.",
    },
    {
        title: "Palos topográficos",
        text: "Medición física de referencia.",
    },
    {
        title: "Cuadrillas",
        text: "Operadores, supervisores y apoyo de patio.",
    },
] as const;

const workflowCards = [
    {
        title: "1. Descargar",
        text: "El material entra por muelle o transporte interno.",
    },
    {
        title: "2. Registrar",
        text: "Se captura tipo, zona, cantidad y evidencia.",
    },
    {
        title: "3. Medir",
        text: "Se valida volumen con GPS, medición física o dron.",
    },
    {
        title: "4. Revisar",
        text: "Supervisor aprueba o marca pendiente.",
    },
    {
        title: "5. Mover",
        text: "Se actualiza ubicación o estado si cambia.",
    },
    {
        title: "6. Cerrar",
        text: "El historial queda listo para consulta.",
    },
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
                    title="Sistema operativo visual para patio industrial."
                    subtitle="No es solo una pantalla bonita: organiza materiales, zonas, equipos, evidencias, historial, envíos y preparación GPS."
                />

                <div className="namiki-action-row">
                    <button onClick={() => goToPage("patio")} type="button">Ver patio</button>
                    <button onClick={() => goToPage("materiales")} type="button">Ver materiales</button>
                    <button onClick={() => goToPage("captura")} type="button">Captura en campo</button>
                    <button onClick={() => goToPage("historial")} type="button">Historial</button>
                </div>
            </section>

            <section className="namiki-wide-panel">
                <div className="namiki-stat-grid">
                    <StatCard label="Materiales" value="7" text="Pilas visibles para demo." />
                    <StatCard label="Zonas" value="5" text="Áreas base del patio." />
                    <StatCard label="Herramientas" value="GPS + drones" text="Preparado para campo." />
                    <StatCard label="Historial" value="Activo" text="Cambios y evidencia." />
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Capacidades visibles</h2>
                <div className="namiki-card-stack">
                    <ProductCard title="Materiales y pilas" text="Inventario visual por zona, estado y prioridad." />
                    <ProductCard title="Mapa del patio" text="Universo del patio, áreas internas y objetos." />
                    <ProductCard title="Captura GPS" text="Ubicación real y perímetros desde celular." />
                    <ProductCard title="Evidencia" text="Fotos, notas y mediciones asociadas al material." />
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
            <section className="namiki-hero-panel">
                <PageHeader
                    eyebrow="Patio"
                    title="Universo físico del patio."
                    subtitle="Aquí se explica el terreno operativo: muelles, patios, básculas, bodegas, rutas y zonas de material."
                />

                <div className="namiki-map-preview">
                    <div className="namiki-map-zone namiki-map-zone-a">Muelle 1</div>
                    <div className="namiki-map-zone namiki-map-zone-b">Patio A</div>
                    <div className="namiki-map-zone namiki-map-zone-c">Báscula</div>
                    <div className="namiki-map-zone namiki-map-zone-d">Bodega</div>
                    <div className="namiki-map-pin">GPS</div>
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Áreas configurables</h2>
                <div className="namiki-card-stack">
                    {yardAreas.map((area) => (
                        <ProductCard key={area.title} title={area.title} text={area.text} />
                    ))}
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer title="Mapa operativo construido" description="Conserva la vista de patio que ya existía en el proyecto.">
                    <YardOperationsMapPanel />
                </ProductDrawer>
            </section>
        </div>
    );
}

function MaterialesPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel">
                <PageHeader
                    eyebrow="Materiales"
                    title="Materiales y pilas visibles."
                    subtitle="La operación puede ver qué hay en patio, dónde está, cuánto hay y qué requiere atención."
                />

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
                        </article>
                    ))}
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Operación del material</h2>
                <div className="namiki-card-stack">
                    {workflowCards.map((card) => (
                        <ProductCard key={card.title} title={card.title} text={card.text} />
                    ))}
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer title="Resumen real de materiales" description="Abre el panel construido para stockpiles y estado operativo.">
                    <StockpileDemoSummaryPanel />
                </ProductDrawer>

                <ProductDrawer title="Avance operativo" description="Abre el flujo guiado construido para operador y supervisor.">
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
                    eyebrow="Captura en campo"
                    title="Levantamiento físico-digital."
                    subtitle="Todo lo que el operador o supervisor puede capturar desde celular, laptop o herramientas de medición."
                />

                <div className="namiki-card-grid">
                    {captureTools.map((tool) => (
                        <ProductCard key={tool.title} title={tool.title} text={tool.text} />
                    ))}
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Orden recomendado</h2>
                <div className="namiki-card-stack">
                    <ProductCard title="1. Pedir ubicación" text="El dispositivo obtiene posición aproximada." />
                    <ProductCard title="2. Marcar punto" text="Se registra dónde está el material o evidencia." />
                    <ProductCard title="3. Dibujar área" text="Se delimita perímetro de pila, zona o patio." />
                    <ProductCard title="4. Guardar evidencia" text="Fotos, notas y medición quedan relacionadas." />
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer title="Preparación de GPS y perímetros" description="Abre el panel visual del siguiente módulo GPS.">
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
                    title="Recursos que participan en el patio."
                    subtitle="El sistema no solo registra materiales; también debe entender equipo, herramientas y responsables."
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
            <section className="namiki-hero-panel">
                <PageHeader
                    eyebrow="Historial"
                    title="Cambios importantes y evidencia."
                    subtitle="Supervisión ve eventos claros sin leer mensajes técnicos."
                />

                <div className="namiki-card-stack">
                    <ProductCard title="Descarga registrada" text="Material entró al patio y quedó asociado a una zona." />
                    <ProductCard title="Estado actualizado" text="Una pila cambió a revisión, operativo o validado." />
                    <ProductCard title="Evidencia agregada" text="Foto, nota o medición se relaciona con el material." />
                    <ProductCard title="Supervisor validó" text="Queda registro del responsable de la revisión." />
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer title="Timeline real de auditoría" description="Abre el panel de historial que ya estaba construido.">
                    <AuditTimelineStoryPanel />
                </ProductDrawer>
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
                    title="Trabajo local y sincronización."
                    subtitle="Captura en campo primero; envío controlado después. Útil cuando la conexión no es perfecta."
                />

                <div className="namiki-stat-grid">
                    <StatCard label="Campo" value="Local" text="Captura aunque no haya internet estable." />
                    <StatCard label="Revisión" value="Preview" text="Se revisa antes de aplicar cambios." />
                    <StatCard label="Riesgo" value="Controlado" text="Evita cambios ciegos o duplicados." />
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer title="Panel real de envíos" description="Abre el flujo de sincronización construido para edge y cloud.">
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
                    eyebrow="Modo interno"
                    title="Herramientas técnicas ocultas."
                    subtitle="Esto no es para operador final. Solo sirve para validar que la demo y los servicios respondan."
                />

                <div className="namiki-card-stack">
                    <ProductCard title="Estado de servicios" text="Verifica que el sistema local esté activo." />
                    <ProductCard title="Reset de demo" text="Regresa datos de prueba a un estado limpio." />
                    <ProductCard title="Validación interna" text="Apoyo para desarrollo y pruebas." />
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