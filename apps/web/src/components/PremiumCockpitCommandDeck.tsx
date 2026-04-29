const commandCards = [
    {
        target: "operations",
        eyebrow: "01",
        title: "Materiales",
        value: "Ver pilas",
        text: "Consulta materiales y estados.",
    },
    {
        target: "map",
        eyebrow: "02",
        title: "Mapa",
        value: "Ver patio",
        text: "Revisa zonas y ubicación general.",
    },
    {
        target: "audit",
        eyebrow: "03",
        title: "Historial",
        value: "Ver cambios",
        text: "Consulta movimientos importantes.",
    },
    {
        target: "runtime",
        eyebrow: "04",
        title: "Sistema",
        value: "Revisar estado",
        text: "Validación técnica interna.",
    },
] as const;

function goTo(section: string) {
    window.dispatchEvent(
        new CustomEvent("iyi:navigate", {
            detail: section,
        }),
    );
}

function CommandCard({
    target,
    eyebrow,
    title,
    value,
    text,
}: {
    readonly target: string;
    readonly eyebrow: string;
    readonly title: string;
    readonly value: string;
    readonly text: string;
}) {
    return (
        <button className="iyi-command-card" onClick={() => goTo(target)} type="button">
            <div className="iyi-command-card-top">
                <span>{eyebrow}</span>
                <p>{title}</p>
            </div>
            <h3>{value}</h3>
            <p>{text}</p>
        </button>
    );
}

export function PremiumCockpitCommandDeck() {
    return (
        <section data-iyi-section="overview" id="premium-command-deck" className="iyi-command-deck">
            <div className="iyi-command-deck-header">
                <div>
                    <p className="iyi-premium-kicker">Accesos rápidos</p>
                    <h2>Entrar directo a lo importante.</h2>
                </div>
                <p>
                    Cada botón abre una sección limpia. Ya no manda al usuario a media página.
                </p>
            </div>

            <div className="iyi-command-grid">
                {commandCards.map((card) => (
                    <CommandCard
                        key={card.title}
                        target={card.target}
                        eyebrow={card.eyebrow}
                        title={card.title}
                        value={card.value}
                        text={card.text}
                    />
                ))}
            </div>
        </section>
    );
}