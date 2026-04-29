const executiveSignals = [
    {
        label: "Modelo",
        value: "Local-first SaaS",
        detail: "Edge operativo + Cloud API escalable",
    },
    {
        label: "Operacion",
        value: "Patio visible",
        detail: "Stockpiles, zonas, lifecycle y auditoria",
    },
    {
        label: "Demo",
        value: "Investor-ready",
        detail: "Narrativa tecnica y ejecutiva integrada",
    },
] as const;

const premiumMilestones = [
    "Arquitectura v1 cerrada",
    "Cockpit demo polish",
    "Sync edge-to-cloud seguro",
    "Mapa/GPS como siguiente modulo",
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
        <section id="premium-cockpit-hero" className="iyi-premium-hero">
            <div className="iyi-premium-hero-grid">
                <div className="iyi-premium-hero-copy">
                    <div className="iyi-premium-eyebrow">
                        <span className="iyi-premium-live-dot" />
                        Industrial Yard Intelligence / Modelo Namiki
                    </div>

                    <h1>
                        Sistema operativo visual para patios industriales de material a granel.
                    </h1>

                    <p className="iyi-premium-hero-lead">
                        Cockpit local-first para registrar, localizar, validar y auditar stockpiles,
                        preparado para evolucionar a SaaS industrial multi-terminal.
                    </p>

                    <div className="iyi-premium-hero-actions">
                        <a href="#runtime-status">Ver runtime</a>
                        <a href="#stockpile-summary">Ver operacion</a>
                        <a href="#yard-map">Ver mapa</a>
                    </div>
                </div>

                <div className="iyi-premium-stage-card">
                    <p className="iyi-premium-kicker">Fase actual</p>
                    <h2>Phase 2.5 UI Premium</h2>
                    <p>
                        Capa visual para transformar el prototipo tecnico en una experiencia de producto
                        vendible para Cooper/T. Smith, incubadora e inversionistas.
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