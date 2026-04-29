const valueMetrics = [
    {
        label: "Operacion",
        value: "Stockpiles trazables",
        description: "Cada pila deja de ser solo una ubicacion fisica y se vuelve un activo operacional visible.",
    },
    {
        label: "Control",
        value: "Auditoria visible",
        description: "Los cambios importantes pueden revisarse por evento y por stockpile.",
    },
    {
        label: "Resiliencia",
        value: "Local-first",
        description: "El edge permite pensar en operacion de patio aun con conectividad limitada.",
    },
    {
        label: "Escala",
        value: "SaaS-ready",
        description: "La separacion API, Edge, Web y paquetes compartidos permite crecer a varios patios.",
    },
] as const;

const buyerOutcomes = [
    "Menos dependencia de registros manuales dispersos.",
    "Mayor trazabilidad para supervisores y auditorias internas.",
    "Base tecnica para conectar evidencia, GPS, patios y material.",
    "Camino claro hacia plataforma multi-terminal y multi-tenant.",
] as const;

const demoProofPoints = [
    {
        title: "Captura",
        text: "El cockpit registra stockpiles contra el Cloud API.",
    },
    {
        title: "Validacion",
        text: "El lifecycle usa reglas de dominio compartidas.",
    },
    {
        title: "Auditoria",
        text: "Las mutaciones generan historial consultable.",
    },
    {
        title: "Sync",
        text: "Edge exporta paquetes y Cloud preview valida sin aplicar datos.",
    },
] as const;

function ValueMetricCard({
    label,
    value,
    description,
}: {
    readonly label: string;
    readonly value: string;
    readonly description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {label}
            </p>
            <h3 className="mt-2 text-base font-semibold text-slate-950">{value}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
    );
}

function ProofPointCard({
    title,
    text,
}: {
    readonly title: string;
    readonly text: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
        </div>
    );
}

export function IndustrialValueSnapshotPanel() {
    return (
        <section id="industrial-value" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Industrial value snapshot
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                        Traduccion de arquitectura a valor de negocio
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Este panel resume por que Modelo Namiki no es solo un prototipo de software:
                        es una base para convertir patios industriales en operaciones trazables,
                        auditables y escalables.
                    </p>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {valueMetrics.map((metric) => (
                            <ValueMetricCard
                                key={metric.label}
                                label={metric.label}
                                value={metric.value}
                                description={metric.description}
                            />
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl bg-slate-950 p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                        Executive narrative
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
                        De patio fisico a inteligencia operacional
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        Cooper/T. Smith puede visualizar material, registrar cambios, auditar decisiones
                        y preparar sincronizacion edge-to-cloud sin comprometer datos reales antes de tiempo.
                    </p>

                    <div className="mt-5 grid gap-3">
                        {demoProofPoints.map((proofPoint) => (
                            <ProofPointCard
                                key={proofPoint.title}
                                title={proofPoint.title}
                                text={proofPoint.text}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Buyer outcomes
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {buyerOutcomes.map((outcome) => (
                        <div
                            className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700"
                            key={outcome}
                        >
                            {outcome}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}