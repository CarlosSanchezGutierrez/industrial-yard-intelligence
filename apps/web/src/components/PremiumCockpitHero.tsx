const executiveSignals = [
    {
        label: "Patio",
        value: "Material visible",
        detail: "Ver qué hay, dónde está y en qué estado se encuentra.",
    },
    {
        label: "Registro",
        value: "Menos papel",
        detail: "Captura digital para operación y supervisión.",
    },
    {
        label: "GPS",
        value: "Siguiente paso",
        detail: "Ubicación real y dibujo de perímetros.",
    },
] as const;

const premiumMilestones = [
    "Ver materiales",
    "Registrar movimientos",
    "Consultar historial",
    "Dibujar zonas con GPS",
] as const;

function goTo(section: string) {
    window.dispatchEvent(
        new CustomEvent("iyi:navigate", {
            detail: section,
        }),
    );
}

function ExecutiveSignalCard({
    label,
    value,
    detail,
}: {
    readonly label: string;
    readonly value: string;
    readonly detail: string;
}) {
    return (
        <div className="iyi-premium-signal-card">
            <p className="iyi-premium-kicker">{label}</p>
            <h3>{value}</h3>
            <p>{detail}</p>
        </div>
    );
}

export function PremiumCockpitHero() {
    return (
        <section data-iyi-section="overview" id="premium-cockpit-hero" className="iyi-premium-hero">
            <div className="iyi-premium-hero-grid">
                <div className="iyi-premium-hero-copy">
                    <div className="iyi-premium-eyebrow">
                        <span className="iyi-premium-live-dot" />
                        Modelo Namiki · Patio industrial
                    </div>

                    <h1>Control visual del patio.</h1>

                    <p className="iyi-premium-hero-lead">
                        Ubica materiales, revisa estados y prepara captura GPS desde celular o laptop.
                    </p>

                    <div className="iyi-premium-hero-actions">
                        <button onClick={() => goTo("map")} type="button">Mapa</button>
                        <button onClick={() => goTo("operations")} type="button">Materiales</button>
                        <button onClick={() => goTo("audit")} type="button">Historial</button>
                    </div>
                </div>

                <div className="iyi-premium-stage-card">
                    <p className="iyi-premium-kicker">Estado actual</p>
                    <h2>Demo operativa</h2>
                    <p>
                        Pantalla enfocada en patio, materiales y supervisión. Lo técnico queda separado.
                    </p>

                    <div className="iyi-premium-milestones">
                        {premiumMilestones.map((milestone) => (
                            <div className="iyi-premium-milestone" key={milestone}>
                                <span />
                                {milestone}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="iyi-premium-signals">
                {executiveSignals.map((signal) => (
                    <ExecutiveSignalCard
                        key={signal.label}
                        label={signal.label}
                        value={signal.value}
                        detail={signal.detail}
                    />
                ))}
            </div>
        </section>
    );
}