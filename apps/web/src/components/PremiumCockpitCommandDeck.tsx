const commandCards = [
    {
        eyebrow: "01",
        title: "Materiales",
        value: "Ver pilas",
        text: "Consulta qué material está en el patio y en qué estado está.",
        href: "#stockpile-summary",
    },
    {
        eyebrow: "02",
        title: "Mapa",
        value: "Ver patio",
        text: "Ubica zonas, materiales y áreas de trabajo.",
        href: "#yard-map",
    },
    {
        eyebrow: "03",
        title: "Sistema",
        value: "Revisar conexión",
        text: "Valida si el sistema local está respondiendo.",
        href: "#runtime-status",
    },
    {
        eyebrow: "04",
        title: "GPS",
        value: "Preparar captura",
        text: "Siguiente paso: ubicación real y trazado de perímetros.",
        href: "#premium-gps-preview",
    },
] as const;

function CommandCard({
    eyebrow,
    title,
    value,
    text,
    href,
}: {
    readonly eyebrow: string;
    readonly title: string;
    readonly value: string;
    readonly text: string;
    readonly href: string;
}) {
    return (
        <a className="iyi-command-card" href={href}>
            <div className="iyi-command-card-top">
                <span>{eyebrow}</span>
                <p>{title}</p>
            </div>
            <h3>{value}</h3>
            <p>{text}</p>
        </a>
    );
}

export function PremiumCockpitCommandDeck() {
    return (
        <section data-iyi-section="overview" id="premium-command-deck" className="iyi-command-deck">
            <div className="iyi-command-deck-header">
                <div>
                    <p className="iyi-premium-kicker">Accesos rápidos</p>
                    <h2>Lo importante primero.</h2>
                </div>
                <p>
                    Cuatro entradas simples para presentar la demo sin perderse entre paneles técnicos.
                </p>
            </div>

            <div className="iyi-command-grid">
                {commandCards.map((card) => (
                    <CommandCard
                        key={card.title}
                        eyebrow={card.eyebrow}
                        title={card.title}
                        value={card.value}
                        text={card.text}
                        href={card.href}
                    />
                ))}
            </div>
        </section>
    );
}