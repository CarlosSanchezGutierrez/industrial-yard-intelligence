import { useEffect, useMemo, useState } from "react";

const pages = [
    {
        id: "inicio",
        label: "Inicio",
        title: "Control del patio en una sola vista",
        subtitle: "Materiales, zonas, historial y GPS sin depender de hojas sueltas o mensajes perdidos.",
    },
    {
        id: "materiales",
        label: "Materiales",
        title: "Materiales visibles y ordenados",
        subtitle: "Consulta qué hay en el patio, dónde está y qué necesita revisión.",
    },
    {
        id: "mapa",
        label: "Mapa",
        title: "Patio industrial configurable",
        subtitle: "Define el universo del patio y después registra zonas, pilas y movimientos.",
    },
    {
        id: "historial",
        label: "Historial",
        title: "Cambios importantes",
        subtitle: "Registro simple para saber qué cambió, cuándo y por quién.",
    },
    {
        id: "envios",
        label: "Envíos",
        title: "Trabajo de campo sincronizable",
        subtitle: "El sistema se prepara para capturar datos en campo y enviarlos después.",
    },
    {
        id: "sistema",
        label: "Sistema",
        title: "Estado interno",
        subtitle: "Área técnica separada para validar servicios, conexión y pruebas.",
    },
] as const;

type ProductPageId = (typeof pages)[number]["id"];

const materialCards = [
    { name: "Pet coke", zone: "Patio A", status: "Operativo", amount: "12,400 t" },
    { name: "Clinker", zone: "Patio B", status: "Revisión", amount: "8,600 t" },
    { name: "Chatarra HMS", zone: "Zona acero", status: "Operativo", amount: "3,200 t" },
] as const;

const steps = [
    { title: "1. Descargar", text: "Llega material al patio." },
    { title: "2. Registrar", text: "Se guarda ubicación, tipo y cantidad." },
    { title: "3. Revisar", text: "Supervisor valida estado y cambios." },
    { title: "4. Consultar", text: "El historial queda disponible." },
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
        <div className="namiki-stat-card">
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{text}</span>
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
        <div className="namiki-product-card">
            <h3>{title}</h3>
            <p>{text}</p>
        </div>
    );
}

function PageHeader({
    title,
    subtitle,
}: {
    readonly title: string;
    readonly subtitle: string;
}) {
    return (
        <div className="namiki-page-header">
            <p>Modelo Namiki</p>
            <h1>{title}</h1>
            <span>{subtitle}</span>
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
            <div className="namiki-hero-panel">
                <PageHeader
                    title="Tu patio, visible y bajo control."
                    subtitle="Una herramienta para ubicar materiales, registrar movimientos y preparar captura GPS real."
                />

                <div className="namiki-action-row">
                    <button onClick={() => goToPage("mapa")} type="button">Ver mapa</button>
                    <button onClick={() => goToPage("materiales")} type="button">Ver materiales</button>
                    <button onClick={() => goToPage("historial")} type="button">Ver historial</button>
                </div>
            </div>

            <div className="namiki-side-panel">
                <h2>Qué resuelve</h2>
                <ProductCard title="Menos desorden" text="La información deja de depender de papel, Excel o mensajes sueltos." />
                <ProductCard title="Más visibilidad" text="El supervisor puede ver materiales, zonas y estados en un solo lugar." />
                <ProductCard title="Base para GPS" text="El sistema queda listo para registrar ubicación y perímetros reales." />
            </div>

            <div className="namiki-stat-grid">
                <StatCard label="Materiales" value="7" text="Pilas visibles en demo" />
                <StatCard label="Zonas" value="5" text="Áreas configurables" />
                <StatCard label="Modo" value="Local" text="Preparado para operar en patio" />
            </div>
        </div>
    );
}

function MaterialesPage() {
    return (
        <div className="namiki-page-grid">
            <PageHeader
                title="Materiales visibles."
                subtitle="Lista simple para saber qué hay en patio y qué necesita atención."
            />

            <div className="namiki-material-grid">
                {materialCards.map((material) => (
                    <div className="namiki-material-card" key={material.name}>
                        <div>
                            <h3>{material.name}</h3>
                            <p>{material.zone}</p>
                        </div>
                        <strong>{material.amount}</strong>
                        <span>{material.status}</span>
                    </div>
                ))}
            </div>

            <div className="namiki-step-grid">
                {steps.map((step) => (
                    <ProductCard key={step.title} title={step.title} text={step.text} />
                ))}
            </div>
        </div>
    );
}

function MapaPage() {
    return (
        <div className="namiki-map-layout">
            <div>
                <PageHeader
                    title="Mapa del patio."
                    subtitle="Primero se define el patio completo. Después se agregan zonas, pilas y movimientos."
                />

                <div className="namiki-step-grid">
                    <ProductCard title="Patio general" text="Perímetro completo de la terminal o zona de trabajo." />
                    <ProductCard title="Zonas internas" text="Descarga, almacenamiento, revisión, básculas o rutas." />
                    <ProductCard title="Objetos" text="Pilas, equipos, puntos de evidencia y áreas restringidas." />
                </div>
            </div>

            <div className="namiki-map-card">
                <div className="namiki-map-grid">
                    <div className="namiki-map-zone namiki-map-zone-a">Patio A</div>
                    <div className="namiki-map-zone namiki-map-zone-b">Clinker</div>
                    <div className="namiki-map-zone namiki-map-zone-c">Báscula</div>
                    <div className="namiki-map-pin">GPS</div>
                </div>
            </div>
        </div>
    );
}

function HistorialPage() {
    return (
        <div className="namiki-page-grid">
            <PageHeader
                title="Historial claro."
                subtitle="Solo lo importante: cambios, estado y responsable."
            />

            <div className="namiki-timeline">
                <ProductCard title="08:20 · Descarga registrada" text="Pet coke llegó a Patio A." />
                <ProductCard title="09:05 · Material actualizado" text="Clinker pasó a revisión." />
                <ProductCard title="10:10 · Supervisor validó" text="Chatarra HMS quedó operativa." />
            </div>
        </div>
    );
}

function EnviosPage() {
    return (
        <div className="namiki-page-grid">
            <PageHeader
                title="Datos listos para enviarse."
                subtitle="Pensado para campo: capturar primero, sincronizar después."
            />

            <div className="namiki-stat-grid">
                <StatCard label="Campo" value="Captura local" text="Útil cuando la conexión es mala." />
                <StatCard label="Nube" value="Envío controlado" text="La información se manda cuando está lista." />
                <StatCard label="Seguridad" value="Sin cambios ciegos" text="Antes de aplicar, se revisa." />
            </div>
        </div>
    );
}

function SistemaPage() {
    return (
        <div className="namiki-page-grid">
            <PageHeader
                title="Sistema interno."
                subtitle="Esta sección es para desarrollo, pruebas y validación técnica."
            />

            <div className="namiki-step-grid">
                <ProductCard title="API local" text="Servicio que entrega información del patio." />
                <ProductCard title="Edge" text="Base para operación local y trabajo sin internet estable." />
                <ProductCard title="Web" text="Pantalla de operación para usuario final." />
            </div>

            <div className="namiki-warning-card">
                <h3>Panel técnico oculto</h3>
                <p>
                    Los paneles anteriores siguen existiendo para pruebas, pero no se muestran al operador.
                    Usa el modo técnico solo cuando necesites depurar.
                </p>
            </div>
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

    useEffect(() => {
        document.body.dataset.iyiProductShell = "on";

        return () => {
            delete document.body.dataset.iyiProductShell;
        };
    }, []);

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
                            <small>{page.subtitle}</small>
                        </button>
                    ))}
                </nav>
            ) : null}

            <div className="namiki-current-page">
                <p>Sección actual</p>
                <h2>{activePageData.title}</h2>
                <span>{activePageData.subtitle}</span>
            </div>

            <main className="namiki-page-surface">
                {renderPage(activePage, goToPage)}
            </main>
        </section>
    );
}