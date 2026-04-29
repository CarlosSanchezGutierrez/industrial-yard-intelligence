const executiveSignals = [
    {
        label: "Operación",
        value: "Patio visible",
        detail: "Material, zonas y estados en una sola vista.",
    },
    {
        label: "Control",
        value: "Menos papel",
        detail: "Registro digital para supervisores y operadores.",
    },
    {
        label: "Siguiente",
        value: "GPS y perímetros",
        detail: "Ubicación real, mapa y áreas delimitadas.",
    },
] as const;

const premiumMilestones = [
    "Ver material en patio",
    "Registrar cambios",
    "Revisar historial",
    "Preparar GPS real",
] as const;

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

                    <h1>
                        Control visual del patio y sus materiales.
                    </h1>

                    <p className="iyi-premium-hero-lead">
                        Una pantalla para ubicar pilas de material, revisar su estado y preparar captura GPS desde celular o laptop.
                    </p>

                    <div className="iyi-premium-hero-actions">
                        <a href="#yard-map">Ver mapa</a>
                        <a href="#stockpile-summary">Ver materiales</a>
                        <a href="#premium-gps-preview">Ver GPS</a>
                    </div>
                </div>

                <div className="iyi-premium-stage-card">
                    <p className="iyi-premium-kicker">Estado actual</p>
                    <h2>Demo operativa</h2>
                    <p>
                        Vista enfocada en explicar el patio, los materiales y el flujo de trabajo sin lenguaje técnico innecesario.
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