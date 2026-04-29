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
        title: "Patio industrial bajo control",
        subtitle: "Una vista clara para materiales, zonas, historial, sincronización y GPS.",
        description: "Resumen ejecutivo del sistema.",
    },
    {
        id: "materiales",
        label: "Materiales",
        title: "Materiales, pilas y estados",
        subtitle: "Consulta qué hay en el patio, dónde está y qué necesita revisión.",
        description: "Inventario operativo y flujo de trabajo.",
    },
    {
        id: "mapa",
        label: "Mapa y GPS",
        title: "Mapa, zonas y perímetros",
        subtitle: "Define el patio, sus áreas internas y prepara captura GPS real.",
        description: "Vista espacial del patio industrial.",
    },
    {
        id: "historial",
        label: "Historial",
        title: "Historial de cambios",
        subtitle: "Registro entendible para supervisores: qué cambió, cuándo y sobre qué material.",
        description: "Trazabilidad operativa.",
    },
    {
        id: "envios",
        label: "Envíos",
        title: "Envío y sincronización",
        subtitle: "Captura en campo primero; sincroniza después cuando el sistema esté listo.",
        description: "Trabajo local y envío controlado.",
    },
    {
        id: "sistema",
        label: "Sistema",
        title: "Estado del sistema",
        subtitle: "Área técnica separada para revisar API, Edge, reset y pruebas internas.",
        description: "Panel técnico para desarrollo.",
    },
] as const;

type ProductPageId = (typeof pages)[number]["id"];

const materialCards = [
    {
        name: "Pet coke",
        zone: "Patio A",
        status: "Operativo",
        amount: "12,400 t",
        note: "Material visible y listo para operación.",
    },
    {
        name: "Clinker",
        zone: "Patio B",
        status: "Revisión",
        amount: "8,600 t",
        note: "Requiere validación de supervisor.",
    },
    {
        name: "Chatarra HMS",
        zone: "Zona acero",
        status: "Operativo",
        amount: "3,200 t",
        note: "Material registrado dentro del patio.",
    },
] as const;

const valueCards = [
    {
        title: "Ubicación del material",
        text: "Saber dónde está cada pila sin buscar en notas, fotos o mensajes.",
    },
    {
        title: "Estado operativo",
        text: "Ver si el material está operativo, pendiente o en revisión.",
    },
    {
        title: "Historial consultable",
        text: "Tener evidencia de cambios sin depender de memoria o llamadas.",
    },
    {
        title: "Base para GPS",
        text: "Preparar el salto a ubicación real, áreas y perímetros desde celular.",
    },
] as const;

const operationSteps = [
    {
        title: "1. Llega material",
        text: "El material entra por muelle o transporte interno.",
    },
    {
        title: "2. Se registra",
        text: "Se guarda tipo, zona, cantidad y estado.",
    },
    {
        title: "3. Se revisa",
        text: "Supervisor valida cambios importantes.",
    },
    {
        title: "4. Queda historial",
        text: "La operación deja rastro consultable.",
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
            <section className="namiki-hero-panel">
                <PageHeader
                    eyebrow="Modelo Namiki"
                    title="Control visual para patios industriales."
                    subtitle="Una interfaz sobria para ver materiales, consultar zonas, revisar historial y preparar GPS real."
                />

                <div className="namiki-action-row">
                    <button onClick={() => goToPage("materiales")} type="button">Materiales</button>
                    <button onClick={() => goToPage("mapa")} type="button">Mapa y GPS</button>
                    <button onClick={() => goToPage("historial")} type="button">Historial</button>
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Qué resuelve</h2>
                <div className="namiki-card-stack">
                    {valueCards.map((card) => (
                        <ProductCard key={card.title} title={card.title} text={card.text} />
                    ))}
                </div>
            </section>

            <section className="namiki-wide-panel">
                <div className="namiki-stat-grid">
                    <StatCard label="Materiales visibles" value="7" text="Pilas y materiales de ejemplo." />
                    <StatCard label="Zonas iniciales" value="5" text="Áreas listas para configurar." />
                    <StatCard label="Siguiente módulo" value="GPS" text="Ubicación y perímetros reales." />
                </div>
            </section>
        </div>
    );
}

function MaterialesPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel">
                <PageHeader
                    eyebrow="Operación"
                    title="Materiales visibles."
                    subtitle="La operación puede ver qué hay en patio, dónde está y qué requiere atención."
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
                            <p>{material.note}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Flujo operativo</h2>
                <div className="namiki-card-stack">
                    {operationSteps.map((step) => (
                        <ProductCard key={step.title} title={step.title} text={step.text} />
                    ))}
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer
                    title="Panel real de materiales"
                    description="Muestra el resumen conectado al flujo técnico existente."
                >
                    <StockpileDemoSummaryPanel />
                </ProductDrawer>

                <ProductDrawer
                    title="Panel de avance operativo"
                    description="Muestra el flujo guiado que ya existe en la arquitectura."
                >
                    <OperatorWorkflowProgressPanel />
                </ProductDrawer>
            </section>
        </div>
    );
}

function MapaPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel">
                <PageHeader
                    eyebrow="Mapa y GPS"
                    title="Patio configurable."
                    subtitle="Primero se define el patio. Después se crean zonas, pilas, rutas y puntos de evidencia."
                />

                <div className="namiki-map-preview">
                    <div className="namiki-map-zone namiki-map-zone-a">Patio A</div>
                    <div className="namiki-map-zone namiki-map-zone-b">Clinker</div>
                    <div className="namiki-map-zone namiki-map-zone-c">Báscula</div>
                    <div className="namiki-map-pin">GPS</div>
                </div>
            </section>

            <section className="namiki-side-panel">
                <h2>Orden correcto</h2>
                <div className="namiki-card-stack">
                    <ProductCard title="1. Patio completo" text="Delimitar el universo de trabajo." />
                    <ProductCard title="2. Zonas internas" text="Separar descarga, almacén, revisión y básculas." />
                    <ProductCard title="3. Objetos" text="Registrar pilas, evidencias y movimientos." />
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer
                    title="Mapa operativo existente"
                    description="Conserva la vista de patio que ya estaba construida."
                >
                    <YardOperationsMapPanel />
                </ProductDrawer>

                <ProductDrawer
                    title="Preparación GPS"
                    description="Explica el siguiente módulo: ubicación real y perímetros."
                >
                    <PremiumGpsPreviewPanel />
                </ProductDrawer>
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
                    title="Cambios importantes."
                    subtitle="Supervisión puede revisar eventos clave sin leer logs técnicos."
                />

                <div className="namiki-card-stack">
                    <ProductCard title="Descarga registrada" text="El material entró al patio." />
                    <ProductCard title="Estado actualizado" text="Una pila pasó a revisión." />
                    <ProductCard title="Validación de supervisor" text="El estado quedó confirmado." />
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer
                    title="Panel real de historial"
                    description="Abre el timeline de auditoría que ya existe."
                >
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
                    title="Trabajo local, envío controlado."
                    subtitle="Diseñado para capturar en campo aunque la conexión no sea perfecta."
                />

                <div className="namiki-stat-grid">
                    <StatCard label="Campo" value="Local" text="Captura primero." />
                    <StatCard label="Nube" value="Preview" text="Revisión antes de aplicar." />
                    <StatCard label="Riesgo" value="Controlado" text="Sin cambios ciegos." />
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer
                    title="Panel real de sincronización"
                    description="Conserva export, preview y apply bloqueado."
                >
                    <SyncDemoStoryPanel />
                </ProductDrawer>
            </section>
        </div>
    );
}

function SistemaPage() {
    return (
        <div className="namiki-page-grid">
            <section className="namiki-hero-panel">
                <PageHeader
                    eyebrow="Sistema"
                    title="Herramientas internas."
                    subtitle="Esta sección es para validar que la demo y servicios sigan respondiendo."
                />

                <div className="namiki-card-stack">
                    <ProductCard title="API" text="Servicio que entrega información del patio." />
                    <ProductCard title="Edge" text="Base para captura local." />
                    <ProductCard title="Web" text="Interfaz para operar y presentar." />
                </div>
            </section>

            <section className="namiki-wide-panel">
                <ProductDrawer
                    title="Estado del sistema"
                    description="Valida Cloud API, Edge y conexión local."
                >
                    <RuntimeConnectionStatusPanel />
                </ProductDrawer>

                <ProductDrawer
                    title="Reset de demo"
                    description="Permite regresar datos demo a un estado limpio."
                >
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

    if (pageId === "materiales") {
        return <MaterialesPage />;
    }

    if (pageId === "mapa") {
        return <MapaPage />;
    }

    if (pageId === "historial") {
        return <HistorialPage />;
    }

    if (pageId === "envios") {
        return <EnviosPage />;
    }

    return <SistemaPage />;
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