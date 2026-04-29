const uxSignals = [
    {
        label: "Vista",
        value: "Secciones separadas",
        detail: "No más pantalla infinita.",
    },
    {
        label: "Uso",
        value: "Lenguaje operativo",
        detail: "Materiales, mapa, historial y sistema.",
    },
    {
        label: "Siguiente",
        value: "GPS real",
        detail: "Ubicación y dibujo de zonas.",
    },
] as const;

function UxSignalCard({
    label,
    value,
    detail,
}: {
    readonly label: string;
    readonly value: string;
    readonly detail: string;
}) {
    return (
        <div className="iyi-ux-signal">
            <p>{label}</p>
            <h3>{value}</h3>
            <span>{detail}</span>
        </div>
    );
}

export function PremiumUxFrame() {
    return (
        <section data-iyi-section="overview" id="premium-ux-frame" className="iyi-ux-frame">
            <div className="iyi-ux-frame-header">
                <div>
                    <p className="iyi-premium-kicker">Diseño operativo</p>
                    <h2>Menos texto. Más control.</h2>
                    <p>
                        La información queda separada por secciones para que operación y supervisión no se pierdan.
                    </p>
                </div>
            </div>

            <div className="iyi-ux-signal-grid">
                {uxSignals.map((signal) => (
                    <UxSignalCard
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