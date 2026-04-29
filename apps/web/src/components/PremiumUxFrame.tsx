const uxSignals = [
    {
        label: "Objetivo",
        value: "Que se entienda rápido",
        detail: "El operador debe saber qué revisar sin leer párrafos largos.",
    },
    {
        label: "Vista",
        value: "Secciones separadas",
        detail: "Inicio, materiales, mapa, historial y sistema.",
    },
    {
        label: "Siguiente",
        value: "GPS real",
        detail: "Ubicación actual y dibujo de zonas en mapa.",
    },
] as const;

const qualityItems = [
    "Diseño oscuro",
    "Texto reducido",
    "Botones claros",
    "Secciones separadas",
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
                    <h2>Menos texto. Más control visual.</h2>
                    <p>
                        La pantalla debe servir para campo, supervisión y demo. Lo técnico queda escondido en secciones internas.
                    </p>
                </div>

                <div className="iyi-ux-quality-list">
                    {qualityItems.map((item) => (
                        <div key={item}>
                            <span />
                            {item}
                        </div>
                    ))}
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