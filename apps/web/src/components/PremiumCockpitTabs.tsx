import { useEffect, useState } from "react";

const tabs = [
    {
        id: "overview",
        label: "Inicio",
        title: "Resumen",
        description: "Vista general para explicar qué hace el sistema.",
    },
    {
        id: "operations",
        label: "Materiales",
        title: "Materiales",
        description: "Pilas, cantidades, estado y flujo operativo.",
    },
    {
        id: "map",
        label: "Mapa",
        title: "Patio",
        description: "Zonas del patio, áreas y futura captura GPS.",
    },
    {
        id: "runtime",
        label: "Sistema",
        title: "Sistema",
        description: "Estado técnico solo para validación interna.",
    },
    {
        id: "audit",
        label: "Historial",
        title: "Historial",
        description: "Registro de cambios para supervisión.",
    },
    {
        id: "sync",
        label: "Sincronización",
        title: "Sincronización",
        description: "Envío controlado de datos entre campo y nube.",
    },
    {
        id: "all",
        label: "Todo",
        title: "Vista completa",
        description: "Modo técnico con todas las secciones visibles.",
    },
] as const;

type PremiumTabId = (typeof tabs)[number]["id"];

function setBodySection(sectionId: PremiumTabId) {
    document.body.dataset.iyiActiveSection = sectionId;
}

export function PremiumCockpitTabs() {
    const [activeTab, setActiveTab] = useState<PremiumTabId>("overview");

    useEffect(() => {
        setBodySection(activeTab);

        return () => {
            delete document.body.dataset.iyiActiveSection;
        };
    }, [activeTab]);

    const activeTabData = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

    return (
        <section data-iyi-section="overview operations map runtime audit sync" className="iyi-premium-tabs" aria-label="Navegación principal">
            <div className="iyi-premium-tabs-header">
                <div>
                    <p className="iyi-premium-kicker">Modo de vista</p>
                    <h2>{activeTabData.title}</h2>
                    <p>{activeTabData.description}</p>
                </div>

                <div className="iyi-premium-tabs-status">
                    <span />
                    Vista limpia
                </div>
            </div>

            <div className="iyi-premium-tab-list" role="tablist" aria-label="Secciones del sistema">
                {tabs.map((tab) => (
                    <button
                        aria-selected={activeTab === tab.id}
                        className={activeTab === tab.id ? "is-active" : ""}
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                        }}
                        role="tab"
                        type="button"
                    >
                        <span>{tab.label}</span>
                        <small>{tab.title}</small>
                    </button>
                ))}
            </div>
        </section>
    );
}