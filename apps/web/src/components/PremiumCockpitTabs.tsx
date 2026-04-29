import { useEffect, useState } from "react";

const tabs = [
    {
        id: "overview",
        label: "Overview",
        title: "Producto",
        description: "Hero, narrativa, valor ejecutivo y estructura general.",
    },
    {
        id: "operations",
        label: "Operación",
        title: "Stockpiles",
        description: "Inventario, flujo operador y lifecycle del material.",
    },
    {
        id: "map",
        label: "Mapa / GPS",
        title: "Patio",
        description: "Vista espacial, zonas, perímetros y siguiente módulo GPS.",
    },
    {
        id: "runtime",
        label: "Runtime",
        title: "Stack",
        description: "Cloud API, Edge, reset y validación local.",
    },
    {
        id: "audit",
        label: "Auditoría",
        title: "Trazabilidad",
        description: "Eventos, historial y explicación supervisor-facing.",
    },
    {
        id: "sync",
        label: "Sync",
        title: "Edge → Cloud",
        description: "Export, preview y apply bloqueado.",
    },
    {
        id: "all",
        label: "Todo",
        title: "Full cockpit",
        description: "Muestra todas las secciones para revisión técnica.",
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
        <section className="iyi-premium-tabs" aria-label="Premium cockpit navigation">
            <div className="iyi-premium-tabs-header">
                <div>
                    <p className="iyi-premium-kicker">Experience mode</p>
                    <h2>{activeTabData.title}</h2>
                    <p>{activeTabData.description}</p>
                </div>

                <div className="iyi-premium-tabs-status">
                    <span />
                    UI premium activa
                </div>
            </div>

            <div className="iyi-premium-tab-list" role="tablist" aria-label="Cockpit sections">
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