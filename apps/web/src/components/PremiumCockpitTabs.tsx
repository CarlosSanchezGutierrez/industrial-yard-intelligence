import { useEffect, useMemo, useState } from "react";

const tabs = [
    {
        id: "overview",
        label: "Inicio",
        title: "Inicio",
        description: "Resumen simple del patio y del sistema.",
    },
    {
        id: "operations",
        label: "Materiales",
        title: "Materiales",
        description: "Pilas, cantidades, estado y registro operativo.",
    },
    {
        id: "map",
        label: "Mapa",
        title: "Mapa",
        description: "Vista del patio, zonas y preparación para GPS.",
    },
    {
        id: "audit",
        label: "Historial",
        title: "Historial",
        description: "Cambios importantes para supervisión.",
    },
    {
        id: "sync",
        label: "Envíos",
        title: "Envíos",
        description: "Sincronización controlada de información.",
    },
    {
        id: "runtime",
        label: "Sistema",
        title: "Sistema",
        description: "Estado técnico interno.",
    },
    {
        id: "all",
        label: "Todo",
        title: "Vista completa",
        description: "Modo técnico para revisar todos los paneles.",
    },
] as const;

type PremiumTabId = (typeof tabs)[number]["id"];

function isPremiumTabId(value: unknown): value is PremiumTabId {
    return typeof value === "string" && tabs.some((tab) => tab.id === value);
}

function getInitialTab(): PremiumTabId {
    const hashValue = window.location.hash.replace("#/", "").replace("#", "");

    if (isPremiumTabId(hashValue)) {
        return hashValue;
    }

    return "overview";
}

function updateUrlWithoutScroll(tabId: PremiumTabId) {
    const nextHash = `#/${tabId}`;

    if (window.location.hash !== nextHash) {
        window.history.replaceState(null, "", nextHash);
    }
}

export function PremiumCockpitTabs() {
    const [activeTab, setActiveTab] = useState<PremiumTabId>(() => getInitialTab());

    const activeTabData = useMemo(
        () => tabs.find((tab) => tab.id === activeTab) ?? tabs[0],
        [activeTab],
    );

    function activateTab(tabId: PremiumTabId) {
        setActiveTab(tabId);
        updateUrlWithoutScroll(tabId);
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    useEffect(() => {
        document.body.dataset.iyiActiveSection = activeTab;
        updateUrlWithoutScroll(activeTab);

        return () => {
            delete document.body.dataset.iyiActiveSection;
        };
    }, [activeTab]);

    useEffect(() => {
        function handleNavigate(event: Event) {
            const detail = (event as CustomEvent<unknown>).detail;

            if (isPremiumTabId(detail)) {
                activateTab(detail);
            }
        }

        window.addEventListener("iyi:navigate", handleNavigate);

        return () => {
            window.removeEventListener("iyi:navigate", handleNavigate);
        };
    }, []);

    return (
        <section data-iyi-section="overview operations map audit sync runtime" className="iyi-premium-tabs" aria-label="Navegación principal">
            <div className="iyi-premium-tabs-header">
                <div>
                    <p className="iyi-premium-kicker">Vista</p>
                    <h2>{activeTabData.title}</h2>
                    <p>{activeTabData.description}</p>
                </div>

                <div className="iyi-premium-tabs-status">
                    <span />
                    Modo oscuro
                </div>
            </div>

            <div className="iyi-premium-tab-list" role="tablist" aria-label="Secciones">
                {tabs.map((tab) => (
                    <button
                        aria-selected={activeTab === tab.id}
                        className={activeTab === tab.id ? "is-active" : ""}
                        key={tab.id}
                        onClick={() => {
                            activateTab(tab.id);
                        }}
                        role="tab"
                        type="button"
                    >
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}