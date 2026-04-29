const commandCards = [
    {
        eyebrow: "01",
        title: "Operacion",
        value: "Stockpiles y patio",
        text: "Material, zonas, estados y flujo operador en una vista de producto.",
        href: "#stockpile-summary",
    },
    {
        eyebrow: "02",
        title: "Mapa",
        value: "Base espacial",
        text: "La capa visual que prepara GPS, perimetros y objetos dentro del patio.",
        href: "#yard-map",
    },
    {
        eyebrow: "03",
        title: "Runtime",
        value: "Stack local",
        text: "Cloud API, Edge y Web cockpit listos para demo controlada.",
        href: "#runtime-status",
    },
    {
        eyebrow: "04",
        title: "Siguiente modulo",
        value: "GPS real",
        text: "Ubicacion del dispositivo, mapa, dibujo de poligonos y registro de zonas.",
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
        <section id="premium-command-deck" className="iyi-command-deck">
            <div className="iyi-command-deck-header">
                <div>
                    <p className="iyi-premium-kicker">Product cockpit</p>
                    <h2>Demo visual de alto impacto, sin scroll técnico perdido.</h2>
                </div>
                <p>
                    Se reorganiza la experiencia para que primero se entienda el producto, luego la operación,
                    después auditoría/sync y finalmente la evolución GPS.
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