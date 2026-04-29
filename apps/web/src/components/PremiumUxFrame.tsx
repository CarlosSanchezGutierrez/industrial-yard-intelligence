const uxSignals = [
    {
        label: "Focus",
        value: "Demo ejecutiva",
        detail: "Menos ruido tecnico, mas narrativa de producto.",
    },
    {
        label: "UX",
        value: "Secciones claras",
        detail: "Tabs, jerarquia, cards y densidad controlada.",
    },
    {
        label: "Next",
        value: "GPS real",
        detail: "Mapa, ubicacion, perimetros y zonas guardables.",
    },
] as const;

const qualityItems = [
    "Premium shell aplicado",
    "Paneles agrupados por modo",
    "Text walls reducidos visualmente",
    "Botones y formularios normalizados",
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
        <section data-iyi-section="overview operations map runtime audit sync" id="premium-ux-frame" className="iyi-ux-frame">
            <div className="iyi-ux-frame-header">
                <div>
                    <p className="iyi-premium-kicker">UX quality pass</p>
                    <h2>Producto primero, paneles técnicos después.</h2>
                    <p>
                        Este cockpit ya no debe sentirse como una lista de pruebas. Debe sentirse como una app
                        industrial vendible: clara, premium, navegable y preparada para GPS.
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